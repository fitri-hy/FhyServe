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

/**
 * Formats log messages with project name prefix
 * @param {string} projectName - The name of the project
 * @param {string} message - The log message
 * @returns {string} Formatted log message
 */
function formatLog(projectName, message) {
  return `[${projectName.toUpperCase()}] ${message}`;
}

/**
 * Sets the main window reference for Go service
 * @param {Electron.BrowserWindow} win - The main application window
 */
function setGoMain(win) {
  mainWindow = win;
}

/**
 * Logs messages to the renderer process
 * @param {string} message - The message to log
 */
function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'golang', message });
  }
}

/**
 * Updates the status of a Go project in the renderer
 * @param {string} project - The name of the project
 * @param {string} status - The current status (RUNNING, STOPPED, ERROR)
 */
function updateStatus(project, status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('golang-status', { project, status });
  }
}

/**
 * Creates a promise that resolves after a specified delay
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise<void>} A promise that resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts port number from a Go script file
 * @param {string} scriptPath - Path to the Go script
 * @returns {number|null} The port number if found, null otherwise
 */
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

/**
 * Scans sub-projects in the `goWebDir` directory.
 * 
 * This function checks each entry in the `goWebDir` directory:
 * - If the entry is a directory and contains an 'index.go' file, its name is added to the list of projects.
 * - If the entry is a file named 'index.go', 'main' is added to the list of projects.
 *
 * @returns {string[]} An array of project names. Each name corresponds to a sub-directory or 'main' for files named 'index.go' at the root.
 */
function scanSubProjects() {
  if (!fs.existsSync(goWebDir)) return [];

  const entries = fs.readdirSync(goWebDir, { withFileTypes: true });
  const projects = [];

  // Iterating through each entry in the directory to identify valid projects
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

/**
 * Extracts the project name from a file path by getting the first segment of the path relative to the base directory.
 * 
 * @param {string} changedPath - The absolute path of the file
 * @param {string} baseDir - The base directory to calculate the relative path from
 * @returns {string|null} The first segment of the relative path (project name) or null if the path has no segments
 */
function getProjectNameFromPath(changedPath, baseDir) {
  const relative = path.relative(baseDir, changedPath);
  const parts = relative.split(path.sep);
  return parts.length > 0 ? parts[0] : null;
}

/**
 * Waits for a server to become ready by repeatedly making HTTP requests until a 200 response is received,
 * or the timeout duration is exceeded.
 *
 * @param {number} port - The port number on which the server is expected to respond.
 * @param {number} [timeout=5000] - The maximum time (in milliseconds) to wait for the server to become ready.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the server responds with status 200,
 *                           or `false` if the timeout is reached before a successful response.
 */
async function waitForReady(port, timeout = 5000) {
  const start = Date.now();
  // Continuously check server readiness until timeout
  while (Date.now() - start < timeout) {
    try {
      // Send HTTP GET request to check server status
      const res = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, resolve);
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      // Check if server responded successfully
      if (res.statusCode === 200) return true;
    } catch (_) { }
    // Wait before retrying if server is not yet ready
    await delay(500);
  }
  // Return false if timeout occurs before server becomes ready
  return false;
}

/*
 * Starts a Go process with the given configuration
 * @param {string} projectName - Name of the project to run
 * @param {string} scriptPath - Path to the Go script file
 * @param {number} port - Port number to use for the service
 * @param {string} cwd - Current working directory for the process
 * @param {boolean} [isRestart=false] - Whether this is a restart operation
 * @returns {Promise} A promise that resolves when the process is successfully started
 *
 * The function handles:
 * - Validation of required files
 * - Termination of existing processes
 * - Process startup and logging
 * - Health check and status updates
 */
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

    /*
     * Set up output handling for the spawned process:
     * - stdout: Forward to renderer logs
     * - stderr: Add ERROR prefix and forward to renderer logs
     * - close event: Clean up process reference and update status
     */
    cmd.stdout?.on('data', data =>
      logToRenderer(formatLog(projectName, data.toString().trim()))
    );
    cmd.stderr?.on('data', data =>
      logToRenderer(formatLog(projectName, `ERROR: ${data.toString().trim()}`))
    );

    /*
     * Handle process close event:
     * - Remove process from tracking
     * - Update status to STOPPED
     */
    cmd.on('close', () => {
      delete processes[projectName];
      updateStatus(projectName, 'STOPPED');
    });

    /*
     * Wait for service to become ready:
     * - 7-second timeout for health check
     * - On success: Update status to RUNNING and resolve promise
     * - On failure: Kill process, update status to ERROR, and reject promise
     */
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

