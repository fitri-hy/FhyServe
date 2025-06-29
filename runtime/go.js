const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const http = require('http');
const find = require('find-process');
const pidusage = require('pidusage');
const chokidar = require('chokidar');
const { getBasePath, isDevelopment } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');
const { getWATCHER } = require('../utils/watcher');

const BASE_PORT = getPORT('GOLANG_PORT');
const CHOKIDAR = getWATCHER('WATCHER');

const basePath = getBasePath();
const goExec = path.join(basePath, 'resources', 'go', 'bin', 'go.exe');
const goWebDir = isDevelopment()
  ? path.join(basePath, 'public_html', 'go_web')
  : path.join(basePath, 'resources', 'public_html', 'go_web');

let mainWindow = null;
let watcher = null;
let processes = {};

function formatLog(projectName, message) {
  return `[${projectName.toUpperCase()}] ${message}`;
}

function setGoMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'golang', message });
  }
}

function updateStatus(project, status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('golang-status', { project, status });
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractPortFromScript(scriptPath) {
  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const match = content.match(/port\s*:=\s*["'](\d+)["']/i);
    if (match) return parseInt(match[1], 10);
  } catch (err) {
    logToRenderer(`Failed to read port from ${scriptPath}: ${err.message}`);
  }
  return null;
}

function scanSubProjects() {
  if (!fs.existsSync(goWebDir)) return [];

  const entries = fs.readdirSync(goWebDir, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const script = path.join(goWebDir, entry.name, 'index.go');
      if (fs.existsSync(script)) projects.push(entry.name);
    } else if (entry.isFile() && entry.name === 'index.go') {
      projects.push('main');
    }
  }
  return projects;
}

function getProjectNameFromPath(changedPath, baseDir) {
  const relative = path.relative(baseDir, changedPath);
  const parts = relative.split(path.sep);
  return parts.length > 0 ? parts[0] : null;
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
    } catch (_) {}
    await delay(500);
  }
  return false;
}

async function startProcess(projectName, scriptPath, port, cwd, isRestart = false) {
  if (!fs.existsSync(goExec)) {
    logToRenderer(formatLog(projectName, `Go executable not found at ${goExec}`));
    updateStatus(projectName, 'ERROR');
    return;
  }

  if (!fs.existsSync(scriptPath)) {
    logToRenderer(formatLog(projectName, `index.go not found in ${scriptPath}`));
    updateStatus(projectName, 'ERROR');
    return;
  }

  if (processes[projectName]) {
    await new Promise(resolve => {
      kill(processes[projectName].proc.pid, 'SIGTERM', () => {
        delete processes[projectName];
        resolve();
      });
    });
    await delay(500);
  }

  return new Promise((resolve, reject) => {
    const cmd = spawn(goExec, ['run', scriptPath], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    cmd.stdout?.on('data', data =>
      logToRenderer(formatLog(projectName, data.toString().trim()))
    );
    cmd.stderr?.on('data', data =>
      logToRenderer(formatLog(projectName, `ERROR: ${data.toString().trim()}`))
    );

    cmd.on('close', () => {
      delete processes[projectName];
      updateStatus(projectName, 'STOPPED');
    });

    waitForReady(port, 7000).then((ready) => {
      if (ready) {
        updateStatus(projectName, 'RUNNING');
        processes[projectName] = { proc: cmd, port };
        logToRenderer(formatLog(projectName, 'is running.'));
        resolve();
      } else {
        cmd.kill();
        updateStatus(projectName, 'ERROR');
        logToRenderer(formatLog(projectName, 'failed to start.'));
        reject();
      }
    });
  });
}

async function startGoServer() {
  const subProjects = scanSubProjects();
  for (const proj of subProjects) {
    const scriptPath = proj === 'main'
      ? path.join(goWebDir, 'index.go')
      : path.join(goWebDir, proj, 'index.go');

    const port = extractPortFromScript(scriptPath);
    if (!port) {
      logToRenderer(formatLog(proj, 'No port found, skipping'));
      continue;
    }

    await startProcess(proj, scriptPath, port, path.dirname(scriptPath));
  }

  if (CHOKIDAR) {
    watchSubProjects(goWebDir);
  }
}

async function restartProject(projectName) {
  const scriptPath = projectName === 'main'
    ? path.join(goWebDir, 'index.go')
    : path.join(goWebDir, projectName, 'index.go');

  const port = extractPortFromScript(scriptPath);
  if (!port) return;

  logToRenderer(formatLog(projectName, 'Restarting...'));
  await startProcess(projectName, scriptPath, port, path.dirname(scriptPath), true);
}

function watchSubProjects(goWebDir) {
  if (watcher) watcher.close();

  watcher = chokidar.watch(goWebDir, {
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
    .on('change', pathFile => {
      const proj = getProjectNameFromPath(pathFile, goWebDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('error', err => logToRenderer(formatLog('WATCHER', `Watcher error: ${err.message}`)));

  watcher.on('ready', () => {
    logToRenderer('[WATCHER] Watching Go projects...');
  });
}

async function stopGoServer() {
  for (const [projectName, { proc }] of Object.entries(processes)) {
    kill(proc.pid, 'SIGTERM', () => {
      updateStatus(projectName, 'STOPPED');
    });
  }
  processes = {};
}

// Monitoring
async function getGoStats() {
  if (!processes || Object.keys(processes).length === 0) {
    return {
      name: 'Go',
      status: 'STOPPED',
    };
  }

  const firstProject = Object.values(processes)[0];
  if (!firstProject || !firstProject.proc) {
    return {
      name: 'Go',
      status: 'STOPPED',
    };
  }

  try {
    const usage = await pidusage(firstProject.proc.pid);
    return {
      name: 'Go',
      pid: firstProject.proc.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: firstProject.port || '-',
      status: 'RUNNING'
    };
  } catch (err) {
    return {
      name: 'Go',
      status: 'ERROR',
      error: err.message
    };
  }
}

module.exports = {
  startGoServer,
  stopGoServer,
  setGoMain,
  getGoStats,
};
