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
if (!isset($data['title']) || empty($data['title']) ||
    !isset($data['election_type']) || empty($data['election_type']) ||
    !isset($data['start_date']) || empty($data['start_date']) ||
    !isset($data['end_date']) || empty($data['end_date'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Validate dates
$start_date = $data['start_date'];
$end_date = $data['end_date'];
$current_date = date('Y-m-d H:i:s');

if (strtotime($start_date) <= strtotime($current_date)) {
    echo json_encode(["success" => false, "message" => "Start date must be in the future"]);
    exit;
}

if (strtotime($end_date) <= strtotime($start_date)) {
    echo json_encode(["success" => false, "message" => "End date must be after start date"]);
    exit;
}

// Sanitize input
$title = mysqli_real_escape_string($conn, $data['title']);
$description = mysqli_real_escape_string($conn, $data['description'] ?? '');
$election_type = mysqli_real_escape_string($conn, $data['election_type']);
$created_by = $_SESSION['user_id'];

// Determine status based on dates
$status = (strtotime($start_date) <= strtotime($current_date) && strtotime($end_date) >= strtotime($current_date))
    ? 'active' : 'upcoming';

// Insert election
$sql = "INSERT INTO elections (title, description, election_type, start_date, end_date, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssi", $title, $description, $election_type, $start_date, $end_date, $status, $created_by);

if ($stmt->execute()) {
    $election_id = $conn->insert_id;

    // Create default election settings
    $settings_sql = "INSERT INTO election_settings (election_id) VALUES (?)";
    $settings_stmt = $conn->prepare($settings_sql);
    $settings_stmt->bind_param("i", $election_id);
    $settings_stmt->execute();

    // Log the action
    $action = "create_election";
    $table_name = "elections";
    $record_id = $election_id;
    $new_values = json_encode($data);
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'];

    $log_sql = "INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    $log_stmt->bind_param("ississs", $created_by, $action, $table_name, $record_id, $new_values, $ip_address, $user_agent);
    $log_stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Election created successfully",
        "election_id" => $election_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error creating election: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>