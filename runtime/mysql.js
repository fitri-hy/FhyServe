const path = require('path');
const fs = require('fs');
const net = require('net');
const kill = require('tree-kill');
const pidusage = require('pidusage');
const { spawn, spawnSync, execSync } = require('child_process');
const { isDevelopment, getBasePath } = require('../utils/pathResource');
const mysqlLib = require('mysql2/promise');
const { getPORT } = require('../utils/port');

const PORT = getPORT('MYSQL_PORT');

let mysqlProcess;
let mainWindow = null;

const basePath = getBasePath();
const mysqlCwd = path.join(basePath, 'resources', 'mysql');
const mysqlBinPath = path.join(mysqlCwd, 'bin');
const mysqldPath = path.join(mysqlBinPath, 'mysqld.exe');
const myIniPath = path.join(mysqlCwd, 'my.ini');
const dataDir = path.join(mysqlCwd, 'data');

/**
 * Sets the main window reference for MySQL operations.
 * 
 * @param {BrowserWindow} win - The Electron BrowserWindow instance to communicate with
 */
function setMysqlMain(win) {
  mainWindow = win;
}

/**
 * Sends a log message to the renderer process.
 * 
 * @param {string} message - The message to be sent to the renderer process
 */
function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'mysql', message });
  }
}

/**
 * Updates the MySQL service status in the renderer process.
 * 
 * @param {string} status - The status to be sent (e.g., 'RUNNING', 'STOPPED', 'ERROR')
 */
function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('mysql-status', status);
  }
}

/**
 * Creates a promise that resolves after a specified delay.
 * 
 * @param {number} ms - The delay time in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Creates or updates the MySQL configuration file (my.ini).
 * 
 * This function writes the necessary MySQL server configuration to the my.ini file
 * if it doesn't exist. The configuration includes essential settings like data directory,
 * port number, character set, and error log location.
 * 
 * @returns {void}
 */
function writeMyIni() {
  if (!fs.existsSync(myIniPath)) {
    const iniContent = `
[mysqld]
skip-networking=0
basedir=${mysqlCwd.replace(/\\/g, '/')}
datadir=${dataDir.replace(/\\/g, '/')}
port=${PORT}
bind-address=127.0.0.1
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
max_allowed_packet=64M
log-error=${path.join(mysqlCwd, 'mysql-error.log').replace(/\\/g, '/')}
skip-grant-tables=0
`;
    fs.writeFileSync(myIniPath, iniContent.trim(), 'utf8');
  } else {

  }
}
/**
 * Initializes the MySQL data directory and sets a root password.
 * 
 * This function checks if MySQL has been initialized before. If not, it:
 * 1. Removes any existing data directory
 * 2. Initializes MySQL with insecure defaults (no password)
 * 3. Starts MySQL with skip-grant-tables to modify security settings
 * 4. Sets the root password
 * 5. Stops the temporary MySQL instance
 * 
 * @param {string} rootPassword - The password to set for MySQL root user (defaults to 'root')
 * @returns {Promise<void>} A promise that resolves when initialization is complete
 * @throws {Error} If initialization, connection, or password setting fails
 */
async function initializeDataDirWithRootPassword(rootPassword = 'root') {
  const ibdataPath = path.join(dataDir, 'ibdata1');

  if (fs.existsSync(ibdataPath)) {
    return;
  }

  logToRenderer('Initialized...');

  if (fs.existsSync(dataDir)) {
    try {
      fs.rmSync(dataDir, { recursive: true, force: true });
    } catch (err) {
      logToRenderer(`Failed to remove existing data directory: ${err.message}`);
      throw err;
    }
  }

  // Initialize tanpa password root
  const result = spawnSync(mysqldPath, [
    '--initialize-insecure',
    `--basedir=${mysqlCwd}`,
    `--datadir=${dataDir}`
  ], {
    cwd: mysqlCwd,
    encoding: 'utf8'
  });

  if (result.error) {
    logToRenderer(`Initialization failed: ${result.error.message}`);
    throw result.error;
  }
  if (result.stderr?.trim()) logToRenderer(`stderr: ${result.stderr}`);
  if (result.stdout?.trim()) logToRenderer(`stdout: ${result.stdout}`);

  const skipGrantProcess = spawn(mysqldPath, [
    `--defaults-file=${myIniPath}`,
    '--skip-grant-tables',
    `--port=${PORT}`
  ], {
    cwd: mysqlCwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await new Promise((resolve, reject) => {
    skipGrantProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      logToRenderer(msg);
      if (msg.includes('ready for connections')) {
        resolve();
      }
    });
    skipGrantProcess.on('error', reject);
    skipGrantProcess.on('exit', (code) => {
      if (code !== 0) reject(new Error(`skipGrantProcess exited with code ${code}`));
    });
  });

  try {
    const connection = await mysqlLib.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: PORT,
      multipleStatements: true,
    });

    await connection.query(`
      FLUSH PRIVILEGES;
      ALTER USER 'root'@'localhost' IDENTIFIED BY '${rootPassword}';
      FLUSH PRIVILEGES;
    `);
    await connection.end();
  } catch (err) {
    logToRenderer('Failed to set root password: ' + err.message);
    throw err;
  }

  logToRenderer('Stopping skip-grant-tables instance...');
  kill(skipGrantProcess.pid, 'SIGTERM', (err) => {
    if (err) logToRenderer(`Failed to stop skip-grant-tables MySQL: ${err.message}`);
    else logToRenderer('skip-grant-tables stopped.');
  });

  await delay(5000);
}
/**
 * Starts the MySQL server on the specified port.
 * 
 * This function performs the following operations:
 * 1. Checks if MySQL is already running
 * 2. Validates the existence of the MySQL daemon executable
 * 3. Ensures proper configuration file exists
 * 4. Initializes the database with root password if needed
 * 5. Spawns the MySQL process with appropriate parameters
 * 6. Sets up logging and event handlers
 * 7. Waits for MySQL to become ready for connections
 * 8. Updates the service status accordingly
 * 
 * @param {number} [port=PORT] - The port number on which MySQL will listen
 * @returns {Promise<void>} A promise that resolves when the server has started or failed to start
 */
