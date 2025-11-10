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
if (!isset($data['current_password']) || empty($data['current_password']) ||
    !isset($data['new_password']) || empty($data['new_password'])) {
    echo json_encode(["success" => false, "message" => "Current password and new password are required"]);
    exit;
}

$current_password = $data['current_password'];
$new_password = $data['new_password'];
$user_id = $_SESSION['user_id'];

// Validate new password strength
if (strlen($new_password) < 8) {
    echo json_encode(["success" => false, "message" => "New password must be at least 8 characters long"]);
    exit;
}

if (!preg_match('/[A-Z]/', $new_password)) {
    echo json_encode(["success" => false, "message" => "New password must contain at least one uppercase letter"]);
    exit;
}

if (!preg_match('/[a-z]/', $new_password)) {
    echo json_encode(["success" => false, "message" => "New password must contain at least one lowercase letter"]);
    exit;
}

if (!preg_match('/[0-9]/', $new_password)) {
    echo json_encode(["success" => false, "message" => "New password must contain at least one number"]);
    exit;
}

// Get current user password
$sql = "SELECT password FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$user_data = $result->fetch_assoc();

// Verify current password (assuming plain text storage as per existing system)
if ($user_data['password'] !== $current_password) {
    echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
    exit;
}

// Check if new password is same as current password
if ($user_data['password'] === $new_password) {
    echo json_encode(["success" => false, "message" => "New password must be different from current password"]);
    exit;
}

// Update password
$update_sql = "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("si", $new_password, $user_id);

if ($update_stmt->execute()) {
    // Log the action (without storing actual passwords)
    $action = "change_password";
    $table_name = "users";
    $record_id = $user_id;
    $old_values = json_encode(["password_changed" => true]);
    $new_values = json_encode(["password_changed_at" => date('Y-m-d H:i:s')]);
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'];

    $log_sql = "INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    $log_stmt->bind_param("ississss", $user_id, $action, $table_name, $record_id, $old_values, $new_values, $ip_address, $user_agent);
    $log_stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Password changed successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error changing password: " . $conn->error
    ]);
}

$update_stmt->close();
$stmt->close();
$conn->close();
?>