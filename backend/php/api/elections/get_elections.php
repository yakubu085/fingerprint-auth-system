<?php
require_once "../../config/header.php";
require_once "../../config/database.php";

// Check if user is authenticated
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Access denied. Please login."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Get query parameters
$status = isset($_GET['status']) ? $_GET['status'] : null;
$user_id = $_SESSION['user_id'];
$user_role = $_SESSION['role'] ?? 'user';

// Build query
$sql = "SELECT e.*, u.f_name, u.l_name as creator_name,
        COUNT(c.id) as candidate_count,
        (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.id) as total_votes
        FROM elections e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN candidates c ON e.id = c.election_id";

// Add WHERE conditions
$where_conditions = [];
if ($status && in_array($status, ['upcoming', 'active', 'completed'])) {
    $where_conditions[] = "e.status = '$status'";
}

if (!empty($where_conditions)) {
    $sql .= " WHERE " . implode(" AND ", $where_conditions);
}

$sql .= " GROUP BY e.id ORDER BY e.created_at DESC";

$result = $conn->query($sql);

if ($result) {
    $elections = [];
    while ($row = $result->fetch_assoc()) {
        // Format dates
        $row['start_date'] = date('Y-m-d\TH:i', strtotime($row['start_date']));
        $row['end_date'] = date('Y-m-d\TH:i', strtotime($row['end_date']));
        $row['created_at'] = date('Y-m-d\TH:i', strtotime($row['created_at']));

        // Check if current user has voted in this election
        if ($user_role === 'user') {
            $vote_check_sql = "SELECT COUNT(*) as has_voted FROM votes WHERE user_id = ? AND election_id = ?";
            $vote_check_stmt = $conn->prepare($vote_check_sql);
            $vote_check_stmt->bind_param("ii", $user_id, $row['id']);
            $vote_check_stmt->execute();
            $vote_result = $vote_check_stmt->get_result();
            $vote_data = $vote_result->fetch_assoc();
            $row['user_voted'] = $vote_data['has_voted'] > 0;
            $vote_check_stmt->close();
        } else {
            $row['user_voted'] = false;
        }

        $elections[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $elections
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching elections: " . $conn->error
    ]);
}

$conn->close();
?>