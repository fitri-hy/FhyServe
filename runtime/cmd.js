const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const { getBasePath, apacheOpenFolder, nginxOpenFolder, nodeOpenFolder, pythonOpenFolder } = require('../utils/pathResource');

let cmdProcess = null;
let mainWindow = null;

const basePath = getBasePath();

const customPaths = [
  path.join(basePath, 'resources', 'apache', 'bin'),
  path.join(basePath, 'resources', 'mysql', 'bin'),
  path.join(basePath, 'resources', 'php'),
  path.join(basePath, 'resources', 'nodejs'),
  path.join(basePath, 'resources', 'python'),
  path.join(basePath, 'resources', 'nginx'),
  path.join(basePath, 'resources', 'git', 'cmd')
];

const system32Path = path.join(process.env.windir || 'C:\\Windows', 'System32');

const pathSeparator = process.platform === 'win32' ? ';' : ':';
const isolatedPath = [...customPaths, system32Path].join(pathSeparator);

function setCmdMain(window) {
  mainWindow = window;
}

function startCmd() {
  if (cmdProcess) return;

  const env = {
    ...process.env,
    PATH: isolatedPath,
  };

  const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';

  cmdProcess = spawn(shell, [], {
    shell: true,
    windowsHide: true,
    env,
    stdio: 'pipe',
  });

  cmdProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    mainWindow?.webContents.send('cmd-output', msg);
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

  cmdProcess.stdin.write(cmd + '\n');
}

module.exports = {
  setCmdMain,
  startCmd,
  stopCmd,
  sendCommand,
};
