<?php
// CORS headers to allow frontend requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the request body
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['sessionId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Session ID is required']);
    exit();
}

$sessionId = $input['sessionId'];
$duration = $input['duration'] ?? 0;
$pageUrl = $input['pageUrl'] ?? '';

// Find visitor file
$visitorsDir = 'visitors';
$files = glob($visitorsDir . '/visitor_*_' . $sessionId . '.json');

if (empty($files)) {
    http_response_code(404);
    echo json_encode(['error' => 'Visitor session not found']);
    exit();
}

$filepath = $files[0];
$visitorData = json_decode(file_get_contents($filepath), true);

if (!$visitorData) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read visitor data']);
    exit();
}

// Update session data
$visitorData['sessionDuration'] = $duration;
$visitorData['lastActivity'] = date('c');
$visitorData['pagesViewed'] = ($visitorData['pagesViewed'] ?? 1) + 1;
$visitorData['domain'] = 'cyberai.rf.gd';

if ($pageUrl) {
    $visitorData['currentPage'] = $pageUrl;
}

// Save updated data
if (file_put_contents($filepath, json_encode($visitorData, JSON_PRETTY_PRINT)) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update visitor data']);
    exit();
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Session updated successfully',
    'timestamp' => date('c'),
    'domain' => 'cyberai.rf.gd'
]);
?>