async function startMysql(port = PORT) {
  if (mysqlProcess) return;

  if (!fs.existsSync(mysqldPath)) {
    return;
  }

  writeMyIni();

  try {
    await initializeDataDirWithRootPassword('root');
  } catch (err) {
    updateStatus('STOPPED');
    return;
  }

  mysqlProcess = spawn(mysqldPath, [`--defaults-file=${myIniPath}`, `--port=${port}`], {
    cwd: mysqlCwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  mysqlProcess.stdout?.on('data', (data) => logToRenderer(data.toString()));
  mysqlProcess.stderr?.on('data', (data) => logToRenderer(data.toString()));

  mysqlProcess.on('close', (code) => {
    mysqlProcess = null;
    updateStatus('STOPPED');
  });

  logToRenderer(`Starting on port ${port}...`);

  const isReady = await waitForMysqlReady(port, 7000);

  if (isReady) {
    updateStatus('RUNNING');
    logToRenderer('Is running.');
  } else {
    logToRenderer('Failed to respond. Please check configuration.');
    updateStatus('STOPPED');
  }
}
/**
 * Stops the MySQL server process.
 * 
 * This function attempts to gracefully terminate the MySQL server process.
 * If the process reference is not available, it attempts to kill any running
 * mysqld.exe processes using taskkill. After stopping, it updates the service
 * status to 'STOPPED'.
 * 
 * @returns {Promise<void>} A promise that resolves when MySQL has been stopped
 */
async function stopMysql() {
  logToRenderer('Stopping...');

  if (!mysqlProcess) {
    try {
      execSync('taskkill /F /IM mysqld.exe /T');
    } catch (err) {
      // Silently handle errors when no process is found
    }
    updateStatus('STOPPED');
    return;
  }

  kill(mysqlProcess.pid, 'SIGTERM', async (err) => {
    if (err) {
      logToRenderer(`Stop failed: ${err.message}`);
    } else {
      logToRenderer('Has stopped.');
    }

    try {
      execSync('taskkill /F /IM mysqld.exe /T');
    } catch (err) {
      // Silently handle errors when no process is found
    }

    await delay(3000);
    updateStatus('STOPPED');
    mysqlProcess = null;
  });
}
/**
 * Gets the runtime statistics for the MySQL service.
 * This function checks the global variable `mysqlProcess` to determine if MySQL is running.
 * If MySQL is not running, it returns an object indicating the stopped state.
 * If MySQL is running, it uses `pidusage` to get CPU and memory usage, and returns detailed status information.
 * If an error occurs while getting the status, it returns an object containing error information.
 *
 * @returns {Promise<Object>} An object containing the following fields:
 *   - name {string} Service name, fixed as 'MySQL'
 *   - pid {number} MySQL process ID (only when the service is running)
 *   - cpu {string} CPU usage, formatted as '<number>%' (only when the service is running)
 *   - memory {string} Memory usage, formatted as '<number> MB' (only when the service is running)
 *   - port {number} Port number MySQL is listening on (only when the service is running)
 *   - status {string} Service status, possible values are 'STOPPED', 'RUNNING', or 'ERROR'
 *   - error {string} Error message (only when status is 'ERROR')
 */
async function getMysqlStats() {
  if (!mysqlProcess || !mysqlProcess.pid) {
    return {
      name: 'MySQL',
      status: 'STOPPED',
    };
  }

  try {
    const usage = await pidusage(mysqlProcess.pid);
    return {
      name: 'MySQL',
      pid: mysqlProcess.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: PORT,
      status: 'RUNNING',
    };
  } catch (err) {
    return {
      name: 'MySQL',
      status: 'ERROR',
      error: err.message,
    };
  }
}

module.exports = { startMysql, stopMysql, setMysqlMain, getMysqlStats };