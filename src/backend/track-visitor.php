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

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Create visitors directory if it doesn't exist
$visitorsDir = 'visitors';
if (!file_exists($visitorsDir)) {
    mkdir($visitorsDir, 0755, true);
}

// Prepare visitor data
$visitorData = [
    'id' => uniqid(),
    'ip' => $input['ip'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
    'userAgent' => $input['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
    'timestamp' => $input['timestamp'] ?? date('c'),
    'location' => $input['location'] ?? [
        'country' => 'Unknown',
        'region' => 'Unknown',
        'city' => 'Unknown',
        'timezone' => 'Unknown'
    ],
    'device' => $input['device'] ?? [
        'type' => 'Unknown',
        'browser' => 'Unknown',
        'os' => 'Unknown'
    ],
    'sessionId' => $input['sessionId'] ?? uniqid(),
    'sessionDuration' => 0,
    'pagesViewed' => 1,
    'firstVisit' => date('c'),
    'lastActivity' => date('c'),
    'domain' => 'cyberai.rf.gd'
];

// Save visitor data
$filename = 'visitor_' . date('Y-m-d') . '_' . $visitorData['sessionId'] . '.json';
$filepath = $visitorsDir . '/' . $filename;

if (file_put_contents($filepath, json_encode($visitorData, JSON_PRETTY_PRINT)) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save visitor data']);
    exit();
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Visitor tracked successfully',
    'visitorId' => $visitorData['id'],
    'timestamp' => date('c'),
    'domain' => 'cyberai.rf.gd'
]);
?>