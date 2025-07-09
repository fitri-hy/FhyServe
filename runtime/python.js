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

const BASE_PORT = getPORT('PYTHON_PORT');
const CHOKIDAR = getWATCHER('WATCHER');

let pythonProcesses = {};
let pythonPorts = {};
let mainWindow = null;
let watcher = null;

const basePath = getBasePath();
const pythonExec = path.join(basePath, 'resources', 'python', 'python.exe');
const htdocsPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'python_web')
  : path.join(basePath, 'resources', 'public_html', 'python_web');
/**
 * Sets the main application window for Python service communication.
 * @param {Electron.BrowserWindow} win - The main Electron browser window instance
 */
function setPythonMain(win) {
  mainWindow = win;
}

/**
 * Sends a log message to the renderer process.
 * @param {string} message - The log message to send
 */
function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'python', message });
  }
}

/**
 * Updates the status of a Python project in the renderer.
 * @param {string} project - The name of the project
 * @param {string} status - The current status (e.g., 'RUNNING', 'STOPPED', 'ERROR')
 */
function updateStatus(project, status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('python-status', { project, status });
    logToRenderer(`[${project.toUpperCase()}] Status updated to ${status}`);
  }
}

/**
 * Creates a promise that resolves after a specified delay.
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts the port number from a Python script file.
 * @param {string} scriptPath - Path to the Python script file
 * @returns {number|null} The port number if found, null otherwise
 */
function extractPort(scriptPath) {
  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const match = content.match(/port\s*=\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  } catch (e) {
    logToRenderer(`Failed to read port from ${scriptPath}: ${e.message}`);
    return null;
  }
}

/**
 * Waits for a Python server to become ready by checking HTTP response.
 * @param {number} port - The port to check for server readiness
 * @param {number} [timeout=5000] - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} True if server is ready, false if timeout occurred
 */
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
    } catch (_) { }
    await delay(500);
  }
  return false;
}
/**
 * Starts a Python project with the specified configuration.
 * 
 * This function handles process creation, output logging, and health checks
 * to ensure the Python service is running properly.
 * 
 * @param {string} projectName - Name of the project to start
 * @param {string} scriptPath - Path to the Python script file to execute
 * @param {number} port - Port number the Python service will listen on
 * @returns {Promise<void>} Resolves when the process starts successfully
 */
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
    delete pythonPorts[projectName];
    updateStatus(projectName, 'STOPPED');
    logToRenderer(`[${projectName.toUpperCase()}] Has stopped.`);
  });

  logToRenderer(`[${projectName.toUpperCase()}] Waiting for a response from http://localhost:${port}...`);

  const ready = await waitForPythonReady(port);
  if (ready) {
    updateStatus(projectName, 'RUNNING');
    pythonPorts[projectName] = port;
    logToRenderer(`[${projectName.toUpperCase()}] Is running.`);
  } else {
    updateStatus(projectName, 'ERROR');
    logToRenderer(`[${projectName.toUpperCase()}] Failed to start or respond on port ${port}.`);
    proc.kill();
  }
}

/**
 * Stops a running Python project.
 * 
 * Terminates the Python process associated with the given project name
 * and updates the project status.
 * 
 * @param {string} projectName - Name of the project to stop
 * @returns {Promise<void>} Resolves when the process has been terminated
 */
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

/**
 * Scans for Python sub-projects in the htdocs directory.
 * 
 * @returns {string[]} Array of project names that contain an index.py file
 */
function scanSubProjects() {
  if (!fs.existsSync(htdocsPath)) return [];

  return fs.readdirSync(htdocsPath).filter(name => {
    const fullPath = path.join(htdocsPath, name);
    return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'index.py'));
  });
}

/**
 * Extracts the project name from a file path.
 * 
 * @param {string} changedPath - The full path of the changed file
 * @param {string} baseDir - The base directory to use as reference
 * @returns {string|null} The project name or null if it couldn't be determined
 */
function getProjectNameFromPath(changedPath, baseDir) {
  const relative = path.relative(baseDir, changedPath);
  const parts = relative.split(path.sep);
  if (parts.length === 0) return null;
  return parts[0];
}

/**
 * Restarts a Python project after file changes are detected.
 * 
 * Handles both the main project and sub-projects by locating the appropriate
 * index.py file, extracting port information, and restarting the process.
 * 
 * @param {string} projectName - The name of the project to restart ('main' or a sub-project name)
 * @returns {Promise<void>} A promise that resolves when the restart is complete
 */
