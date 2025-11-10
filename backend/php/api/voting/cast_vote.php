<?php
require_once "../../config/header.php";
require_once "../../config/database.php";

// Check if user is authenticated
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Access denied. Please login."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['election_id']) || empty($data['election_id']) ||
    !isset($data['candidate_id']) || empty($data['candidate_id']) ||
    !isset($data['fingerprint_template']) || empty($data['fingerprint_template'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$election_id = $data['election_id'];
$candidate_id = $data['candidate_id'];
$fingerprint_template = $data['fingerprint_template'];
$user_id = $_SESSION['user_id'];

// Check if election exists and is active
$election_sql = "SELECT * FROM elections WHERE id = ? AND status = 'active'";
$election_stmt = $conn->prepare($election_sql);
$election_stmt->bind_param("i", $election_id);
$election_stmt->execute();
$election_result = $election_stmt->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found or not active"]);
    exit;
}

$election_data = $election_result->fetch_assoc();

// Check if election is within valid time range
$current_time = date('Y-m-d H:i:s');
if (strtotime($current_time) < strtotime($election_data['start_date']) ||
    strtotime($current_time) > strtotime($election_data['end_date'])) {
    echo json_encode(["success" => false, "message" => "Election is not currently active"]);
    exit;
}

// Check if candidate exists for this election
$candidate_sql = "SELECT * FROM candidates WHERE id = ? AND election_id = ?";
$candidate_stmt = $conn->prepare($candidate_sql);
$candidate_stmt->bind_param("ii", $candidate_id, $election_id);
$candidate_stmt->execute();
$candidate_result = $candidate_stmt->get_result();

if ($candidate_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Candidate not found for this election"]);
    exit;
}

// Check if user has already voted in this election
$vote_check_sql = "SELECT COUNT(*) as has_voted FROM votes WHERE user_id = ? AND election_id = ?";
$vote_check_stmt = $conn->prepare($vote_check_sql);
$vote_check_stmt->bind_param("ii", $user_id, $election_id);
$vote_check_stmt->execute();
$vote_check_result = $vote_check_stmt->get_result();
$vote_check_data = $vote_check_result->fetch_assoc();

if ($vote_check_data['has_voted'] > 0) {
    echo json_encode(["success" => false, "message" => "You have already voted in this election"]);
    exit;
}

// Get user's stored fingerprint template
$stored_template_sql = "SELECT template FROM biometric WHERE user_id = ?";
$stored_template_stmt = $conn->prepare($stored_template_sql);
$stored_template_stmt->bind_param("i", $user_id);
$stored_template_stmt->execute();
$stored_template_result = $stored_template_stmt->get_result();

if ($stored_template_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No fingerprint template found for this user"]);
    exit;
}

$stored_template_data = $stored_template_result->fetch_assoc();
$stored_template = $stored_template_data['template'];

// Verify fingerprint template by calling Java backend
$java_api_url = "http://localhost:8080/api/fingerprint/match";
$fingerprint_data = [
    'template1' => $stored_template,
    'template2' => $fingerprint_template
];

$ch = curl_init($java_api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fingerprint_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    echo json_encode(["success" => false, "message" => "Fingerprint verification service unavailable"]);
    exit;
}

$fingerprint_result = json_decode($response, true);

if (!$fingerprint_result['match']) {
    echo json_encode(["success" => false, "message" => "Fingerprint verification failed"]);
    exit;
}

// Start transaction for vote recording
$conn->begin_transaction();

try {
    // Record the vote
    $vote_sql = "INSERT INTO votes (user_id, election_id, candidate_id, fingerprint_template)
                 VALUES (?, ?, ?, ?)";
    $vote_stmt = $conn->prepare($vote_sql);
    $vote_stmt->bind_param("iiis", $user_id, $election_id, $candidate_id, $fingerprint_template);
    $vote_stmt->execute();

    // Update candidate vote count
    $update_candidate_sql = "UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?";
    $update_candidate_stmt = $conn->prepare($update_candidate_sql);
    $update_candidate_stmt->bind_param("i", $candidate_id);
    $update_candidate_stmt->execute();

    // Log the action
    $action = "cast_vote";
    $table_name = "votes";
    $new_values = json_encode([
        'user_id' => $user_id,
        'election_id' => $election_id,
        'candidate_id' => $candidate_id
    ]);
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'];

    $log_sql = "INSERT INTO audit_log (user_id, action, table_name, new_values, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    $log_stmt->bind_param("isssss", $user_id, $action, $table_name, $new_values, $ip_address, $user_agent);
    $log_stmt->execute();

    // Commit transaction
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Vote cast successfully",
        "vote_time" => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Error casting vote: " . $e->getMessage()
    ]);
}

$conn->close();
?>