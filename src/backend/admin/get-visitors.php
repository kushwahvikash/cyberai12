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

// Simple authentication check
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if ($authHeader !== 'Bearer admin-token') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Read visitor data
$visitorsDir = '../visitors';
$visitors = [];
$stats = [
    'totalVisitors' => 0,
    'todayVisitors' => 0,
    'uniqueCountries' => 0,
    'avgSessionTime' => 0
];

if (is_dir($visitorsDir)) {
    $files = glob($visitorsDir . '/visitor_*.json');
    $countries = [];
    $totalSessionTime = 0;
    $todayDate = date('Y-m-d');
    
    foreach ($files as $file) {
        $data = json_decode(file_get_contents($file), true);
        if ($data) {
            $visitors[] = [
                'id' => $data['id'],
                'ip' => $data['ip'],
                'userAgent' => $data['userAgent'],
                'location' => $data['location'],
                'device' => $data['device'],
                'timestamp' => new DateTime($data['timestamp']),
                'sessionDuration' => $data['sessionDuration'] ?? 0,
                'pagesViewed' => $data['pagesViewed'] ?? 1
            ];
            
            // Update stats
            $stats['totalVisitors']++;
            
            if (strpos($file, $todayDate) !== false) {
                $stats['todayVisitors']++;
            }
            
            $country = $data['location']['country'] ?? 'Unknown';
            if (!in_array($country, $countries)) {
                $countries[] = $country;
            }
            
            $totalSessionTime += $data['sessionDuration'] ?? 0;
        }
    }
    
    $stats['uniqueCountries'] = count($countries);
    $stats['avgSessionTime'] = $stats['totalVisitors'] > 0 ? 
        intval($totalSessionTime / $stats['totalVisitors']) : 0;
    
    // Sort visitors by timestamp (newest first)
    usort($visitors, function($a, $b) {
        return $b['timestamp'] <=> $a['timestamp'];
    });
    
    // Convert DateTime objects to strings for JSON
    foreach ($visitors as &$visitor) {
        $visitor['timestamp'] = $visitor['timestamp']->format('c');
    }
}

echo json_encode([
    'success' => true,
    'visitors' => array_slice($visitors, 0, 100), // Limit to 100 recent visitors
    'stats' => $stats,
    'timestamp' => date('c')
]);
?>