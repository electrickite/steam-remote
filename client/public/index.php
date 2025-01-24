<?php require_once dirname(dirname(__FILE__)) . '/config.php'; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#212121" media="(prefers-color-scheme: dark)">
    <title><?= $title ?? 'Steam Remote' ?></title>

    <link rel="icon" type="image/png" href="./img/link-icon-180.png">
    <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="./img/link-icon-180.png">
    <link rel="stylesheet" href="./css/simple.min.css">
    <link rel="stylesheet" href="./css/style.css?v=1">
  </head>
  <body>
    <header>
      <noscript><p class="notice">This page requires JavaScript to function!</p></noscript>
      <h1><?= $title ?? 'Steam Remote' ?></h1>
    </header>
    <main>
      <table role="presentation">
        <tbody>
          <tr>
            <td>Online: <span id="statusOnline" role="img"></span></td>
            <td>Steam: <span id="statusSteam" role="img"></span></td>
            <td>Account: <span id="statusAccount"></span></td>
          </tr>
        </tbody>
      </table>
      <form>
        <div>
          <label for="action">Action</label>
          <select name="action" id="action">
            <option value="start">Start Steam</option>
            <option value="stop">Stop Steam</option>
            <option value="restart">Restart Steam</option>
            <option value="poweron">Power on system</option>
            <option value="poweroff">Power off system</option>
            <option value="powercycle">Restart system</option>
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
      </form>
    </main>
    <div id='toast' class="toast notice" aria-live="polite" aria-atomic="true">
      <span aria-hidden="true"></span> <span></span>
    </div>
    <script src="./js/script.js"></script>
  </body>
</html>
