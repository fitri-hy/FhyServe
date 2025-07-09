const path = require('path');
const fs = require('fs');
const http = require('http');
const kill = require('tree-kill');
const pidusage = require('pidusage');
const { spawn } = require('child_process');
const { isDevelopment, getBasePath } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');

const PORT = getPORT('APACHE_PORT');

let apacheProcess;
let mainWindow = null;

const basePath = getBasePath();
const apacheCwd = isDevelopment()
  ? path.join(basePath, 'resources', 'apache')
  : path.join(basePath, 'resources', 'apache');
const apachePath = path.join(apacheCwd, 'bin', 'httpd.exe');

const htdocsPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'apache_web')
  : path.join(basePath, 'resources', 'public_html', 'apache_web');

const phpPath = isDevelopment()
  ? path.join(basePath, 'resources', 'php')
  : path.join(basePath, 'resources', 'php');

const phpMyAdminConfigPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'apache_web', 'phpmyadmin', 'config.inc.php')
  : path.join(basePath, 'resources', 'public_html', 'apache_web', 'phpmyadmin', 'config.inc.php');

/**
 * Sets the main window reference for Apache.
 * 
 * @param {Object} win - The window object that will be set as the main window.
 *                       This is typically an instance of BrowserWindow from Electron.
 * @return {void}       This function does not return anything.
 */
function setApacheMain(win) {
  mainWindow = win;
}

/**
 * Logs a message to the renderer process.
 * 
 * @param {string} message - The message to be sent to the renderer process. This message is associated with the 'apache' service.
 */
function logToRenderer(message) {
  // Checks if mainWindow exists and has not been destroyed before sending a message through webContents
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'apache', message });
  }
}

/**
 * Updates the status of the Apache server and sends the status to the main window.
 * 
 * @param {string} status - The status message to be sent to the main window. This typically contains information about the current state of the Apache server.
 */
function updateStatus(status) {
  // Check if mainWindow exists and is not destroyed before sending status
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('apache-status', status);
  }
}

/**
 * Delays the execution of subsequent code by returning a Promise that resolves after a specified time.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Updates the phpMyAdmin configuration file with predefined settings.
 * The function modifies or appends the following configurations:
 *   - Sets 'auth_type' to 'config'
 *   - Sets 'user' to 'root'
 *   - Sets 'password' to an empty string
 *   - Enables 'AllowNoPassword'
 *
 * If the configuration file does not exist, the function exits early without making changes.
 *
 * @returns {void} Does not return any value.
 */
