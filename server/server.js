import http from 'http';
import { parse as urlParse } from 'url';
import qs from 'querystring';
import childProcess from 'child_process';
import config from './config.js';

const accounts = new Map(config.accounts);

const errorMsg = new Map([
  [400, 'Bad Request'],
  [401, 'Unauthorized'],
  [403, 'Forbidden'],
  [404, 'Not Found'],
  [405, 'Method Not Allowed'],
  [500, 'Internal Server Error'],
]);

function writeResponse(res, data, status) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status ?? 200;
  res.end(JSON.stringify(data));
}

function errorResponse(res, status, msg) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(status);
  res.end(JSON.stringify(
    {error: msg ?? errorMsg.get(status) ?? 'Unknown Error'}
  ));
}

function requireMethod(req, res, method) {
  if (req.method != method) {
    errorResponse(res, 405);
    return false;
  } else {
    return true;
  }
}

function parsedBody(req) {
  let body = '';
  return new Promise((resolve) => {
    req.on('data', (data) => {
      body += data;
      if (body.length > 1e6) {
        req.connection.destroy();
        body = '';
      }
    });
    req.on('end', () => {
      resolve(qs.parse(body));
    });
  });
}

function runCommand(cmd, ...args) {
  const proc = childProcess.spawn(cmd, args, {
    windowsHide: true,
    timeout: config.proc_timeout,
  });
  let stdout = '';
  let stderr = '';
  return new Promise((resolve) => {
    proc.stdout.on('data', (data) => {
      stdout += data;
    });
    proc.stderr.on('data', (data) => {
      stderr += data;
    });
    proc.on('close', (code) => {
      resolve({
        status: code,
        stdout: stdout,
        stderr: stderr,
      });
    });
  });
}

function steamCommand(...args) {
  args.push('-silent');
  const proc = childProcess.spawn(config.steam.bin, args, {
    cwd: config.steam.dir,
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function steamStatus() {
  const regquery = await runCommand('reg', 'query', config.steam.reg + '\\ActiveProcess');
  if (regquery.status !== 0) return null;
  const userMatch = regquery.stdout.match(/\s*ActiveUser\s+\w+\s+(\w+)/i);
  const userId = userMatch?.[1] ? Number(userMatch[1]) : null;
  const pidMatch = regquery.stdout.match(/\s*pid\s+\w+\s+(\w+)/i);
  const pid = pidMatch?.[1] ? Number(pidMatch[1]) : null;
  return {
    active: pid ? true : false,
    pid: pid,
    userId: userId,
    user: userId ? ([...accounts].find(([name, id]) => userId === id)?.[0] || 'Unknown') : null,
    accounts: Array.from(accounts.keys()),
  };
}

async function setSteamUser(username) {
  await runCommand('reg', 'add', config.steam.reg, '/f', '/v', 'AutoLoginUser',
    '/t', 'REG_SZ', '/d', username);
}

function authorize(req, res) {
  if (!config.tokens?.length) return true;
  if (!req.headers.authorization) {
    res.setHeader('WWW-Authenticate', 'Bearer');
    errorResponse(res, 401);
    return false;
  } else {
    const parts = req.headers.authorization.split(/\s/);
    if (parts.length < 2 || parts[0].toLowerCase() != 'bearer') {
      errorResponse(res, 401);
      return false;
    }
    if (config.tokens.includes(parts[1])) {
      return true;
    } else {
      errorResponse(res, 403);
      return false;
    }
  }
}

const server = http.createServer();
server.on('request', async (req, res) => {
  req.setEncoding('utf8');
  const url = urlParse(req.url, true);
  if (!authorize(req, res)) return;

  switch (url.pathname) {
    case '/info': {
      if (!requireMethod(req, res, 'GET')) break;
      const steam = await steamStatus();
      if (!steam) { errorResponse(res, 500); break; }
      writeResponse(res, steam);
      break; }

    case '/poweroff': {
      if (!requireMethod(req, res, 'POST')) break;
      writeResponse(res, {message: 'Powering down system'}, 202);
      runCommand('shutdown', '/s', '/t', '00');
      break; }

    case '/powercycle': {
      if (!requireMethod(req, res, 'POST')) break;
      writeResponse(res, {message: 'Restarting system'}, 202);
      runCommand('shutdown', '/r', '/t', '00');
      break; }

    case '/stop': {
      if (!requireMethod(req, res, 'POST')) break;
      const post = await parsedBody(req);
      const steam = await steamStatus();
      if (!steam) { errorResponse(res, 500); break; }
      if (steam.active || post.force) {
        steamCommand('-shutdown');
        writeResponse(res, {message: 'Shutting down Steam client'}, 202);
      } else {
        writeResponse(res, {message: 'Steam client not running'});
      }
      break; }

    case '/start': {
      if (!requireMethod(req, res, 'POST')) break;
      const post = await parsedBody(req);
      const steam = await steamStatus();
      if (!steam) { errorResponse(res, 500); break; }
      if (steam.active && !post.force) {
        writeResponse(res, {message: 'Steam client running'});
      } else {
        if (post.user && accounts.has(post.user)) {
          await setSteamUser(post.user);
        }
        steamCommand();
        writeResponse(res, {message: 'Starting Steam client'}, 202);
      }
      break; }

    case '/restart': {
      if (!requireMethod(req, res, 'POST')) break;
      const post = await parsedBody(req);
      let steam = await steamStatus();
      if (!steam) { errorResponse(res, 500); break; }
      writeResponse(res, {message: 'Restarting Steam client'}, 202);
      if (steam.active || post.force) {
        steamCommand('-shutdown');
        await sleep(config.steam.delay);
        steam = await steamStatus();
      }
      if (steam.active && !post.force) break;
      if (post.user && accounts.has(post.user)) {
        await setSteamUser(post.user);
      }
      steamCommand();
      break; }

    default:
      errorResponse(res, 404);
  }
});

server.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}/`);
});
