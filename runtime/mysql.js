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

function setMysqlMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'mysql', message });
  }
}

function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('mysql-status', status);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function waitForMysqlReady(port = PORT, timeout = 7000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.once('connect', () => {
          socket.destroy();
          resolve();
        });
        socket.once('timeout', () => {
          socket.destroy();
          reject(new Error('timeout'));
        });
        socket.once('error', reject);
        socket.connect(port, '127.0.0.1');
      });
      return true;
    } catch (_) {}
    await delay(500);
  }
  return false;
}

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

async function stopMysql() {
  logToRenderer('Stopping...');

  if (!mysqlProcess) {
    try {
      execSync('taskkill /F /IM mysqld.exe /T');
    } catch (err) {

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

    }

    await delay(3000);
    updateStatus('STOPPED');
    mysqlProcess = null;
  });
}

// Monitoring
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