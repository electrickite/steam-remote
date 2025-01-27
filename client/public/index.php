<?php
  require_once dirname(dirname(__FILE__)) . '/config.php';
  $bodyclass = str_contains(strtolower(
    $_GET['platform'] ?? $_SERVER['HTTP_USER_AGENT'] ?? ''
  ), 'steamdeck') ? 'zoom' : '';
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
    <link rel="stylesheet" href="./css/style.css?v=2">
  </head>
  <body class="<?= $bodyclass ?>">
    <header>
      <noscript><p class="notice">This page requires JavaScript to function!</p></noscript>
      <h1><?= $title ?? 'Steam Remote' ?></h1>
    </header>
    <main>
      <table role="presentation">
        <tbody>
          <tr>
            <td>Online: <span id="statusOnline" role="img" aria-label="Unknown">❓</span></td>
            <td>Steam: <span id="statusSteam" role="img" aria-label="Unknown">❓</span></td>
            <td>Account: <span id="statusAccount">Unknown</span></td>
          </tr>
        </tbody>
      </table>
      <form>
        <div>
          <label for="action">Action</label>
          <select name="action" id="action">
            <optgroup label="Steam">
              <option value="start">Start Steam</option>
              <option value="stop">Stop Steam</option>
              <option value="restart">Restart Steam</option>
            </optgroup>
              <optgroup label="System">
              <option value="poweron">Power on system</option>
              <option value="poweroff">Power off system</option>
              <option value="powercycle">Restart system</option>
            </optgroup>
            <option value="refresh">Refresh status</option>
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
      <div id='toast' class="toast notice" aria-live="polite" aria-atomic="true">
        <span aria-hidden="true"></span> <span></span>
      </div>
    </main>
    <script src="./js/script.js?v=3"></script>
  </body>
</html>
