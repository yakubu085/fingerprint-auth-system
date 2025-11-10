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
if (!isset($data['election_id']) || empty($data['election_id'])) {
    echo json_encode(["success" => false, "message" => "Election ID is required"]);
    exit;
}

$election_id = $data['election_id'];

// Check if election exists and get its data
$check_sql = "SELECT * FROM elections WHERE id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $election_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found"]);
    exit;
}

$election_data = $check_result->fetch_assoc();

// Check if election is active
if ($election_data['status'] === 'active') {
    echo json_encode(["success" => false, "message" => "Cannot delete active election"]);
    exit;
}

// Check if there are any votes for this election
$votes_check_sql = "SELECT COUNT(*) as vote_count FROM votes WHERE election_id = ?";
$votes_check_stmt = $conn->prepare($votes_check_sql);
$votes_check_stmt->bind_param("i", $election_id);
$votes_check_stmt->execute();
$votes_check_result = $votes_check_stmt->get_result();
$votes_data = $votes_check_result->fetch_assoc();

if ($votes_data['vote_count'] > 0) {
    echo json_encode(["success" => false, "message" => "Cannot delete election with existing votes"]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Delete candidates for this election
    $delete_candidates_sql = "DELETE FROM candidates WHERE election_id = ?";
    $delete_candidates_stmt = $conn->prepare($delete_candidates_sql);
    $delete_candidates_stmt->bind_param("i", $election_id);
    $delete_candidates_stmt->execute();

    // Delete election settings
    $delete_settings_sql = "DELETE FROM election_settings WHERE election_id = ?";
    $delete_settings_stmt = $conn->prepare($delete_settings_sql);
    $delete_settings_stmt->bind_param("i", $election_id);
    $delete_settings_stmt->execute();

    // Delete the election
    $delete_election_sql = "DELETE FROM elections WHERE id = ?";
    $delete_election_stmt = $conn->prepare($delete_election_sql);
    $delete_election_stmt->bind_param("i", $election_id);
    $delete_election_stmt->execute();

    // Log the action
    $action = "delete_election";
    $table_name = "elections";
    $admin_id = $_SESSION['user_id'];
    $old_values = json_encode($election_data);
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'];

    $log_sql = "INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    $log_stmt->bind_param("ississs", $admin_id, $action, $table_name, $election_id, $old_values, $ip_address, $user_agent);
    $log_stmt->execute();

    // Commit transaction
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Election deleted successfully"
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Error deleting election: " . $e->getMessage()
    ]);
}

$conn->close();
?>