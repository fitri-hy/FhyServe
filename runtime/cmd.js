const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const { getBasePath } = require('../utils/pathResource');

let cmdProcess = null;
let mainWindow = null;

const basePath = getBasePath();
const mysqlCwd = path.join(basePath, 'resources', 'mysql');
const mysqlBinPath = path.join(mysqlCwd, 'bin');

function setCmdMain(window) {
  mainWindow = window;
}

function startCmd() {
  if (cmdProcess) {
    return;
  }

  const originalPath = process.env.PATH || '';
  const pathSeparator = process.platform === 'win32' ? ';' : ':';
  const newPath = mysqlBinPath + pathSeparator + originalPath;

  const env = { ...process.env, PATH: newPath };

  cmdProcess = spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
    shell: true,
    windowsHide: true,
    env,
    stdio: 'pipe',
  });

  cmdProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    if (mainWindow) {
      mainWindow.webContents.send('cmd-output', msg);
    }
  });

  cmdProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (mainWindow) {
      mainWindow.webContents.send('cmd-output', msg);
    }
  });

  cmdProcess.on('close', (code) => {
    cmdProcess = null;
    if (mainWindow) {
      mainWindow.webContents.send('cmd-status', 'STOPPED');
    }
  });

  if (mainWindow) {
    mainWindow.webContents.send('cmd-status', 'RUNNING');
  }
}

function stopCmd() {
  if (!cmdProcess) {
    return;
  }

  kill(cmdProcess.pid, 'SIGTERM', (err) => {
    if (err) {
      console.error('Failed to kill process:', err);
    } else {
      //console.log('Process killed successfully');
    }
  });

  cmdProcess = null;

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('cmd-status', 'STOPPED');
  }
}

function sendCommand(command, isSQL = false) {
  if (!cmdProcess) {
    return;
  }

  let cmd = command.trim();

  if (isSQL && !cmd.endsWith(';')) {
    cmd += ';';
  }

  cmdProcess.stdin.write(cmd + '\n');
}

module.exports = {
  setCmdMain,
  startCmd,
  stopCmd,
  sendCommand,
};
