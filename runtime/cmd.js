const { app } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const pidusage = require('pidusage');
const { getBasePath, apacheOpenFolder, nginxOpenFolder, nodeOpenFolder, pythonOpenFolder, goOpenFolder, rubyOpenFolder } = require('../utils/pathResource');
const { getENV } = require('../utils/env');
const { rGit, rComposer, ReLaunchIsFinish } = require('./resourceDownload');

const PATH_SYSTEM = getENV('PATH_SYSTEM');

let cmdProcess = null;
let mainWindow = null;
let lastPrompt = '';

const basePath = getBasePath();

const customPaths = [
  path.join(basePath, 'resources', 'apache', 'bin'),
  path.join(basePath, 'resources', 'mysql', 'bin'),
  path.join(basePath, 'resources', 'php'),
  path.join(basePath, 'resources', 'nodejs'),
  path.join(basePath, 'resources', 'python'),
  path.join(basePath, 'resources', 'nginx'),
  path.join(basePath, 'resources', 'git', 'cmd'),
  path.join(basePath, 'resources', 'composer', 'bin'),
  path.join(basePath, 'resources', 'go', 'bin'),
  path.join(basePath, 'resources', 'ruby', 'bin')
];

const system32Path = path.join(process.env.windir || 'C:\\Windows', 'System32');

const pathSeparator = process.platform === 'win32' ? ';' : ':';
const isolatedPath = [...customPaths, system32Path].join(pathSeparator);

function setCmdMain(window) {
  mainWindow = window;
}

async function startCmd() {
	
  try {
    const progressHandler = progress => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('resource-progress', progress);
      }
    };

    const statuses = [];
    statuses.push(await ReLaunchIsFinish(rGit, progressHandler));
    statuses.push(await ReLaunchIsFinish(rComposer, progressHandler));

    if (statuses.includes('done')) {
      progressHandler({ status: 'restarting', message: 'Restarting app after resource initialization...' });
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 1000);
      return;
    }

  } catch (err) {
    console.error('Error during resource download:', err);
  }
  
  if (cmdProcess) return;

  const systemPath = PATH_SYSTEM ? process.env.PATH || '' : '';
  const winSystem32 = path.join(process.env.windir || 'C:\\Windows', 'System32');

  const finalPath = PATH_SYSTEM
    ? [...customPaths, process.env.PATH || ''].join(pathSeparator)
    : [...customPaths, winSystem32].join(pathSeparator);

  const env = {
    ...process.env,
    PATH: finalPath,
  };

  const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';

  cmdProcess = spawn(shell, [], {
    shell: true,
    windowsHide: true,
    env,
    stdio: 'pipe',
  });

  cmdProcess.stdout.on('data', (data) => {
    const output = data.toString();
    const lines = output.split(/\r?\n/);

    for (let line of lines) {
      line = line.trim();
      if (line === '') continue;

      if (/^echo\s+%cd%$/i.test(line)) continue;

      if (/^[A-Z]:\\/.test(line)) {
        lastPrompt = line.replace(/>+$/, '') + '>';
       continue;
      }

      mainWindow?.webContents.send('cmd-output', line + '\n');
    }

    if (lastPrompt) {
    mainWindow?.webContents.send('cmd-output', lastPrompt + ' ');
      lastPrompt = '';
    }
  });

  cmdProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    mainWindow?.webContents.send('cmd-output', msg);
  });

  cmdProcess.on('close', () => {
    cmdProcess = null;
    mainWindow?.webContents.send('cmd-status', 'STOPPED');
  });

  mainWindow?.webContents.send('cmd-status', 'RUNNING');
}

function stopCmd() {
  if (!cmdProcess) return;

  kill(cmdProcess.pid, 'SIGTERM', (err) => {
    if (err) console.error('Failed to kill process:', err);
  });

  cmdProcess = null;
  if (!mainWindow?.isDestroyed()) {
    mainWindow.webContents.send('cmd-status', 'STOPPED');
  }
}

function sendCommand(command, isSQL = false) {
  if (!cmdProcess) return;

  let cmd = command.trim();
  let targetPath = null;

  if (process.platform === 'win32') {
    if (cmd === 'ls') cmd = 'dir';
    if (cmd === 'pwd') cmd = 'echo %CD%';
    if (cmd === 'clear') cmd = 'cls';
  } else {
    if (cmd === 'clear') cmd = 'clear';
  }

  if (cmd === 'cls' || cmd === 'clear') {
    mainWindow?.webContents.send('cmd-clear');
    cmdProcess.stdin.write(process.platform === 'win32' ? 'echo %CD%\n' : 'pwd\n');
    return;
  }

  switch (cmd) {
    case 'go apache_web':
      targetPath = apacheOpenFolder();
      break;
    case 'go nginx_web':
      targetPath = nginxOpenFolder();
      break;
    case 'go node_web':
      targetPath = nodeOpenFolder();
      break;
    case 'go python_web':
      targetPath = pythonOpenFolder();
      break;
    case 'go go_web':
      targetPath = goOpenFolder();
      break;
    case 'go ruby_web':
      targetPath = rubyOpenFolder();
      break;
    case 'go default':
      const cdCommand = process.platform === 'win32'
        ? `cd /d "${basePath}"`
        : `cd "${basePath}"`;
      const runCommand = 'node conf-reset.js';
      cmdProcess.stdin.write(cdCommand + '\n');
      cmdProcess.stdin.write(runCommand + '\n');
      return;
  }

  if (targetPath) {
    const cdCommand = process.platform === 'win32'
      ? `cd /d "${targetPath}"`
      : `cd "${targetPath}"`;
    cmdProcess.stdin.write(cdCommand + '\n');
    return;
  }

  if (isSQL && !cmd.endsWith(';')) {
    cmd += ';';
  }

  cmdProcess.stdin.write(cmd + (process.platform === 'win32' ? '\r\n' : '\n'));
}

// Monitoring
async function getCmdStats() {
  if (!cmdProcess) {
    return {
      name: 'CMD',
      status: 'STOPPED',
    };
  }

  try {
    const stats = await pidusage(cmdProcess.pid);
    return {
      name: 'CMD',
      pid: cmdProcess.pid,
      cpu: stats.cpu.toFixed(1) + '%',
      memory: (stats.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: '-',
      status: 'RUNNING',
    };
  } catch (err) {
    return {
      name: 'CMD',
      status: 'ERROR',
      error: err.message,
    };
  }
}

module.exports = {
  setCmdMain,
  startCmd,
  stopCmd,
  sendCommand,
  getCmdStats,
};
