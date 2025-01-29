<?php
require_once dirname(dirname(__FILE__)) . '/lib.php';

header('Content-Type: application/json; charset=utf-8');
$action = $_POST['action'] ?? $_GET['action'] ?? 'info';

if ($action == 'poweron') {
    $result = wake_on_lan();
    if ($result) {
        http_response_code(200);
        die(json_encode(['message' => 'Power-on request sent successfully']));
    } else {
        http_response_code(500);
        die(json_encode(['error' => 'Error sending Wake on LAN packet']));
    }
}

$response = api_request($action, $_SERVER['REQUEST_METHOD'], $_POST);

if (isset($response['error'])) {
    http_response_code(502);
    die(json_encode(['error' => $response['error']]));
}

if ($response['info']['http_code'] >= 200 && $response['info']['http_code'] < 300) {
    http_response_code($response['info']['http_code']);
    echo($response['body']);
} else {
    http_response_code(502);
    if (!empty($response['body'])) {
        echo($response['body']);
    } else {
        echo(json_encode(['error' => 'There was an error processing your request']));
    }
}
