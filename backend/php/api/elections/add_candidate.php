<?php
require_once "../../config/header.php";
require_once "../../config/database.php";

// Check if user is authenticated and is admin
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Access denied. Admin only."]);
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
    !isset($data['name']) || empty($data['name']) ||
    !isset($data['position']) || empty($data['position'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Check if election exists and is not completed
$election_id = $data['election_id'];
$check_sql = "SELECT status FROM elections WHERE id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $election_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found"]);
    exit;
}

$election_data = $check_result->fetch_assoc();
if ($election_data['status'] === 'completed') {
    echo json_encode(["success" => false, "message" => "Cannot add candidates to completed election"]);
    exit;
}

// Sanitize input
$name = mysqli_real_escape_string($conn, $data['name']);
$manifesto = mysqli_real_escape_string($conn, $data['manifesto'] ?? '');
$position = mysqli_real_escape_string($conn, $data['position']);
$photo = isset($data['photo']) ? mysqli_real_escape_string($conn, $data['photo']) : null;

// Check if candidate already exists for this election and position
$check_candidate_sql = "SELECT id FROM candidates WHERE election_id = ? AND name = ? AND position = ?";
$check_candidate_stmt = $conn->prepare($check_candidate_sql);
$check_candidate_stmt->bind_param("iss", $election_id, $name, $position);
$check_candidate_stmt->execute();
$check_candidate_result = $check_candidate_stmt->get_result();

if ($check_candidate_result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Candidate already exists for this election and position"]);
    exit;
}

// Check max candidates limit for this election
$candidates_count_sql = "SELECT COUNT(*) as count FROM candidates WHERE election_id = ?";
$candidates_count_stmt = $conn->prepare($candidates_count_sql);
$candidates_count_stmt->bind_param("i", $election_id);
$candidates_count_stmt->execute();
$candidates_count_result = $candidates_count_stmt->get_result();
$candidates_count = $candidates_count_result->fetch_assoc()['count'];

// Get election settings for max candidates
$settings_sql = "SELECT max_candidates_per_position FROM election_settings WHERE election_id = ?";
$settings_stmt = $conn->prepare($settings_sql);
$settings_stmt->bind_param("i", $election_id);
$settings_stmt->execute();
$settings_result = $settings_stmt->get_result();
$settings_data = $settings_result->fetch_assoc();
$max_candidates = $settings_data['max_candidates_per_position'] ?? 10;

if ($candidates_count >= $max_candidates) {
    echo json_encode(["success" => false, "message" => "Maximum number of candidates reached for this election"]);
    exit;
}

// Insert candidate
$sql = "INSERT INTO candidates (election_id, name, photo, manifesto, position)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("issss", $election_id, $name, $photo, $manifesto, $position);

if ($stmt->execute()) {
    $candidate_id = $conn->insert_id;

    // Log the action
    $action = "add_candidate";
    $table_name = "candidates";
    $record_id = $candidate_id;
    $admin_id = $_SESSION['user_id'];
    $new_values = json_encode($data);
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'];

    $log_sql = "INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    $log_stmt->bind_param("ississs", $admin_id, $action, $table_name, $record_id, $new_values, $ip_address, $user_agent);
    $log_stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Candidate added successfully",
        "candidate_id" => $candidate_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error adding candidate: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>