<?php
require_once dirname(dirname(__FILE__)) . '/config.php';

$request_body = file_get_contents('php://input');
header('Content-Type: application/json; charset=utf-8');
$headers = [];

$action = $_POST['action'] ?? $_GET['action'] ?? 'info';

if ($action == 'poweron') {
    $output = null;
    $retval = null;
    $result = exec("{$wol_path} -i {$broadcast} {$mac}", $output, $retval);
    if ($retval != 0 || $result === false) {
        http_response_code(500);
        die(json_encode(['error' => 'Error sending Wake on LAN packet']));
    } else {
        http_response_code(200);
        die(json_encode(['message' => 'Power-on request sent successfully']));
    }
}

if (!function_exists('curl_init')) {
    die('cURL is not installed. Please install and try again.');
}
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url . '/' . $action);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
curl_setopt($ch, CURLOPT_TIMEOUT, 8);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

if ($token) {
    $headers[] = "Authorization: Bearer {$token}";
}
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $fields = $_POST;
    unset($fields['action']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
    $headers[] = 'Content-Type: application/x-www-form-urlencoded';
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response_body = curl_exec($ch);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    http_response_code(502);
    die(json_encode(['error' => $error]));
}
$response = curl_getinfo($ch);
curl_close($ch);

if ($response['http_code'] >= 200 && $response['http_code'] < 300) {
    http_response_code($response['http_code']);
    echo($response_body);
} else {
    http_response_code(502);
    if (!empty($response_body)) {
        echo($response_body);
    } else {
        echo(json_encode(['error' => 'There was an error processing your request']));
    }
}