function updatePhpMyAdminConfig() {
  try {
    if (!fs.existsSync(phpMyAdminConfigPath)) {
      // Exits the function early if the config file does not exist
      return;
    }
    let content = fs.readFileSync(phpMyAdminConfigPath, 'utf8');

    // Updates or appends 'auth_type' configuration
    if (/$cfg\['Servers'\]\[\$i\]\['auth_type'\]\s*=/.test(content)) {
      content = content.replace(
        /$cfg\['Servers'\]\[\$i\]\['auth_type'\]\s*=\s*'.*?';/,
        `$cfg['Servers'][$i]['auth_type'] = 'config';`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['auth_type'] = 'config';\n`;
    }

    // Updates or appends 'user' configuration
    if (/$cfg\['Servers'\]\[\$i\]\['user'\]\s*=/.test(content)) {
      content = content.replace(
        /$cfg\['Servers'\]\[\$i\]\['user'\]\s*=\s*'.*?';/,
        `$cfg['Servers'][$i]['user'] = 'root';`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['user'] = 'root';\n`;
    }

    // Updates or appends 'password' configuration
    if (/$cfg\['Servers'\]\[\$i\]\['password'\]\s*=/.test(content)) {
      content = content.replace(
        /$cfg\['Servers'\]\[\$i\]\['password'\]\s*=\s*'.*?';/,
        `$cfg['Servers'][$i]['password'] = '';`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['password'] = '';\n`;
    }

    // Updates or appends 'AllowNoPassword' configuration
    if (/$cfg\['Servers'\]\[\$i\]\['AllowNoPassword'\]\s*=/.test(content)) {
      content = content.replace(
        /$cfg\['Servers'\]\[\$i\]\['AllowNoPassword'\]\s*=\s*.*?;/,
        `$cfg['Servers'][$i]['AllowNoPassword'] = true;`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['AllowNoPassword'] = true;\n`;
    }

    // Writes the updated content back to the configuration file
    fs.writeFileSync(phpMyAdminConfigPath, content, 'utf8');
  } catch (err) {
    logToRenderer('Failed to update phpMyAdmin config: ' + err.message);
  }
}


/**
 * Waits for Apache server to be ready by checking if a request to localhost on the specified port returns a 200 status.
 * 
 * @param {number} [port=PORT] - The port number on which the Apache server is running. Defaults to the value of `PORT`.
 * @param {number} [timeout=5000] - Maximum time (in milliseconds) to wait for the server to become ready. Defaults to 5000ms.
 * @returns {Promise<boolean>} Returns `true` if the server responds with a 200 status within the timeout period, otherwise `false`.
 */
async function waitForApacheReady(port = PORT, timeout = 5000) {
  const start = Date.now();

  // Continuously check until the timeout is reached
  while (Date.now() - start < timeout) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, resolve);
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });

      // If the response status code is 200, the server is ready
      if (res.statusCode === 200) return true;
    } catch (_) {
      // Ignore errors and retry
    }

    // Wait for 500ms before retrying
    await delay(500);
  }
  return false;
}

/**
 * Detects the PHP DLL file for Apache in the given directory.
 * 
 * @param {string} phpDir - The directory containing PHP files.
 *   This should be the path where PHP DLL files are located.
 * 
 * @returns {string} - Returns the full path to the detected PHP DLL file, 
 *   formatted with forward slashes.
 * 
 * @throws Will throw an error if no matching PHP DLL file is found in the directory.
 */
function detectPhpDll(phpDir) {
  // Reads the contents of the specified directory synchronously
  const files = fs.readdirSync(phpDir);

  // Finds the first file matching the pattern 'phpXapache2_4.dll' (case-insensitive)
  const dllFile = files.find(f => /^php\d+apache2_4\.dll$/i.test(f));

  // Throws an error if no matching DLL file is found
  if (!dllFile) throw new Error('phpXapache2_4.dll not found in ' + phpDir);

  // Returns the full path to the DLL file, ensuring forward slashes are used
  return path.join(phpDir, dllFile).replace(/\\/g, '/');
}

/**
 * Enables the mysqli extension and other required PHP extensions by modifying the php.ini file.
 * 
 * @param {string} phpIniPath - Absolute path to the php.ini configuration file.
 * @returns {void}
 */
function enableMysqliExtension(phpIniPath) {
  try {
    let iniContent = fs.readFileSync(phpIniPath, 'utf8');

    iniContent = iniContent.replace(
      /^\s*;?\s*extension_dir\s*=.*$/m,
      `extension_dir = "${path.join(phpPath, 'ext').replace(/\\/g, '/')}"`,
    );

    const extensions = ['mysqli', 'openssl', 'pdo_mysql', 'curl', 'fileinfo', 'zip', 'intl', 'mbstring'];

    // Iterates through a list of required PHP extensions and ensures they are enabled in the php.ini file.
    extensions.forEach(ext => {
      const regex = new RegExp(`^;*\\s*extension\\s*=\\s*${ext}\\s*$`, 'm');

      if (regex.test(iniContent)) {
        iniContent = iniContent.replace(regex, `extension=${ext}`);
      } else if (!new RegExp(`^\\s*extension\\s*=\\s*${ext}\\s*$`, 'm').test(iniContent)) {
        iniContent += `\nextension=${ext}\n`;
      }
    });

    // Writes the modified content back to the php.ini file.
    fs.writeFileSync(phpIniPath, iniContent, 'utf8');
  } catch (err) {
    logToRenderer(`ERROR enabling mysqli extension: ${err.message}`);
  }
}

