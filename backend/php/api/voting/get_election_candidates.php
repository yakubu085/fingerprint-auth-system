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

// Get election ID from URL parameter
$election_id = isset($_GET['election_id']) ? $_GET['election_id'] : null;

if (!$election_id) {
    echo json_encode(["success" => false, "message" => "Election ID is required"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$user_role = $_SESSION['role'];

// Check if election exists and is accessible
$election_sql = "SELECT e.*,
                        CASE
                            WHEN NOW() < e.start_date THEN 'upcoming'
                            WHEN NOW() BETWEEN e.start_date AND e.end_date THEN 'active'
                            WHEN NOW() > e.end_date THEN 'completed'
                        ELSE 'unknown'
                        END as current_status
                 FROM elections e
                 WHERE e.id = ?";

$election_stmt = $conn->prepare($election_sql);
$election_stmt->bind_param("i", $election_id);
$election_stmt->execute();
$election_result = $election_stmt->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found"]);
    exit;
}

$election_data = $election_result->fetch_assoc();

// Check if user has already voted (only for users, not admins)
$user_has_voted = false;
if ($user_role === 'user') {
    $vote_check_sql = "SELECT COUNT(*) as has_voted FROM votes WHERE user_id = ? AND election_id = ?";
    $vote_check_stmt = $conn->prepare($vote_check_sql);
    $vote_check_stmt->bind_param("ii", $user_id, $election_id);
    $vote_check_stmt->execute();
    $vote_check_result = $vote_check_stmt->get_result();
    $vote_check_data = $vote_check_result->fetch_assoc();
    $user_has_voted = $vote_check_data['has_voted'] > 0;
}

// Get candidates for this election
$candidates_sql = "SELECT c.*,
                          COUNT(v.id) as vote_count,
                          ROUND((COUNT(v.id) / (SELECT COUNT(*) FROM votes v2 WHERE v2.election_id = ?)) * 100, 2) as vote_percentage
                   FROM candidates c
                   LEFT JOIN votes v ON c.id = v.candidate_id
                   WHERE c.election_id = ?
                   GROUP BY c.id
                   ORDER BY c.name";

$candidates_stmt = $conn->prepare($candidates_sql);
$candidates_stmt->bind_param("ii", $election_id, $election_id);
$candidates_stmt->execute();
$candidates_result = $candidates_stmt->get_result();

$candidates = [];
while ($candidate = $candidates_result->fetch_assoc()) {
    // Format photo URL if exists
    if ($candidate['photo']) {
        $candidate['photo_url'] = "/uploads/candidates/" . $candidate['photo'];
    }
    $candidates[] = $candidate;
}

// Format election dates
$election_data['start_date'] = date('Y-m-d\TH:i', strtotime($election_data['start_date']));
$election_data['end_date'] = date('Y-m-d\TH:i', strtotime($election_data['end_date']));
$election_data['created_at'] = date('Y-m-d\TH:i', strtotime($election_data['created_at']));

// Build response
$response = [
    "success" => true,
    "election" => $election_data,
    "candidates" => $candidates,
    "user_has_voted" => $user_has_voted,
    "can_vote" => $election_data['current_status'] === 'active' && !$user_has_voted && $user_role === 'user'
];

// Add voting statistics for admins or completed elections
if ($user_role === 'admin' || $election_data['current_status'] === 'completed') {
    $stats_sql = "SELECT
                    COUNT(DISTINCT v.user_id) as total_voters,
                    COUNT(v.id) as total_votes_cast
                  FROM votes v
                  WHERE v.election_id = ?";

    $stats_stmt = $conn->prepare($stats_sql);
    $stats_stmt->bind_param("i", $election_id);
    $stats_stmt->execute();
    $stats_result = $stats_stmt->get_result();
    $stats_data = $stats_result->fetch_assoc();

    $response['voting_statistics'] = [
        "total_voters" => (int)$stats_data['total_voters'],
        "total_votes_cast" => (int)$stats_data['total_votes_cast']
    ];
}

echo json_encode($response);

$conn->close();
?>