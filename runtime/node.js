const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const pidusage = require('pidusage');
const chokidar = require('chokidar');
const { isDevelopment, getBasePath } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');
const { getWATCHER } = require('../utils/watcher');

const BASE_PORT = getPORT('NODEJS_PORT');
const CHOKIDAR = getWATCHER('WATCHER');

let watcher = null;

const basePath = getBasePath();
const nodeCwd = isDevelopment()
  ? path.join(basePath, 'resources', 'nodejs')
  : path.join(basePath, 'resources', 'nodejs');
const serverCwd = isDevelopment()
  ? path.join(basePath, 'public_html', 'node_web', 'index.js')
  : path.join(basePath, 'resources', 'public_html', 'node_web', 'index.js');
const nodeExec = process.platform === 'win32'
  ? path.join(nodeCwd, 'node.exe')
  : 'node';

let mainWindow = null;
let processes = {};

function formatLog(projectName, message) {
  return `[${projectName.toUpperCase()}] ${message}`;
}

function setNodeMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'nodejs', message });
  }
}

function updateStatus(project, status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(`nodejs-status-${project}`, status);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getProjectNameFromPath(changedPath, baseDir) {
  const relative = path.relative(baseDir, changedPath);
  const parts = relative.split(path.sep);
  if (parts.length === 0) return null;
  return parts[0];
}

function extractPortFromScript(scriptPath) {
  try {
    const fd = fs.openSync(scriptPath, 'r');
    const buffer = Buffer.alloc(1024);
    const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
    fs.closeSync(fd);
    const content = buffer.toString('utf8', 0, bytesRead);

    const match = content.match(/\b(?:const|let|var)\s+port\s*=\s*(\d+)\b/i);
    if (match) return parseInt(match[1], 10);
  } catch (err) {
    logToRenderer(`Failed to read port from ${scriptPath}: ${err.message}`);
  }
  return null;
}

async function restartProject(projectName) {
  if (projectName === 'main') {
    const mainScript = serverCwd;
    logToRenderer(formatLog('main', 'Restarting main process due to file changes...'));

    const subProjects = scanSubProjects().sort();
    const projectPorts = {};
    for (const proj of subProjects) {
      if (proj === 'main') continue;

      const scriptPath = isDevelopment()
        ? path.join(basePath, 'public_html', 'node_web', proj, 'index.js')
        : path.join(basePath, 'resources', 'public_html', 'node_web', proj, 'index.js');

      const port = extractPortFromScript(scriptPath);
      if (port) projectPorts[proj] = port;
    }
    const portsArg = JSON.stringify(projectPorts);

    try {
      await startProcess('main', mainScript, BASE_PORT, path.dirname(mainScript), true, portsArg);
    } catch (err) {
      logToRenderer(formatLog('main', `Failed to restart main: ${err.message}`));
    }
  } else {

    const scriptPath = isDevelopment()
      ? path.join(basePath, 'public_html', 'node_web', projectName, 'index.js')
      : path.join(basePath, 'resources', 'public_html', 'node_web', projectName, 'index.js');

    if (!fs.existsSync(scriptPath)) return;

    const port = extractPortFromScript(scriptPath);
    if (!port) {
      logToRenderer(formatLog(projectName, 'Port not found in index.js, skipping restart.'));
      return;
    }

    logToRenderer(formatLog(projectName, 'Restarting due to file changes...'));
    try {
      await startProcess(projectName, scriptPath, port, path.dirname(scriptPath), true);
    } catch (err) {
      logToRenderer(formatLog(projectName, `Failed to restart: ${err.message}`));
    }
  }
}

function watchSubProjects() {
  const nodeServerDir = isDevelopment()
    ? path.join(basePath, 'public_html', 'node_web')
    : path.join(basePath, 'resources', 'public_html', 'node_web');

  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(nodeServerDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    depth: 5,
  });

  const changedProjects = new Set();
  let restartTimeout = null;

  const scheduleRestart = () => {
    if (restartTimeout) clearTimeout(restartTimeout);
    restartTimeout = setTimeout(async () => {
      for (const proj of changedProjects) {
        await restartProject(proj);
      }
      changedProjects.clear();
    }, 1000);
  };

  watcher
    .on('add', pathFile => {
      const proj = getProjectNameFromPath(pathFile, nodeServerDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('change', pathFile => {
      const proj = getProjectNameFromPath(pathFile, nodeServerDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('unlink', pathFile => {
      const proj = getProjectNameFromPath(pathFile, nodeServerDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('addDir', pathDir => {
      const proj = getProjectNameFromPath(pathDir, nodeServerDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('unlinkDir', pathDir => {
      const proj = getProjectNameFromPath(pathDir, nodeServerDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('error', err => {
      logToRenderer(`[WATCHER] Watcher error: ${err.message}`);
    });

  watcher.on('ready', () => {
    logToRenderer('Initial scan complete. Monitoring active changes...');
  });
}

function scanSubProjects() {
  const nodeServerDir = isDevelopment()
    ? path.join(basePath, 'public_html', 'node_web')
    : path.join(basePath, 'resources', 'public_html', 'node_web',);
  if (!fs.existsSync(nodeServerDir)) return [];

  return fs.readdirSync(nodeServerDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => fs.existsSync(path.join(nodeServerDir, name, 'index.js')));
}

async function waitForReady(port, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, resolve);
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      if (res.statusCode === 200) return true;
    } catch (_) { }
    await delay(500);
  }
  return false;
}

function sendProjectPortsUpdate() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const mapping = {};
    for (const [projectName, { port }] of Object.entries(processes)) {
      mapping[projectName] = port;
    }
    mainWindow.webContents.send('nodejs-project-ports', mapping);
  }
}

async function startProcess(projectName, scriptPath, port, cwd, isRestart = false, extraArg = null) {
  if (!fs.existsSync(nodeExec)) {
    if (!isRestart) logToRenderer(formatLog(projectName, `Node executable not found: ${nodeExec}`));
    updateStatus(projectName, 'ERROR');
    throw new Error('Node executable not found');
  }

  if (!fs.existsSync(scriptPath)) {
    if (!isRestart) logToRenderer(formatLog(projectName, `Server script not found: ${scriptPath}`));
    updateStatus(projectName, 'ERROR');
    throw new Error('Server script not found');
  }

  if (processes[projectName]) {
    if (!isRestart) logToRenderer(formatLog(projectName, `Existing process found, killing before restart...`));
    await new Promise(resolve => {
      kill(processes[projectName].proc.pid, 'SIGTERM', () => {
        delete processes[projectName];
        resolve();
      });
    });
    await delay(500);
  }

  return new Promise((resolve, reject) => {
    const args = [scriptPath, port.toString()];
    if (extraArg) args.push(extraArg);

    const proc = spawn(nodeExec, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    proc.stdout?.on('data', data => {
      if (!isRestart) logToRenderer(formatLog(projectName, data.toString().trim()));
    });
    proc.stderr?.on('data', data =>
      logToRenderer(formatLog(projectName, `ERROR: ${data.toString().trim()}`))
    );

    proc.on('error', (err) => {
      logToRenderer(formatLog(projectName, `Process error: ${err.message}`));
      updateStatus(projectName, 'ERROR');
      reject(err);
    });

    proc.on('close', () => {
      delete processes[projectName];
      updateStatus(projectName, 'STOPPED');
    });

    if (!isRestart) logToRenderer(formatLog(projectName, `Waiting for a response from http://localhost:${port}...`));

    waitForReady(port, 7000).then((ready) => {
      if (ready) {
        updateStatus(projectName, 'RUNNING');
        processes[projectName] = { proc, port };
        sendProjectPortsUpdate();
        resolve();
        logToRenderer(formatLog(projectName, 'Is running.'));
      } else {
        updateStatus(projectName, 'ERROR');
        if (!isRestart) logToRenderer(formatLog(projectName, `Failed to start or respond.`));
        proc.kill();
        reject(new Error('Failed to start or respond'));
      }
    });
  });
}

async function startNodeServer() {
  for (const [projectName, { proc }] of Object.entries(processes)) {
    logToRenderer(formatLog(projectName, `Restart: stopping old process...`));
    await new Promise(resolve => {
      kill(proc.pid, 'SIGTERM', () => {
        updateStatus(projectName, 'STOPPED');
        delete processes[projectName];
        resolve();
      });
    });
  }

  const mainScript = serverCwd;

  const subProjects = scanSubProjects().sort();
  const projectPorts = {};
  for (const proj of subProjects) {
    if (proj === 'main') continue;

    const scriptPath = isDevelopment()
      ? path.join(basePath, 'public_html', 'node_web', proj, 'index.js')
      : path.join(basePath, 'resources', 'public_html', 'node_web', proj, 'index.js');

    const port = extractPortFromScript(scriptPath);
    if (port) projectPorts[proj] = port;
  }
  const portsArg = JSON.stringify(projectPorts);

  await startProcess('main', mainScript, BASE_PORT, path.dirname(mainScript), false, portsArg);

  for (const proj of subProjects) {
    if (proj === 'main') continue;

    const scriptPath = isDevelopment()
      ? path.join(basePath, 'public_html', 'node_web', proj, 'index.js')
      : path.join(basePath, 'resources', 'public_html', 'node_web', proj, 'index.js');

    const port = extractPortFromScript(scriptPath);
    if (!port) {
      logToRenderer(formatLog(proj, `No valid port found in index.js, skipping...`));
      continue;
    }
    await startProcess(proj, scriptPath, port, path.dirname(scriptPath));
  }
  if (CHOKIDAR) {
    watchSubProjects();
  }
}

async function stopNodeServer() {
  for (const [projectName, { proc }] of Object.entries(processes)) {
    await new Promise(resolve => {
      kill(proc.pid, 'SIGTERM', (err) => {
        if (err) {
          logToRenderer(formatLog(projectName, `Failed to stop process: ${err.message}`));
          updateStatus(projectName, 'ERROR');
        } else {
          logToRenderer(formatLog(projectName, `Has stopped.`));
          updateStatus(projectName, 'STOPPED');
        }
        resolve();
      });
    });
  }
  processes = {};
}

// Monitoring
async function getNodeStats() {
  if (!processes || Object.keys(processes).length === 0) {
    return {
      name: 'NodeJS',
      status: 'STOPPED',
    };
  }

  const firstProject = Object.values(processes)[0];
  if (!firstProject || !firstProject.proc) {
    return {
      name: 'NodeJS',
      status: 'STOPPED',
    };
  }

  try {
    const usage = await pidusage(firstProject.proc.pid);
    return {
      name: 'NodeJS',
      pid: firstProject.proc.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: firstProject.port || '-',
      status: 'RUNNING'
    };
  } catch (err) {
    return {
      name: 'NodeJS',
      status: 'ERROR',
      error: err.message
    };
  }
}

module.exports = { startNodeServer, stopNodeServer, setNodeMain, getNodeStats };
