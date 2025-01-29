<?php
require_once dirname(__FILE__) . '/config.php';

function api_request($action, $method = 'GET', $fields = []) {
    global $api_url, $token;

    if (!function_exists('curl_init')) {
        die('cURL is not installed. Please install and try again.');
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url . '/' . $action);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $headers = [];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    if ($method == 'POST') {
        if (isset($fields['action'])) unset($fields['action']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        $headers[] = 'Content-Type: application/x-www-form-urlencoded';
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($ch);

    $response = [];
    if (curl_errno($ch)) {
        $response['error'] = curl_error($ch);
    } else {
        $response['body'] = $body;
        $response['info'] = curl_getinfo($ch);
    }
    curl_close($ch);
    return $response;
}

function wake_on_lan() {
    global $wol_path, $broadcast, $mac;

    $output = null;
    $retval = null;
    $result = exec("{$wol_path} -i {$broadcast} {$mac}", $output, $retval);
    return ($retval == 0 && $result !== false);
}
