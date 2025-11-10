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
$user_id = $_SESSION['user_id'];

// Get current user data for comparison and logging
$current_user_sql = "SELECT * FROM users WHERE id = ?";
$current_user_stmt = $conn->prepare($current_user_sql);
$current_user_stmt->bind_param("i", $user_id);
$current_user_stmt->execute();
$current_user_result = $current_user_stmt->get_result();

if ($current_user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$current_user_data = $current_user_result->fetch_assoc();

// Prepare update data
$update_fields = [];
$params = [];
$types = "";

if (isset($data['f_name']) && !empty(trim($data['f_name']))) {
    $update_fields[] = "f_name = ?";
    $params[] = mysqli_real_escape_string($conn, trim($data['f_name']));
    $types .= "s";
}

if (isset($data['l_name']) && !empty(trim($data['l_name']))) {
    $update_fields[] = "l_name = ?";
    $params[] = mysqli_real_escape_string($conn, trim($data['l_name']));
    $types .= "s";
}

if (isset($data['phone']) && !empty(trim($data['phone']))) {
    // Validate phone number format
    $phone = trim($data['phone']);
    if (!preg_match('/^[+]?[\d\s\-\(\)]+$/', $phone)) {
        echo json_encode(["success" => false, "message" => "Invalid phone number format"]);
        exit;
    }
    $update_fields[] = "phone = ?";
    $params[] = $phone;
    $types .= "s";
}

if (isset($data['matric_number']) && !empty(trim($data['matric_number']))) {
    $update_fields[] = "matric_number = ?";
    $params[] = mysqli_real_escape_string($conn, trim($data['matric_number']));
    $types .= "s";
}

if (isset($data['email']) && !empty(trim($data['email']))) {
    $email = trim($data['email']);
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit;
    }

    // Check if email is already taken by another user
    $email_check_sql = "SELECT id FROM users WHERE email = ? AND id != ?";
    $email_check_stmt = $conn->prepare($email_check_sql);
    $email_check_stmt->bind_param("si", $email, $user_id);
    $email_check_stmt->execute();
    $email_check_result = $email_check_stmt->get_result();

    if ($email_check_result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email already in use by another user"]);
        exit;
    }

    $update_fields[] = "email = ?";
    $params[] = $email;
    $types .= "s";
}

if (isset($data['profile_picture']) && !empty(trim($data['profile_picture']))) {
    $update_fields[] = "profile_picture = ?";
    $params[] = mysqli_real_escape_string($conn, trim($data['profile_picture']));
    $types .= "s";
}

if (empty($update_fields)) {
    echo json_encode(["success" => false, "message" => "No valid fields to update"]);
    exit;
}

// Add updated_at timestamp
$update_fields[] = "updated_at = CURRENT_TIMESTAMP";

// Add user_id to params
$params[] = $user_id;
$types .= "i";

// Build and execute update query
$sql = "UPDATE users SET " . implode(", ", $update_fields) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    // Log the action
    $action = "update_profile";
    $table_name = "users";
    $record_id = $user_id;
    $old_values = json_encode($current_user_data);
    $new_values = json_encode($data);
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'];

    $log_sql = "INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_sql);
    $log_stmt->bind_param("ississss", $user_id, $action, $table_name, $record_id, $old_values, $new_values, $ip_address, $user_agent);
    $log_stmt->execute();

    // Get updated user data
    $updated_user_sql = "SELECT id, f_name, l_name, email, role, phone, matric_number, profile_picture, updated_at
                        FROM users
                        WHERE id = ?";
    $updated_user_stmt = $conn->prepare($updated_user_sql);
    $updated_user_stmt->bind_param("i", $user_id);
    $updated_user_stmt->execute();
    $updated_user_result = $updated_user_stmt->get_result();
    $updated_user_data = $updated_user_result->fetch_assoc();

    // Format profile picture URL if exists
    if ($updated_user_data['profile_picture']) {
        $updated_user_data['profile_picture_url'] = "/uploads/profiles/" . $updated_user_data['profile_picture'];
    }

    // Format dates
    $updated_user_data['updated_at'] = date('Y-m-d H:i', strtotime($updated_user_data['updated_at']));

    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully",
        "user_data" => $updated_user_data
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error updating profile: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>