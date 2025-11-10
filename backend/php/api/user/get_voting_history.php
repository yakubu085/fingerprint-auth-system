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

$user_id = $_SESSION['user_id'];

// Get pagination parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// Get user's voting history
$sql = "SELECT
            e.id as election_id,
            e.title as election_title,
            e.election_type,
            e.start_date,
            e.end_date,
            e.status as election_status,
            c.id as candidate_id,
            c.name as candidate_name,
            c.position,
            c.photo as candidate_photo,
            v.voted_at,
            CASE
                WHEN e.status = 'completed' THEN (
                    SELECT COUNT(*) FROM votes v2 WHERE v2.candidate_id = v.candidate_id
                )
                ELSE 0
            END as candidate_votes
        FROM votes v
        INNER JOIN elections e ON v.election_id = e.id
        INNER JOIN candidates c ON v.candidate_id = c.id
        WHERE v.user_id = ?
        ORDER BY v.voted_at DESC
        LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iii", $user_id, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$voting_history = [];
while ($row = $result->fetch_assoc()) {
    // Format dates
    $row['voted_at'] = date('Y-m-d H:i:s', strtotime($row['voted_at']));
    $row['start_date'] = date('Y-m-d H:i', strtotime($row['start_date']));
    $row['end_date'] = date('Y-m-d H:i', strtotime($row['end_date']));

    // Format photo URL if exists
    if ($row['candidate_photo']) {
        $row['candidate_photo_url'] = "/uploads/candidates/" . $row['candidate_photo'];
    }

    // Determine voting status
    $row['voting_status'] = $row['election_status'] === 'completed' ? 'completed' : 'active';

    $voting_history[] = $row;
}

// Get total count for pagination
$count_sql = "SELECT COUNT(*) as total FROM votes WHERE user_id = ?";
$count_stmt = $conn->prepare($count_sql);
$count_stmt->bind_param("i", $user_id);
$count_stmt->execute();
$count_result = $count_stmt->get_result();
$count_data = $count_result->fetch_assoc();
$total_votes = $count_data['total'];

// Calculate pagination info
$total_pages = ceil($total_votes / $limit);

// Get voting statistics
$stats_sql = "SELECT
                COUNT(DISTINCT v.election_id) as elections_participated,
                COUNT(v.id) as total_votes_cast,
                COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN v.election_id END) as completed_elections,
                COUNT(DISTINCT CASE WHEN e.status = 'active' THEN v.election_id END) as active_elections
              FROM votes v
              INNER JOIN elections e ON v.election_id = e.id
              WHERE v.user_id = ?";

$stats_stmt = $conn->prepare($stats_sql);
$stats_stmt->bind_param("i", $user_id);
$stats_stmt->execute();
$stats_result = $stats_stmt->get_result();
$stats_data = $stats_result->fetch_assoc();

// Get available elections user hasn't voted in yet
$available_sql = "SELECT
                    e.id as election_id,
                    e.title as election_title,
                    e.election_type,
                    e.start_date,
                    e.end_date,
                    e.status as election_status,
                    COUNT(c.id) as candidate_count
                  FROM elections e
                  LEFT JOIN candidates c ON e.id = c.election_id
                  WHERE e.status = 'active'
                  AND e.id NOT IN (
                    SELECT election_id FROM votes WHERE user_id = ?
                  )
                  AND NOW() BETWEEN e.start_date AND e.end_date
                  GROUP BY e.id
                  ORDER BY e.end_date ASC
                  LIMIT 5";

$available_stmt = $conn->prepare($available_sql);
$available_stmt->bind_param("i", $user_id);
$available_stmt->execute();
$available_result = $available_stmt->get_result();

$available_elections = [];
while ($row = $available_result->fetch_assoc()) {
    // Format dates
    $row['start_date'] = date('Y-m-d H:i', strtotime($row['start_date']));
    $row['end_date'] = date('Y-m-d H:i', strtotime($row['end_date']));

    $available_elections[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => [
        "voting_history" => $voting_history,
        "voting_statistics" => [
            "elections_participated" => (int)$stats_data['elections_participated'],
            "total_votes_cast" => (int)$stats_data['total_votes_cast'],
            "completed_elections" => (int)$stats_data['completed_elections'],
            "active_elections" => (int)$stats_data['active_elections']
        ],
        "available_elections" => $available_elections,
        "pagination" => [
            "current_page" => $page,
            "total_pages" => $total_pages,
            "total_votes" => $total_votes,
            "limit" => $limit
        ]
    ]
]);

$stmt->close();
$count_stmt->close();
$stats_stmt->close();
$available_stmt->close();
$conn->close();
?>