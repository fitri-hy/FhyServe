const path = require('path');
const fs = require('fs');
const http = require('http');
const kill = require('tree-kill');
const pidusage = require('pidusage');
const find = require('find-process');
const { exec, spawn } = require('child_process');
const { isDevelopment, getBasePath } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');

const PORT = getPORT('NGINX_PORT');
const PHP_FPM_PORT = getPORT('PHP_FPM_PORT');

let nginxProcess = null;
let phpFpmProcess = null;
let mainWindow = null;

const basePath = getBasePath();
const nginxCwd = isDevelopment()
  ? path.join(basePath, 'resources', 'nginx')
  : path.join(basePath, 'resources', 'nginx');
const nginxPath = path.join(nginxCwd, 'nginx.exe');
const nginxConfPath = path.join(nginxCwd, 'conf', 'nginx.conf');
const phpFpmPath = path.join(basePath, 'resources', 'php-fpm', 'php-cgi.exe');
const phpFpmIniPath = path.join(basePath, 'resources', 'php-fpm', 'php.ini');

/**
 * Sets the main window reference for the Nginx service.
 * 
 * @param {BrowserWindow} win - The Electron BrowserWindow instance to use for communication.
 */
function setNginxMain(win) {
  mainWindow = win;
}

/**
 * Ensures a directory exists, creating it if necessary.
 * 
 * @param {string} dirPath - Path to the directory to check/create.
 */
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Logs a message to the renderer process.
 * 
 * @param {string} message - The message to be sent to the renderer process.
 * This message is associated with the 'nginx' service.
 */
function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'nginx', message });
  }
}
/**
 * Enables a specific PHP extension in the php.ini configuration file.
 * 
 * @param {string} phpIniPath - Absolute path to the php.ini configuration file
 * @param {string} extensionName - Name of the PHP extension to enable
 * @returns {void}
 */
function enablePhpExtension(phpIniPath, extensionName) {
  try {
    let iniContent = fs.readFileSync(phpIniPath, 'utf8');

    iniContent = iniContent.replace(
      /^\s*;?\s*extension_dir\s*=.*$/m,
      `extension_dir = "${path.join(basePath, 'resources', 'php-fpm', 'ext').replace(/\\/g, '/')}"`,
    );

    const extRegex = new RegExp(`^;*\\s*extension\\s*=\\s*${extensionName}\\s*$`, 'm');

    if (extRegex.test(iniContent)) {
      iniContent = iniContent.replace(extRegex, `extension=${extensionName}`);
    } else if (!new RegExp(`^\\s*extension\\s*=\\s*${extensionName}\\s*$`, 'm').test(iniContent)) {
      iniContent += `\nextension=${extensionName}\n`;
    }

    fs.writeFileSync(phpIniPath, iniContent, 'utf8');
  } catch (err) {
    logToRenderer(`ERROR enabling extension ${extensionName}: ${err.message}`);
  }
}

/**
 * Updates the PHP-FPM configuration by enabling required extensions.
 * This ensures all necessary PHP functionality is available for the web server.
 * 
 * @returns {void}
 */
function updatePhpFpmIni() {
  const extensions = ['mysqli', 'openssl', 'pdo_mysql', 'curl', 'fileinfo', 'zip', 'intl', 'mbstring'];

  extensions.forEach(ext => {
    enablePhpExtension(phpFpmIniPath, ext);
  });
}

/**
 * Sends the current Nginx service status to the renderer process.
 * 
 * @param {string} status - The current status of the Nginx service (e.g., 'RUNNING', 'STOPPED')
 * @returns {void}
 */
function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('nginx-status', status);
  }
}

/**
 * Creates a promise that resolves after the specified delay.
 * Useful for implementing pauses between operations.
 * 
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Starts the PHP-FPM server process.
 * 
 * This function launches the PHP FastCGI Process Manager with the configured port.
 * It first updates the PHP-FPM configuration, sets up the environment with proper
 * paths, and spawns the PHP-FPM process. The function also configures logging
 * from stdout and stderr to be sent to the renderer process.
 * 
 * If the PHP-FPM process is already running, this function returns without
 * taking any action to prevent duplicate instances.
 * 
 * @returns {void}
 */
function startPhpFpm() {
  if (phpFpmProcess) return;

  updatePhpFpmIni();

  const env = { ...process.env };
  const phpPath = path.join(basePath, 'resources', 'php-fpm');
  env.PATH = `${phpPath};${env.PATH}`;

  phpFpmProcess = spawn(phpFpmPath, ['-b', `127.0.0.1:${PHP_FPM_PORT}`], {
    cwd: path.dirname(phpFpmPath),
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
  });

  phpFpmProcess.stdout?.on('data', data => logToRenderer(`[php-fpm] ${data.toString()}`));
  phpFpmProcess.stderr?.on('data', data => logToRenderer(`[php-fpm] ${data.toString()}`));

  phpFpmProcess.on('close', () => {
    phpFpmProcess = null;
  });
}
/**
 * Updates the Nginx configuration file to include a server block with the specified port.
 * 
 * This function reads the existing nginx.conf file, checks if the desired server block
 * configuration already exists, and if not, adds it to the http block. The server block
 * is configured with the appropriate document root, PHP-FPM settings, and listening port.
 * 
 * The function handles path normalization for cross-platform compatibility and ensures
 * proper indentation in the configuration file.
 * 
 * @param {number} [port=PORT] - The port on which Nginx should listen. Defaults to the
 *                               value of the PORT constant.
 * @returns {void}
 * @throws {Error} Logs errors to the renderer if file operations fail
 */