/**
 * Asynchronous function to start the Go server.
 * Scans all sub-projects and starts services for each project.
 * 
 * @returns {Promise<void>} No return value, but starts the server asynchronously.
 */
async function startGoServer() {
  // Get list of all sub-projects
  const subProjects = scanSubProjects();

  // Iterate through each sub-project and start the service
  for (const proj of subProjects) {
    // Build the script path for the current project
    const scriptPath = proj === 'main'
      ? path.join(goWebDir, 'index.go')
      : path.join(goWebDir, proj, 'index.go');

    // Extract port number from script file
    const port = extractPortFromScript(scriptPath);
    if (!port) {
      logToRenderer(formatLog(proj, 'No port found, skipping'));
      continue;
    }

    // Start process and wait for completion
    await startProcess(proj, scriptPath, port, path.dirname(scriptPath));
  }

  // If CHOKIDAR is enabled, watch for changes in sub-projects
  if (CHOKIDAR) {
    watchSubProjects(goWebDir);
  }
}

/**
 * Restarts a Go project by stopping and restarting its process.
 * 
 * This function locates the project's script file, extracts the port number,
 * and restarts the process. It handles both the main project and sub-projects.
 *
 * @param {string} projectName - The name of the project to restart ('main' or a sub-project name)
 * @returns {Promise<void>} A promise that resolves when the restart is complete
 */
async function restartProject(projectName) {
  const scriptPath = projectName === 'main'
    ? path.join(goWebDir, 'index.go')
    : path.join(goWebDir, projectName, 'index.go');

  const port = extractPortFromScript(scriptPath);
  if (!port) return;

  logToRenderer(formatLog(projectName, 'Restarting...'));
  await startProcess(projectName, scriptPath, port, path.dirname(scriptPath), true);
}

/**
 * Sets up a file watcher for Go projects that automatically restarts projects when files change.
 * 
 * This function creates a chokidar watcher instance to monitor the specified Go web directory
 * for file changes. When changes are detected, it intelligently groups changes by project and
 * schedules restarts with a debounce to prevent excessive restarts during rapid file changes.
 * 
 * @param {string} goWebDir - The directory containing Go web projects to watch
 * @returns {void}
 */
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
    logToRenderer(formatLog('WATCHER', 'Watching Go projects...'));
  });
}

/**
 * Stops all running Go server processes.
 * 
 * This function terminates all active Go processes tracked in the processes object,
 * sends appropriate termination signals, updates their status, and logs the shutdown.
 * After all processes are stopped, it clears the processes tracking object.
 * 
 * @returns {Promise<void>} A promise that resolves when all Go processes have been stopped
 */
async function stopGoServer() {
  for (const [projectName, { proc }] of Object.entries(processes)) {
    logToRenderer(formatLog(projectName, 'Stopping...'));
    kill(proc.pid, 'SIGTERM', () => {
      logToRenderer(formatLog(projectName, 'Has stopped.'));
      updateStatus(projectName, 'STOPPED');
    });
  }
  processes = {};
}

/**
 * Gets the runtime statistics for the Go service.
 * This function checks the global variable `processes` to determine if any Go processes are running.
 * If no Go processes are running, it returns an object indicating the stopped state.
 * If Go is running, it uses `pidusage` to get CPU and memory usage, and returns detailed status information.
 * If an error occurs while getting the status, it returns an object containing error information.
 *
 * @returns {Promise<Object>} An object containing the following fields:
 *   - name {string} Service name, fixed as 'Go'
 *   - pid {number} Go process ID (only when the service is running)
 *   - cpu {string} CPU usage, formatted as '<number>%' (only when the service is running)
 *   - memory {string} Memory usage, formatted as '<number> MB' (only when the service is running)
 *   - port {string} Port number Go is listening on, or '-' if not available (only when the service is running)
 *   - status {string} Service status, possible values are 'STOPPED', 'RUNNING', or 'ERROR'
 *   - error {string} Error message (only when status is 'ERROR')
 */
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
