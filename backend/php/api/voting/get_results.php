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

// Check if election exists
$election_sql = "SELECT e.*, u.f_name, u.l_name as creator_name
                 FROM elections e
                 LEFT JOIN users u ON e.created_by = u.id
                 WHERE e.id = ?";
$election_stmt = $conn->prepare($election_sql);
$election_stmt->bind_param("i", $election_id);
$election_stmt->execute();
$election_result = $election_stmt->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" = "Election not found"]);
    exit;
}

$election_data = $election_result->fetch_assoc();
$user_role = $_SESSION['role'];

// Check if results should be public (only if election is completed or user is admin)
if ($election_data['status'] !== 'completed' && $user_role !== 'admin') {
    echo json_encode(["success" => false, "message" => "Results are not available yet"]);
    exit;
}

// Get election settings to check if results are public
$settings_sql = "SELECT public_results FROM election_settings WHERE election_id = ?";
$settings_stmt = $conn->prepare($settings_sql);
$settings_stmt->bind_param("i", $election_id);
$settings_stmt->execute();
$settings_result = $settings_stmt->get_result();
$settings_data = $settings_result->fetch_assoc();
$public_results = $settings_data['public_results'] ?? true;

if (!$public_results && $user_role !== 'admin') {
    echo json_encode(["success" => false, "message" => "Results are not public"]);
    exit;
}

// Get candidates with their vote counts
$candidates_sql = "SELECT c.*,
                          COUNT(v.id) as vote_count,
                          ROUND((COUNT(v.id) / (SELECT COUNT(*) FROM votes v2 WHERE v2.election_id = ?)) * 100, 2) as vote_percentage
                   FROM candidates c
                   LEFT JOIN votes v ON c.id = v.candidate_id
                   WHERE c.election_id = ?
                   GROUP BY c.id
                   ORDER BY vote_count DESC";

$candidates_stmt = $conn->prepare($candidates_sql);
$candidates_stmt->bind_param("ii", $election_id, $election_id);
$candidates_stmt->execute();
$candidates_result = $candidates_stmt->get_result();

$candidates = [];
$total_votes = 0;

while ($candidate = $candidates_result->fetch_assoc()) {
    $candidates[] = $candidate;
    $total_votes += $candidate['vote_count'];
}

// Get voting statistics
$stats_sql = "SELECT
                 COUNT(DISTINCT v.user_id) as total_voters,
                 COUNT(v.id) as total_votes_cast,
                 MIN(v.voted_at) as first_vote_time,
                 MAX(v.voted_at) as last_vote_time
              FROM votes v
              WHERE v.election_id = ?";

$stats_stmt = $conn->prepare($stats_sql);
$stats_stmt->bind_param("i", $election_id);
$stats_stmt->execute();
$stats_result = $stats_stmt->get_result();
$stats_data = $stats_result->fetch_assoc();

// Get eligible voters count (registered users)
$eligible_voters_sql = "SELECT COUNT(*) as eligible_voters FROM users WHERE role = 'user'";
$eligible_voters_result = $conn->query($eligible_voters_sql);
$eligible_voters_data = $eligible_voters_result->fetch_assoc();

// Calculate turnout percentage
$turnout_percentage = $eligible_voters_data['eligible_voters'] > 0
    ? round(($stats_data['total_voters'] / $eligible_voters_data['eligible_voters']) * 100, 2)
    : 0;

// Format election data
$election_data['start_date'] = date('Y-m-d H:i', strtotime($election_data['start_date']));
$election_data['end_date'] = date('Y-m-d H:i', strtotime($election_data['end_date']));
$election_data['created_at'] = date('Y-m-d H:i', strtotime($election_data['created_at']));

// Build response
$response = [
    "success" => true,
    "election" => $election_data,
    "candidates" => $candidates,
    "statistics" => [
        "total_voters" => (int)$stats_data['total_voters'],
        "total_votes_cast" => (int)$stats_data['total_votes_cast'],
        "eligible_voters" => (int)$eligible_voters_data['eligible_voters'],
        "turnout_percentage" => $turnout_percentage,
        "first_vote_time" => $stats_data['first_vote_time'] ? date('Y-m-d H:i:s', strtotime($stats_data['first_vote_time'])) : null,
        "last_vote_time" => $stats_data['last_vote_time'] ? date('Y-m-d H:i:s', strtotime($stats_data['last_vote_time'])) : null
    ]
];

// Add winner information if election is completed
if ($election_data['status'] === 'completed' && !empty($candidates)) {
    $max_votes = max(array_column($candidates, 'vote_count'));
    $winners = array_filter($candidates, function($candidate) use ($max_votes) {
        return $candidate['vote_count'] == $max_votes;
    });

    $response['winner'] = array_values($winners);
}

echo json_encode($response);

$conn->close();
?>