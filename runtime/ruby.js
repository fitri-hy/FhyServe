const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const http = require('http');
const pidusage = require('pidusage');
const chokidar = require('chokidar');
const { getBasePath, isDevelopment } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');
const { getWATCHER } = require('../utils/watcher');

const BASE_PORT = getPORT('RUBY_PORT');
const CHOKIDAR = getWATCHER('WATCHER');

const basePath = getBasePath();
const rubyExec = path.join(basePath, 'resources', 'ruby', 'bin', 'ruby.exe');
const rubyWebDir = isDevelopment()
  ? path.join(basePath, 'public_html', 'ruby_web')
  : path.join(basePath, 'resources', 'public_html', 'ruby_web');

let mainWindow = null;
let watcher = null;
let processes = {};

function formatLog(projectName, message) {
  return `[${projectName.toUpperCase()}] ${message}`;
}

function setRubyMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'ruby', message });
  }
}

function updateStatus(project, status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('ruby-status', { project, status });
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractPortFromScript(scriptPath) {
  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const match = content.match(/PORT\s*=\s*["']?(\d+)["']?/i);
    if (match) return parseInt(match[1], 10);
  } catch (err) {
    logToRenderer(`Failed to read port from ${scriptPath}: ${err.message}`);
  }
  return null;
}

function scanSubProjects() {
  if (!fs.existsSync(rubyWebDir)) return [];

  const entries = fs.readdirSync(rubyWebDir, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const script = path.join(rubyWebDir, entry.name, 'index.rb');
      if (fs.existsSync(script)) projects.push(entry.name);
    } else if (entry.isFile() && entry.name === 'index.rb') {
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
  if (!fs.existsSync(rubyExec)) {
    logToRenderer(formatLog(projectName, `Ruby executable not found at ${rubyExec}`));
    updateStatus(projectName, 'ERROR');
    return;
  }

  if (!fs.existsSync(scriptPath)) {
    logToRenderer(formatLog(projectName, `index.rb not found in ${scriptPath}`));
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
    const cmd = spawn(rubyExec, [scriptPath], {
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
        
        // Log custom main server started message
        if (projectName.toLowerCase() === 'main') {
          logToRenderer(formatLog(projectName, `Main server started on http://localhost:${port}`));
        }
        
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

function watchSubProjects(rubyWebDir) {
  if (watcher) watcher.close();

  watcher = chokidar.watch(rubyWebDir, {
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
      const proj = getProjectNameFromPath(pathFile, rubyWebDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('error', err => logToRenderer(formatLog('WATCHER', `Watcher error: ${err.message}`)));

  watcher.on('ready', () => {
    logToRenderer(formatLog('WATCHER', 'Watching Ruby projects...'));
  });
}

async function startRubyServer() {
  const subProjects = scanSubProjects();
  for (const proj of subProjects) {
    const scriptPath = proj === 'main'
      ? path.join(rubyWebDir, 'index.rb')
      : path.join(rubyWebDir, proj, 'index.rb');

    const port = extractPortFromScript(scriptPath);
    if (!port) {
      logToRenderer(formatLog(proj, 'No port found, skipping'));
      continue;
    }

    await startProcess(proj, scriptPath, port, path.dirname(scriptPath));
  }

  if (CHOKIDAR) {
    watchSubProjects(rubyWebDir);
  }
}

async function restartProject(projectName) {
  const scriptPath = projectName === 'main'
    ? path.join(rubyWebDir, 'index.rb')
    : path.join(rubyWebDir, projectName, 'index.rb');

  const port = extractPortFromScript(scriptPath);
  if (!port) return;

  logToRenderer(formatLog(projectName, 'Restarting...'));
  await startProcess(projectName, scriptPath, port, path.dirname(scriptPath), true);
}

function watchSubProjects(rubyWebDir) {
  if (watcher) watcher.close();

  watcher = chokidar.watch(rubyWebDir, {
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
      const proj = getProjectNameFromPath(pathFile, rubyWebDir);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('error', err => logToRenderer(formatLog('WATCHER', `Watcher error: ${err.message}`)));

  watcher.on('ready', () => {
    logToRenderer(formatLog('WATCHER', 'Watching Ruby projects...'));
  });
}

async function stopRubyServer() {
  for (const [projectName, { proc }] of Object.entries(processes)) {
    logToRenderer(formatLog(projectName, 'Stopping...'));
    kill(proc.pid, 'SIGTERM', () => {
      logToRenderer(formatLog(projectName, 'Has stopped.'));
      updateStatus(projectName, 'STOPPED');
    });
  }
  processes = {};
}

async function getRubyStats() {
  if (!processes || Object.keys(processes).length === 0) {
    return {
      name: 'Ruby',
      status: 'STOPPED',
    };
  }

  const firstProject = Object.values(processes)[0];
  if (!firstProject || !firstProject.proc) {
    return {
      name: 'Ruby',
      status: 'STOPPED',
    };
  }

  try {
    const usage = await pidusage(firstProject.proc.pid);
    return {
      name: 'Ruby',
      pid: firstProject.proc.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: firstProject.port || '-',
      status: 'RUNNING'
    };
  } catch (err) {
    return {
      name: 'Ruby',
      status: 'ERROR',
      error: err.message
    };
  }
}

module.exports = {
  startRubyServer,
  stopRubyServer,
  setRubyMain,
  getRubyStats,
};
