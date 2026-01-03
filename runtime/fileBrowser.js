const { app } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const pidusage = require('pidusage');
const fs = require('fs');
const net = require('net');

const { isDevelopment, getBasePath } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');
const { rFileBrowser, ReLaunchIsFinish } = require('./resourceDownload');

const PORT = getPORT('FILE_BROWSER_PORT') || 9595;

let fileBrowserProcess = null;
let mainWindow = null;

const basePath = getBasePath();

const htdocsPath = isDevelopment()
  ? path.join(basePath, 'public_html')
  : path.join(basePath, 'resources', 'public_html');

const fileBrowserBase = path.join(basePath, 'resources', 'filebrowser');
const exePath = path.join(fileBrowserBase, 'filebrowser.exe');
const dbPath = path.join(fileBrowserBase, 'filebrowser.db');

function setFileBrowserMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', {
      service: 'filebrowser',
      message
    });
  }
}

function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('file-browser-status', status);
  }
}

async function isPortInUse(port) {
  return new Promise(resolve => {
    const tester = net.createServer()
      .once('error', err => resolve(err.code === 'EADDRINUSE'))
      .once('listening', () => tester.close(() => resolve(false)))
      .listen(port, '127.0.0.1');
  });
}

function isFileBrowserRunning() {
  return new Promise(resolve => {
    exec('tasklist', (err, stdout) => {
      if (err) return resolve(false);
      resolve(stdout.toLowerCase().includes('filebrowser.exe'));
    });
  });
}

async function stopIfRunning() {
  if (fileBrowserProcess || await isFileBrowserRunning()) {
    return new Promise(resolve => {
      exec('taskkill /IM filebrowser.exe /T /F', err => {
        if (err) {
          logToRenderer('Failed to stop File Browser: ' + err.message);
        } else {
          logToRenderer('File Browser stopped.');
        }
        fileBrowserProcess = null;
        updateStatus('STOPPED');
        resolve();
      });
    });
  }
}

async function startFileBrowser() {
  try {
    const progressHandler = progress => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('resource-progress', progress);
      }
    };

    const status = await ReLaunchIsFinish(rFileBrowser, progressHandler);

    if (status === 'done') {
      progressHandler({
        status: 'restarting',
        message: 'Restarting app after File Browser resource initialization...'
      });
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 1000);
      return;
    }
  } catch (err) {
    logToRenderer('Resource init failed: ' + err.message);
    updateStatus('ERROR');
    return;
  }

  if (await isPortInUse(PORT)) {
    logToRenderer('Port in use, restarting File Browser...');
    await stopIfRunning();
    await new Promise(r => setTimeout(r, 1500));
  }

  if (!fs.existsSync(exePath)) {
    logToRenderer('filebrowser.exe not found.');
    updateStatus('ERROR');
    return;
  }

  if (!fs.existsSync(fileBrowserBase)) {
    fs.mkdirSync(fileBrowserBase, { recursive: true });
  }

  fileBrowserProcess = spawn(
    exePath,
    ['-p', PORT, '-r', htdocsPath, '-d', dbPath],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  fileBrowserProcess.stdout.on('data', data =>
    logToRenderer(data.toString().trim())
  );

  fileBrowserProcess.stderr.on('data', data =>
    logToRenderer('ERROR: ' + data.toString().trim())
  );

  fileBrowserProcess.on('close', () => {
    fileBrowserProcess = null;
    updateStatus('STOPPED');
  });

  logToRenderer(`File Browser running at http://localhost:${PORT}`);
  updateStatus('RUNNING');
}

async function stopFileBrowser() {
  await stopIfRunning();
}

async function getFileBrowserStats() {
  if (!fileBrowserProcess) {
    return { name: 'File Browser', status: 'STOPPED' };
  }

  try {
    const usage = await pidusage(fileBrowserProcess.pid);
    return {
      name: 'File Browser',
      pid: fileBrowserProcess.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: PORT,
      status: 'RUNNING',
    };
  } catch (err) {
    return {
      name: 'File Browser',
      status: 'ERROR',
      error: err.message
    };
  }
}

module.exports = {
  setFileBrowserMain,
  startFileBrowser,
  stopFileBrowser,
  getFileBrowserStats,
};
