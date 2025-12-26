const path = require('path');
const { spawn, exec } = require('child_process');
const pidusage = require('pidusage');
const fs = require('fs');
const net = require('net');
const { isDevelopment, getBasePath } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');

const PORT = getPORT('FILE_BROWSER_PORT') || 9595;
let fileBrowserProcess;
let mainWindow = null;

const basePath = getBasePath();

const htdocsPath = isDevelopment()
  ? path.join(basePath, 'public_html')
  : path.join(basePath, 'resources', 'public_html');

const exePath = path.join(basePath, 'resources', 'filebrowser', 'filebrowser.exe');
const dbPath = path.join(basePath, 'resources', 'filebrowser', 'filebrowser.db');

function setFileBrowserMain(win) { mainWindow = win; }

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'filebrowser', message });
  }
}

function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('file-browser-status', status);
  }
}

async function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => resolve(err.code === 'EADDRINUSE'))
      .once('listening', () => tester.once('close', () => resolve(false)).close())
      .listen(port, '127.0.0.1');
  });
}

function isFileBrowserRunning() {
  return new Promise((resolve) => {
    exec('tasklist', (err, stdout) => {
      if (err) return resolve(false);
      resolve(stdout.toLowerCase().includes('filebrowser.exe'));
    });
  });
}

async function stopIfRunning() {
  if (fileBrowserProcess) {
    return new Promise((resolve) => {
      exec(`taskkill /IM filebrowser.exe /T /F`, (err) => {
        if (err) logToRenderer('Failed to stop File Browser: ' + err.message);
        else logToRenderer('File Browser has stopped.');
        fileBrowserProcess = null;
        updateStatus('STOPPED');
        resolve();
      });
    });
  }

  if (await isFileBrowserRunning()) {
    return new Promise((resolve) => {
      exec(`taskkill /IM filebrowser.exe /T /F`, (err) => {
        if (err) logToRenderer('Failed to stop lingering File Browser: ' + err.message);
        else logToRenderer('Lingering File Browser stopped.');
        fileBrowserProcess = null;
        updateStatus('STOPPED');
        resolve();
      });
    });
  }
}

async function startFileBrowser() {
  if (await isPortInUse(PORT)) {
    logToRenderer(`Initialization...`);
    await stopIfRunning();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const folderPath = path.dirname(dbPath);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  fileBrowserProcess = spawn(exePath, [
    '-p', PORT,
    '-r', htdocsPath,
    '-d', dbPath
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  fileBrowserProcess.stdout?.on('data', (data) => logToRenderer(data.toString()));
  fileBrowserProcess.stderr?.on('data', (data) => logToRenderer(data.toString()));
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
  if (!fileBrowserProcess) return { name: 'File Browser', status: 'STOPPED' };
  const usage = await pidusage(fileBrowserProcess.pid);
  return {
    name: 'File Browser',
    pid: fileBrowserProcess.pid,
    cpu: usage.cpu.toFixed(1) + '%',
    memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
    port: PORT,
    status: 'RUNNING',
  };
}

module.exports = { setFileBrowserMain, startFileBrowser, stopFileBrowser, getFileBrowserStats };