async function restartPythonProject(projectName) {
  if (projectName === 'main') {
    const mainScript = path.join(htdocsPath, 'index.py');
    if (!fs.existsSync(mainScript)) return;

    let port = extractPort(mainScript);
    if (!port) {
      logToRenderer(`[MAIN] Port not found in index.py, using default port ${BASE_PORT}.`);
      port = BASE_PORT;
    }

    logToRenderer(`[MAIN] Restarting main due to file changes...`);
    await startPythonProject('main', mainScript, port);
  } else {
    const scriptPath = path.join(htdocsPath, projectName, 'index.py');
    if (!fs.existsSync(scriptPath)) return;

    const port = extractPort(scriptPath);
    if (!port) {
      logToRenderer(`[${projectName.toUpperCase()}] Port not found in index.py, skipping restart.`);
      return;
    }

    logToRenderer(`[${projectName.toUpperCase()}] Restarting due to file changes...`);
    await startPythonProject(projectName, scriptPath, port);
  }
}
/**
 * Sets up file system watchers for Python projects.
 * 
 * This function creates a chokidar watcher to monitor file changes in Python project 
 * directories. When changes are detected, it schedules restarts for the affected projects
 * with debouncing to prevent excessive restarts during rapid file changes.
 * 
 * @returns {void}
 */
function watchPythonProjects() {
  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(htdocsPath, {
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
        await restartPythonProject(proj);
      }
      changedProjects.clear();
    }, 1000);
  };

  watcher
    .on('add', pathFile => {
      const proj = getProjectNameFromPath(pathFile, htdocsPath);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('change', pathFile => {
      const proj = getProjectNameFromPath(pathFile, htdocsPath);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('unlink', pathFile => {
      const proj = getProjectNameFromPath(pathFile, htdocsPath);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('addDir', pathDir => {
      const proj = getProjectNameFromPath(pathDir, htdocsPath);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('unlinkDir', pathDir => {
      const proj = getProjectNameFromPath(pathDir, htdocsPath);
      if (proj) {
        changedProjects.add(proj);
        scheduleRestart();
      }
    })
    .on('error', err => {
      logToRenderer(`[WATCHER] Watcher error: ${err.message}`);
    });

  watcher.on('ready', () => {
    logToRenderer('[WATCHER] Initial scan complete. Monitoring python project changes...');
  });
}

/**
 * Starts the Python server and all sub-projects.
 * 
 * This function initializes the main Python project and all sub-projects by locating
 * their respective index.py files, extracting port information, and starting each
 * project's server process. It also sets up file watching if enabled.
 * 
 * @returns {Promise<void>} A promise that resolves when all projects have been started
 */
async function startPython() {
  const mainScript = path.join(htdocsPath, 'index.py');
  if (fs.existsSync(mainScript)) {
    let mainPort = extractPort(mainScript);
    if (!mainPort) {
      logToRenderer(`Main script port not found, using default port ${BASE_PORT}.`);
      mainPort = BASE_PORT;
    }
    await startPythonProject('main', mainScript, mainPort);
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

  if (CHOKIDAR) {
    watchPythonProjects();
  }
}
/**
 * Stops the Python server and all running sub-projects.
 * 
 * This function performs a graceful shutdown of the Python environment by:
 * 1. Closing any active file system watchers
 * 2. Terminating all running Python processes by project name
 * 
 * Each project is stopped individually using the stopPythonProject function,
 * which ensures proper cleanup of resources and status updates.
 * 
 * @returns {Promise<void>} A promise that resolves when all Python processes have been terminated
 */
async function stopPython() {
  if (watcher) {
    await watcher.close();
    watcher = null;
    logToRenderer('[WATCHER] Watcher stopped.');
  }

  const runningProjects = Object.keys(pythonProcesses);
  for (const proj of runningProjects) {
    await stopPythonProject(proj);
  }
}

/**
 * Gets the runtime statistics for the Python service.
 * This function checks the global variable `pythonProcesses` to determine if any Python processes are running.
 * If no Python processes are running, it returns an object indicating the stopped state.
 * If Python is running, it uses `pidusage` to get CPU and memory usage, and returns detailed status information.
 * If an error occurs while getting the status, it returns an object containing error information.
 *
 * @returns {Promise<Object>} An object containing the following fields:
 *   - name {string} Service name, fixed as 'Python'
 *   - pid {number} Python process ID (only when the service is running)
 *   - cpu {string} CPU usage, formatted as '<number>%' (only when the service is running)
 *   - memory {string} Memory usage, formatted as '<number> MB' (only when the service is running)
 *   - port {string} Port number Python is listening on, or '-' if not available (only when the service is running)
 *   - status {string} Service status, possible values are 'STOPPED', 'RUNNING', or 'ERROR'
 *   - error {string} Error message (only when status is 'ERROR')
 */
async function getPythonStats() {
  const names = Object.keys(pythonProcesses);
  if (names.length === 0) {
    return {
      name: 'Python',
      status: 'STOPPED',
    };
  }

  const projectName = names[0];
  const proc = pythonProcesses[projectName];
  const port = pythonPorts[projectName] || '-';

  if (!proc || !proc.pid) {
    return {
      name: 'Python',
      status: 'STOPPED',
    };
  }

  try {
    const usage = await pidusage(proc.pid);
    return {
      name: 'Python',
      pid: proc.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port,
      status: 'RUNNING'
    };
  } catch (err) {
    return {
      name: 'Python',
      status: 'ERROR',
      error: err.message
    };
  }
}

module.exports = { startPython, stopPython, setPythonMain, getPythonStats };
