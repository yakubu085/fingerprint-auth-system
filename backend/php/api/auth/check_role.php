<?php
require_once "../../config/header.php";
require_once "../../config/database.php";

// Check if user is authenticated
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get user information including role
$sql = "SELECT id, f_name, l_name, email, role, phone, matric_number, profile_picture, created_at
        FROM users
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$user_data = $result->fetch_assoc();

// Format profile picture URL if exists
if ($user_data['profile_picture']) {
    $user_data['profile_picture_url'] = "/uploads/profiles/" . $user_data['profile_picture'];
}

// Format dates
$user_data['created_at'] = date('Y-m-d H:i', strtotime($user_data['created_at']));

// Check if user has fingerprint template
$fingerprint_sql = "SELECT COUNT(*) as has_fingerprint FROM biometric WHERE user_id = ?";
$fingerprint_stmt = $conn->prepare($fingerprint_sql);
$fingerprint_stmt->bind_param("i", $user_id);
$fingerprint_stmt->execute();
$fingerprint_result = $fingerprint_stmt->get_result();
$fingerprint_data = $fingerprint_result->fetch_assoc();

$user_data['has_fingerprint'] = $fingerprint_data['has_fingerprint'] > 0;

// Get user's voting statistics
$voting_stats_sql = "SELECT
                        COUNT(DISTINCT v.election_id) as elections_participated,
                        COUNT(v.id) as total_votes_cast
                     FROM votes v
                     WHERE v.user_id = ?";

$voting_stats_stmt = $conn->prepare($voting_stats_sql);
$voting_stats_stmt->bind_param("i", $user_id);
$voting_stats_stmt->execute();
$voting_stats_result = $voting_stats_stmt->get_result();
$voting_stats_data = $voting_stats_result->fetch_assoc();

$user_data['voting_statistics'] = [
    "elections_participated" => (int)$voting_stats_data['elections_participated'],
    "total_votes_cast" => (int)$voting_stats_data['total_votes_cast']
];

echo json_encode([
    "success" => true,
    "role" => $user_data['role'],
    "user_id" => $user_data['id'],
    "user_data" => $user_data
]);

$stmt->close();
$conn->close();
?>