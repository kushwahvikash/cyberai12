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

if (!isset($input['message']) || empty(trim($input['message']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required']);
    exit();
}

$userMessage = trim($input['message']);

// OpenRouter API configuration
$apiKey = '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';
$apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

// Prepare the system message for CyberAI
$systemMessage = "You are CyberAI, an expert AI assistant specialized in Kali Linux, penetration testing, cybersecurity, ethical hacking, and digital forensics. You provide precise, actionable guidance on security tools, techniques, and best practices. Always prioritize ethical and legal approaches to cybersecurity. Format your responses with clear explanations, practical examples, and when appropriate, include command-line examples in code blocks.";

// Prepare the API request payload
$payload = [
    'model' => 'mistralai/mistral-7b-instruct',
    'messages' => [
        [
            'role' => 'system',
            'content' => $systemMessage
        ],
        [
            'role' => 'user',
            'content' => $userMessage
        ]
    ],
    'max_tokens' => 1000,
    'temperature' => 0.7,
    'top_p' => 0.9
];

// Prepare cURL request
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'X-Title: CyberAI-Web',
        'HTTP-Referer: https://cyberai.rf.gd'
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_USERAGENT => 'CyberAI-Chatbot/1.0'
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($curlError) {
    error_log("cURL Error: " . $curlError);
    http_response_code(500);
    echo json_encode(['error' => 'Network error occurred']);
    exit();
}

// Handle HTTP errors
if ($httpCode !== 200) {
    error_log("HTTP Error: " . $httpCode . " - " . $response);
    http_response_code(500);
    echo json_encode(['error' => 'API request failed']);
    exit();
}

// Parse the API response
$apiResponse = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON Decode Error: " . json_last_error_msg());
    http_response_code(500);
    echo json_encode(['error' => 'Invalid API response']);
    exit();
}

// Extract the assistant's message
if (!isset($apiResponse['choices'][0]['message']['content'])) {
    error_log("Invalid API Response Structure: " . print_r($apiResponse, true));
    http_response_code(500);
    echo json_encode(['error' => 'Invalid response format']);
    exit();
}

$assistantMessage = $apiResponse['choices'][0]['message']['content'];

// Return the response
echo json_encode([
    'response' => $assistantMessage,
    'timestamp' => date('c'),
    'model' => 'mistralai/mistral-7b-instruct',
    'domain' => 'cyberai.rf.gd'
]);
?>