/**
 * Updates the Apache configuration file (httpd.conf) based on the specified port.
 * This function modifies several key settings including server root, document root, 
 * listening port, PHP module paths, and ensures required configurations for PHP and PHPMyAdmin.
 * Logs errors if any occur during the process.
 *
 * @param {number} [port=PORT] - The port number on which Apache should listen. Defaults to a predefined PORT constant.
 * @returns {void}
 */
function updateApacheConfig(port = PORT) {
  try {
    // Http.conf
    const confPath = path.join(apacheCwd, 'conf', 'httpd.conf');
    let confContent = fs.readFileSync(confPath, 'utf8');

    // Define essential paths with correct formatting for Apache configuration
    const serverRootPath = apacheCwd.replace(/\\/g, '/');
    const docRootPath = htdocsPath.replace(/\\/g, '/');
    const phpPath = path.join(basePath, 'resources', 'php').replace(/\\/g, '/');
    const phpIniDir = phpPath;
    const phpDllPath = detectPhpDll(phpPath);

    // Update ServerRoot, DocumentRoot, and Directory directive with appropriate paths
    confContent = confContent.replace(/^ServerRoot\s+".*"/m, `ServerRoot "${serverRootPath}"`);
    confContent = confContent.replace(/^DocumentRoot\s+".*"/m, `DocumentRoot "${docRootPath}"`);
    confContent = confContent.replace(/<Directory\s+".*htdocs.*?">/m, `<Directory "${docRootPath}">`);

    // Ensure ServerName is set correctly; add if missing
    const serverNameRegex = /^ServerName\s+(.*)$/m;
    if (serverNameRegex.test(confContent)) {
      confContent = confContent.replace(serverNameRegex, 'ServerName localhost');
    } else {
      confContent = `ServerName localhost\n` + confContent;
    }

    // Update Listen directive with the provided port; uncomment if necessary
    const listenRegex = /^Listen\s+\d+$/m;
    if (listenRegex.test(confContent)) {
      confContent = confContent.replace(listenRegex, `Listen ${port}`);
    } else {
      confContent = confContent.replace(/#\s*Listen\s+\d+/, `Listen ${port}`);
    }

    // Update or add PHP module configuration
    const phpModuleRegex = /^LoadModule\s+php_module\s+".*php\d+apache2_4\.dll"$/m;
    const phpIniRegex = /^PHPIniDir\s+".*"$/m;
    if (phpModuleRegex.test(confContent)) {
      confContent = confContent.replace(phpModuleRegex, `LoadModule php_module "${phpDllPath}"`);
    } else {
      confContent += `\nLoadModule php_module "${phpDllPath}"`;
    }
    if (phpIniRegex.test(confContent)) {
      confContent = confContent.replace(phpIniRegex, `PHPIniDir "${phpIniDir}"`);
    } else {
      confContent += `\nPHPIniDir "${phpIniDir}"`;
    }

    // Add DirectoryIndex directive if not present
    if (!/DirectoryIndex\s+index\.php/m.test(confContent)) {
      confContent += `\nDirectoryIndex index.php index.html`;
    }

    if (!/<FilesMatch\s+\\\.php\$>/.test(confContent)) {
      confContent += `
<FilesMatch \\.php$>
    SetHandler application/x-httpd-php
</FilesMatch>`;
    }

    // Update PHP.ini file to enable mysqli extension
    const phpIniFile = path.join(phpIniDir, 'php.ini');
    enableMysqliExtension(phpIniFile);

    // Update PHPMyAdmin configuration
    updatePhpMyAdminConfig();

    // Write updated content back to httpd.conf
    fs.writeFileSync(confPath, confContent, 'utf8');
  } catch (err) {
    logToRenderer(`ERROR updating config: ${err.message}`);
  }
}

/**
 * Starts the Apache server on the specified port.
 * 
 * @param {number} [port=PORT] - The port number on which the Apache server will run. Defaults to a predefined constant `PORT`.
 * @returns {Promise<void>} - Resolves when the server has started or fails to start.
 */
async function startApache(port = PORT) {
  if (apacheProcess) return;

  // Update the Apache configuration with the specified port.
  updateApacheConfig(port);

  const env = { ...process.env };
  env.PATH = `${phpPath};${env.PATH}`;

  // Spawn the Apache process with the necessary environment variables and working directory.
  apacheProcess = spawn(apachePath, [], {
    cwd: apacheCwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
  });

  // Attach event listeners for logging stdout and stderr data from the Apache process.
  apacheProcess.stdout?.on('data', (data) => logToRenderer(data.toString()));
  apacheProcess.stderr?.on('data', (data) => logToRenderer(data.toString()));

  // Handle the close event of the Apache process by resetting the process variable and updating status.
  apacheProcess.on('close', (code) => {
    apacheProcess = null;
    updateStatus('STOPPED');
  });

  logToRenderer(`Initialized...`);
  logToRenderer(`Waiting for a response from http://localhost:${port}...`);

  // Wait for Apache to become ready within a timeout period.
  const isReady = await waitForApacheReady(port, 5000);

  if (isReady) {
    updateStatus('RUNNING');
    logToRenderer('Is running.');
  } else {
    logToRenderer('Failed to respond. Please check configuration.');
  }
}

/**
 * Asynchronously stops the Apache server process.
 * 
 * @returns {Promise<void>} - Returns a promise that resolves when the stopping process is complete.
 */
async function stopApache() {
  // Log initial stopping message
  logToRenderer('Stopping...');

  if (!apacheProcess) {
    updateStatus('STOPPED');
    return;
  }

  // Attempt to kill the Apache process with SIGTERM signal
  kill(apacheProcess.pid, 'SIGTERM', async (err) => {
    if (err) {
      // Log error message if stopping fails
      logToRenderer(`Stop failed: ${err.message}`);
    } else {
      // Log success message upon successful termination
      logToRenderer('Has stopped.');
    }

    await delay(3000);

    // Update status and reset apacheProcess reference
    updateStatus('STOPPED');
    apacheProcess = null;
  });
}

// Monitoring
/**
 * Gets the runtime statistics for the Apache service.
 * This function checks the global variable `apacheProcess` to determine if Apache is running.
 * If Apache is not running, it returns an object indicating the stopped state.
 * If Apache is running, it uses `pidusage` to get CPU and memory usage, and returns detailed status information.
 * If an error occurs while getting the status, it returns an object containing error information.
 *
 * @returns {Promise<Object>} An object containing the following fields:
 *   - name {string} Service name, fixed as 'Apache'
 *   - pid {number} Apache process ID (only when the service is running)
 *   - cpu {string} CPU usage, formatted as '<number>%' (only when the service is running)
 *   - memory {string} Memory usage, formatted as '<number> MB' (only when the service is running)
 *   - port {number} Port number Apache is listening on (only when the service is running)
 *   - status {string} Service status, possible values are 'STOPPED', 'RUNNING', or 'ERROR'
 *   - error {string} Error message (only when status is 'ERROR')
 */
async function getApacheStats() {
  if (!apacheProcess) {
    // If `apacheProcess` doesn't exist, return an object indicating the service is stopped
    return {
      name: 'Apache',
      status: 'STOPPED',
    };
  }

  try {
    // Use `pidusage` to get resource usage of the Apache process
    const usage = await pidusage(apacheProcess.pid);
    return {
      name: 'Apache',
      pid: apacheProcess.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: PORT,
      status: 'RUNNING'
    };
  } catch (err) {
    // Catch errors and return an object containing error information
    return {
      name: 'Apache',
      status: 'ERROR',
      error: err.message
    };
  }
}

module.exports = { startApache, stopApache, setApacheMain, getApacheStats };
