const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const http = require('http');
const { getBasePath, isDevelopment } = require('../utils/pathResource');

let pythonProcesses = {};
let mainWindow = null;

const basePath = getBasePath();
const pythonExec = path.join(basePath, 'resources', 'python', 'python.exe');
const htdocsPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'python_web')
  : path.join(basePath, 'resources', 'public_html', 'python_web');

function setPythonMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'python', message });
  }
}

function updateStatus(project, status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('python-status', { project, status });
    logToRenderer(`[${project.toUpperCase()}] Status updated to ${status}`);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractPort(scriptPath) {
  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const match = content.match(/port\s*=\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  } catch (e) {
    logToRenderer(`Failed to read port from ${scriptPath}: ${e.message}`);
    return null;
  }
}

async function waitForPythonReady(port, timeout = 5000) {
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

async function startPythonProject(projectName, scriptPath, port) {
  if (pythonProcesses[projectName]) {
    await stopPythonProject(projectName);
  }

  logToRenderer(`[${projectName.toUpperCase()}] Initialized...`);

  const proc = spawn(pythonExec, [scriptPath], {
    cwd: path.dirname(scriptPath),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  pythonProcesses[projectName] = proc;

  proc.stdout?.on('data', data => {
    logToRenderer(`[${projectName.toUpperCase()}] ${data.toString().trim()}`);
  });

  proc.stderr?.on('data', data => {
    const msg = data.toString().trim();
    if (msg.match(/"GET .* HTTP\/1\.1" 200 -/)) {
      logToRenderer(`[${projectName.toUpperCase()}] ${msg}`);
    } else {
      logToRenderer(`[${projectName.toUpperCase()}] ERROR: ${msg}`);
    }
  });

  proc.on('close', () => {
    delete pythonProcesses[projectName];
    updateStatus(projectName, 'STOPPED');
    logToRenderer(`[${projectName.toUpperCase()}] Has stopped.`);
  });

  logToRenderer(`[${projectName.toUpperCase()}] Waiting for a response from http://localhost:${port}...`);

  const ready = await waitForPythonReady(port);
  if (ready) {
    updateStatus(projectName, 'RUNNING');
    logToRenderer(`[${projectName.toUpperCase()}] Is running.`);
  } else {
    updateStatus(projectName, 'ERROR');
    logToRenderer(`[${projectName.toUpperCase()}] Failed to start or respond on port ${port}.`);
    proc.kill();
  }
}

async function stopPythonProject(projectName) {
  const proc = pythonProcesses[projectName];
  if (!proc) {
    updateStatus(projectName, 'STOPPED');
    logToRenderer(`[${projectName.toUpperCase()}] Has stopped.`);
    return;
  }

  return new Promise(resolve => {
    kill(proc.pid, 'SIGTERM', (err) => {
      if (err) {
        logToRenderer(`[${projectName.toUpperCase()}] Stop failed: ${err.message}`);
      } else {
        logToRenderer(`[${projectName.toUpperCase()}] Has stopped.`);
      }
      updateStatus(projectName, 'STOPPED');
      delete pythonProcesses[projectName];
      resolve();
    });
  });
}

function scanSubProjects() {
  if (!fs.existsSync(htdocsPath)) return [];

  return fs.readdirSync(htdocsPath).filter(name => {
    const fullPath = path.join(htdocsPath, name);
    return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'index.py'));
  });
}

async function startPython() {
  const mainScript = path.join(htdocsPath, 'index.py');
  if (fs.existsSync(mainScript)) {
    const mainPort = extractPort(mainScript);
    if (mainPort) {
      await startPythonProject('main', mainScript, mainPort);
    } else {
      logToRenderer('Main script port not found, skipping main start.');
    }
  } else {
    logToRenderer('Main script index.py not found in root python_web.');
  }

  const projects = scanSubProjects();
  for (const proj of projects) {
    const scriptPath = path.join(htdocsPath, proj, 'index.py');
    const port = extractPort(scriptPath);
    if (port) {
      await startPythonProject(proj, scriptPath, port);
    } else {
      logToRenderer(`Port not found for project ${proj}, skipping start.`);
    }
  }
}

async function stopPython() {
  const runningProjects = Object.keys(pythonProcesses);
  for (const proj of runningProjects) {
    await stopPythonProject(proj);
  }
}

module.exports = { startPython, stopPython, setPythonMain };