function updateNginxConfig(port = PORT) {
  try {
    if (!fs.existsSync(nginxConfPath)) return;

    let content = fs.readFileSync(nginxConfPath, 'utf8');

    const rootPath = isDevelopment()
      ? path.join(basePath, 'public_html', 'nginx_web').replace(/\\/g, '/')
      : path.join(basePath, 'resources', 'public_html', 'nginx_web').replace(/\\/g, '/');

    const desiredServerBlock = `
server {
    listen ${port};
    server_name localhost;

    root ${rootPath};
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \\.php$ {
        fastcgi_pass 127.0.0.1:${PHP_FPM_PORT};
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
    }
}`.trim();

    function normalize(str) {
      return str.replace(/\s+/g, '').toLowerCase();
    }

    if (normalize(content).includes(normalize(desiredServerBlock))) {
      return;
    }

    const httpBlockRegex = /(http\s*\{)([\s\S]*?)(\n\})/m;
    const match = content.match(httpBlockRegex);
    if (!match) {
      logToRenderer('No valid http block found in nginx.conf');
      return;
    }
    const before = match[1];
    const inside = match[2];
    const after = match[3];

    const newHttpContent = inside.trimEnd() + '\n\n    ' + desiredServerBlock.replace(/\n/g, '\n    ') + '\n';

    const updatedContent = content.replace(httpBlockRegex, `${before}\n${newHttpContent}${after}`);

    fs.writeFileSync(nginxConfPath, updatedContent, 'utf8');
  } catch (err) {
    logToRenderer(`Failed to update server: ${err.message}`);
  }
}


/**
 * Waits for the Nginx server to become ready and responsive.
 * 
 * @param {number} [port=PORT] - The port number to check for Nginx readiness
 * @param {number} [timeout=5000] - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} - Resolves to true if Nginx is ready, false otherwise
 */
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

/**
 * Starts the Nginx server on the specified port.
 * 
 * This function handles directory creation, configuration updates,
 * PHP-FPM initialization, and process management for Nginx.
 * 
 * @param {number} [port=PORT] - The port number on which Nginx will listen
 * @returns {Promise<void>} - Resolves when the server has started or failed to start
 */
async function startNginx(port = PORT) {
  if (nginxProcess) return;

  if (!isDevelopment()) {
    const logsPath = path.join(basePath, 'resources', 'nginx', 'logs');
    const tempPath = path.join(basePath, 'resources', 'nginx', 'temp');

    ensureDirExists(logsPath);
    ensureDirExists(tempPath);
  }

  updateNginxConfig(port);
  startPhpFpm();

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

/**
 * Stops the Nginx server and associated PHP-FPM process.
 * 
 * This function identifies all running Nginx processes by name and
 * terminates them, along with any PHP-FPM processes that were started.
 * 
 * @returns {Promise<boolean>} - Resolves to true if successful, false otherwise
 */
async function stopNginx() {
  logToRenderer('Stopping...');

  if (phpFpmProcess) {
    phpFpmProcess.kill('SIGTERM');
    phpFpmProcess = null;
  }

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
/**
 * Gets the runtime statistics for the Nginx service.
 * This function checks the global variable `nginxProcess` to determine if Nginx is running.
 * If Nginx is not running, it returns an object indicating the stopped state.
 * If Nginx is running, it uses `pidusage` to get CPU and memory usage, and returns detailed status information.
 * If an error occurs while getting the status, it returns an object containing error information.
 *
 * @returns {Promise<Object>} An object containing the following fields:
 *   - name {string} Service name, fixed as 'Nginx'
 *   - pid {number} Nginx process ID (only when the service is running)
 *   - cpu {string} CPU usage, formatted as '<number>%' (only when the service is running)
 *   - memory {string} Memory usage, formatted as '<number> MB' (only when the service is running)
 *   - port {number} Port number Nginx is listening on (only when the service is running)
 *   - status {string} Service status, possible values are 'STOPPED', 'RUNNING', or 'ERROR'
 *   - error {string} Error message (only when status is 'ERROR')
 */
async function getNginxStats() {
  if (!nginxProcess) {
    return {
      name: 'Nginx',
      status: 'STOPPED',
    };
  }

  try {
    const usage = await pidusage(nginxProcess.pid);
    return {
      name: 'Nginx',
      pid: nginxProcess.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: PORT,
      status: 'RUNNING',
    };
  } catch (err) {
    return {
      name: 'Nginx',
      status: 'ERROR',
      error: err.message,
    };
  }
}

module.exports = { startNginx, stopNginx, setNginxMain, getNginxStats };
