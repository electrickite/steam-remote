<?php
require_once dirname(dirname(__FILE__)) . '/lib.php';

$get_status = isset($_GET['status']);
$bodyclass = str_contains(strtolower(
    $_GET['platform'] ?? $_SERVER['HTTP_USER_AGENT'] ?? ''
), 'steamdeck') ? 'zoom' : '';

$toast_message = '';
$toast_icon = '';


if (isset($_POST['action']) && $_POST['action'] == 'poweron') {
    $result = wake_on_lan();
    if ($result) {
        $toast_message = 'Power-on request sent successfully';
        $toast_icon = '✓';
    } else {
        $toast_message = 'Error sending Wake on LAN packet';
        $toast_icon = '⚠';
    }
} else if (isset($_POST['action'])) {
    $res = api_request($_POST['action'], 'POST', $_POST);
    if (isset($res['error'])) {
        $toast_message = 'An error occurred requesting the action';
        $toast_icon = '⚠';
    } else if ($res['info']['http_code'] >= 200 && $res['info']['http_code'] < 300) {
        $data = json_decode($res['body'], true);
        $toast_message = $data['message'] ?? 'Action request successful';
        $toast_icon = '✓';
    } else {
        $data = json_decode($res['body'], true);
        $toast_message = $data['error'] ?? 'Action request successful';
        $toast_icon = '⚠';
    }
    $get_status = true;
}

$online_label = 'Unknown';
$online_icon = '❓';
$steam_label = 'Unknown';
$steam_icon = '❓';
$account = 'Unknown';

if ($get_status) {
    $response = api_request('info');
    if (!isset($response['error'])) {
        $data = json_decode($response['body'], true);
        $online_label = ($data && !isset($data['error'])) ? 'Yes' : 'No';
        $steam_label = ($data['active'] ?? false) ? 'Yes' : 'No';
        $account = $data['user'] ?? ($data['active'] ? 'Signed out' : 'Unknown');
    } else {
        $online_label = 'No';
        $steam_label = 'No';
        $account = 'Unknown';
    }
    $online_icon = $online_label == 'Yes' ? '✅' : '❌';
    $steam_icon = $steam_label == 'Yes' ? '✅' : '❌';
}
?><!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#212121" media="(prefers-color-scheme: dark)">
    <title><?= $title ?? 'Steam Remote' ?></title>

    <link rel="icon" type="image/png" href="./img/link-icon-180.png">
    <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="./img/link-icon-180.png">
    <link rel="stylesheet" href="./css/simple.min.css">
    <link rel="stylesheet" href="./css/style.css?v=4">
  </head>
  <body class="<?= $bodyclass ?>">
    <header>
      <h1><?= $title ?? 'Steam Remote' ?></h1>
    </header>
    <main>
      <noscript><a href="?status=1">Refresh</a></noscript>
      <table role="presentation">
        <tbody>
          <tr>
          <td>Online: <span id="statusOnline" role="img" aria-label="<?= $online_label ?>" title="<?= $online_label ?>"><?= $online_icon ?></span></td>
          <td>Steam: <span id="statusSteam" role="img" aria-label="<?= $steam_label ?>" title="<?= $steam_label ?>"><?= $steam_icon ?></span></td>
            <td>Account: <span id="statusAccount"><?= $account ?></span></td>
          </tr>
        </tbody>
      </table>
      <form method="POST">
        <div>
          <label for="action">Action</label>
          <select name="action" id="action">
            <optgroup label="Steam">
              <option value="start">Start Steam</option>
              <option value="restart">Restart Steam</option>
              <option value="stop">Stop Steam</option>
            </optgroup>
              <optgroup label="System">
              <option value="poweron">Power on system</option>
              <option value="poweroff">Power off system</option>
              <option value="powercycle">Restart system</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label for="user">Account</label>
          <select name="user" id="user">
            <option value="">Current</option>
            <?php foreach($accounts as $account): ?>
            <option><?= $account ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <button type="submit">Run</button>
        <label>
          <input type="checkbox" name="force"> Force
        </label>
      </form>
      <div id="toast" class="toast notice<?= $toast_message ? ' hide' : '' ?>" role="status" aria-atomic="false">
        <?php if ($toast_icon): ?>
          <span aria-hidden="true"><?= $toast_icon ?></span>
        <?php endif; ?>
        <?php if ($toast_message): ?>
          <span><?= $toast_message ?></span>
        <?php endif; ?>
      </div>
    </main>
    <script src="./js/script.js?v=6"></script>
  </body>
</html>
