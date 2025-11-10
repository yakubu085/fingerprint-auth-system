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

// Check if election exists
$check_sql = "SELECT * FROM elections WHERE id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("i", $election_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found"]);
    exit;
}

$old_election_data = $check_result->fetch_assoc();

// Check if election is already active
if ($old_election_data['status'] === 'active') {
    echo json_encode(["success" => false, "message" => "Cannot modify active election"]);
    exit;
}

// Check if election is completed
if ($old_election_data['status'] === 'completed') {
    echo json_encode(["success" => false, "message" => "Cannot modify completed election"]);
    exit;
}

// Prepare update data
$update_fields = [];
$params = [];
$types = "";

if (isset($data['title']) && !empty($data['title'])) {
    $update_fields[] = "title = ?";
    $params[] = mysqli_real_escape_string($conn, $data['title']);
    $types .= "s";
}

if (isset($data['description'])) {
    $update_fields[] = "description = ?";
    $params[] = mysqli_real_escape_string($conn, $data['description']);
    $types .= "s";
}

if (isset($data['election_type']) && !empty($data['election_type'])) {
    $update_fields[] = "election_type = ?";
    $params[] = mysqli_real_escape_string($conn, $data['election_type']);
    $types .= "s";
}

if (isset($data['start_date']) && !empty($data['start_date'])) {
    // Validate date
    $start_date = $data['start_date'];
    $current_date = date('Y-m-d H:i:s');

    if (strtotime($start_date) <= strtotime($current_date)) {
        echo json_encode(["success" => false, "message" => "Start date must be in the future"]);
        exit;
    }

    $update_fields[] = "start_date = ?";
    $params[] = $start_date;
    $types .= "s";
}

if (isset($data['end_date']) && !empty($data['end_date'])) {
    $update_fields[] = "end_date = ?";
    $params[] = $data['end_date'];
    $types .= "s";
}

if (isset($data['status']) && in_array($data['status'], ['upcoming', 'active', 'completed'])) {
    $update_fields[] = "status = ?";
    $params[] = $data['status'];
    $types .= "s";
}

if (empty($update_fields)) {
    echo json_encode(["success" => false, "message" => "No valid fields to update"]);
    exit;
}

// Add election_id to params
$params[] = $election_id;
$types .= "i";

// Build and execute update query
$sql = "UPDATE elections SET " . implode(", ", $update_fields) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    // Log the action
    $action = "update_election";
    $table_name = "elections";
    $admin_id = $_SESSION['user_id'];
    $new_values = json_encode($data);
    $old_values = json_encode($old_election_data);
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'];

    $log_sql = "INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    $log_stmt->bind_param("ississss", $admin_id, $action, $table_name, $election_id, $old_values, $new_values, $ip_address, $user_agent);
    $log_stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Election updated successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error updating election: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>