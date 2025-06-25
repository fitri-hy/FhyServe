const path = require('path');
const fs = require('fs');
const http = require('http');
const kill = require('tree-kill');
const { exec, spawn } = require('child_process');
const { isDevelopment, getBasePath } = require('../utils/pathResource');

const PORT = 8080;

let nginxProcess = null;
let mainWindow = null;

const basePath = getBasePath();
const nginxCwd = isDevelopment()
  ? path.join(basePath, 'resources', 'nginx')
  : path.join(basePath, 'resources', 'nginx');
const nginxPath = path.join(nginxCwd, 'nginx.exe');
const nginxConfPath = path.join(nginxCwd, 'conf', 'nginx.conf');

function setNginxMain(win) {
  mainWindow = win;
}

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'nginx', message });
  }
}

function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('nginx-status', status);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateNginxConfig(port = PORT) {
  try {
    if (!fs.existsSync(nginxConfPath)) {
      return;
    }

    let content = fs.readFileSync(nginxConfPath, 'utf8');

    const rootPath = isDevelopment()
      ? path.join(basePath, 'www').replace(/\\/g, '/')
      : path.join(basePath, 'resources', 'www').replace(/\\/g, '/');

    const serverBlockRegex = new RegExp(`server\\s*\\{[^}]*listen\\s+${port};[^}]*\\}`, 'm');
    if (serverBlockRegex.test(content)) {
      return;
    }

    const newServerBlock = `
    server {
        listen ${port};
        server_name localhost;

        root ${rootPath};
        index index.php index.html index.htm;

        location / {
            try_files $uri $uri/ =404;
        }
    }
`;

    const httpBlockRegex = /http\s*\{([\s\S]*?)\n\}/m;
    const match = content.match(httpBlockRegex);
    if (!match) {
      logToRenderer('No valid http block found in nginx.conf');
      return;
    }

    const httpBlockContent = match[1];
    const newHttpBlockContent = httpBlockContent + '\n' + newServerBlock + '\n';
    const newContent = content.replace(httpBlockRegex, `http {\n${newHttpBlockContent}}`);

    fs.writeFileSync(nginxConfPath, newContent, 'utf8');
    logToRenderer(`New server added for port.`);

  } catch (err) {
    logToRenderer(`Failed to add server: ${err.message}`);
  }
}


async function waitForNginxReady(port = PORT, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, resolve);
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });

      if (res.statusCode === 200 || res.statusCode === 403) return true;
    } catch (_) {
      // ignore
    }
    await delay(500);
  }
  return false;
}

async function startNginx(port = PORT) {
  if (nginxProcess) return;
  
  if (!isDevelopment()) {
    const logsPath = path.join(basePath, 'resources', 'nginx', 'logs');
    const tempPath = path.join(basePath, 'resources', 'nginx', 'temp');

    ensureDirExists(logsPath);
    ensureDirExists(tempPath);
  }

  updateNginxConfig(port);

  nginxProcess = spawn(nginxPath, ['-c', nginxConfPath], {
    cwd: nginxCwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  nginxProcess.stdout?.on('data', data => logToRenderer(data.toString()));
  nginxProcess.stderr?.on('data', data => logToRenderer(data.toString()));

  nginxProcess.on('close', () => {
    nginxProcess = null;
    updateStatus('STOPPED');
  });

  logToRenderer('Initialized...');
  logToRenderer(`Waiting for a response from http://localhost:${port}...`);

  const isReady = await waitForNginxReady(port, 5000);

  if (isReady) {
    updateStatus('RUNNING');
    logToRenderer('Is running.');
  } else {
    logToRenderer('Failed to respond. Please check configuration.');
  }
}

async function stopNginx() {
  logToRenderer('Stopping...');

  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq nginx.exe" /FO CSV /NH', (err, stdout, stderr) => {
      if (err) {
        resolve(false);
        return;
      }
      if (stderr) {
        logToRenderer('Error output: ' + stderr);
      }

      const lines = stdout.trim().split('\n');
      const pids = lines.map(line => {
        const parts = line.replace(/"/g, '').split(',');
        return parts[1];
      }).filter(pid => pid && !isNaN(pid));

      if (pids.length === 0) {
        resolve(true);
        return;
      }

      let killedCount = 0;
      for (const pid of pids) {
        kill(parseInt(pid), 'SIGTERM', (killErr) => {
          if (killErr) {
            
          } else {
            
          }
          killedCount++;
          if (killedCount === pids.length) {
            resolve(true);
          }
        });
      }
	  logToRenderer('Has stopped.');
    });
  });
}

module.exports = { startNginx, stopNginx, setNginxMain };
