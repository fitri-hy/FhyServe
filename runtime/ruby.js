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
/**
 * Formats a log message with the project name prefix.
 * @param {string} projectName - The name of the project
 * @param {string} message - The message to format
 * @returns {string} Formatted message with project name in uppercase
 */
function formatLog(projectName, message) {
  return `[${projectName.toUpperCase()}] ${message}`;
}

/**
 * Sets the main window reference for the Ruby service.
 * @param {Electron.BrowserWindow} win - The main Electron window instance
 */
function setRubyMain(win) {
  mainWindow = win;
}

/**
 * Sends a log message to the renderer process.
 * @param {string} message - The message to send to the renderer
 */
function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'ruby', message });
  }
}

/**
 * Updates the status of a Ruby project in the renderer.
 * @param {string} project - The name of the project
 * @param {string} status - The current status (e.g., 'RUNNING', 'STOPPED', 'ERROR')
 */
function updateStatus(project, status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('ruby-status', { project, status });
  }
}

/**
 * Creates a promise that resolves after the specified delay.
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts port number from a Ruby script file.
 * @param {string} scriptPath - Path to the Ruby script
 * @returns {number|null} The port number if found, null otherwise
 */
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
/**
 * Scans the Ruby web directory to find available projects.
 * 
 * This function checks each entry in the Ruby web directory:
 * - If the entry is a directory and contains an 'index.rb' file, the directory name is added to the projects list.
 * - If the entry is a file named 'index.rb' at the root level, 'main' is added to the projects list.
 * 
 * @returns {string[]} An array of project names found in the Ruby web directory.
 */
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

/**
 * Extracts the project name from a file path relative to the base directory.
 * 
 * @param {string} changedPath - The absolute path of the changed file
 * @param {string} baseDir - The base directory to calculate the relative path from
 * @returns {string|null} The project name (first segment of the relative path) or null if not found
 */
function getProjectNameFromPath(changedPath, baseDir) {
  const relative = path.relative(baseDir, changedPath);
  const parts = relative.split(path.sep);
  return parts.length > 0 ? parts[0] : null;
}

/**
 * Waits for a server to be ready by checking if it responds on the specified port.
 * 
 * @param {number} port - The port to check
 * @param {number} [timeout=5000] - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} True if the server is ready, false if timeout occurred
 */
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
/**
 * Starts a Ruby process with the given configuration
 * @param {string} projectName - Name of the project to run
 * @param {string} scriptPath - Path to the Ruby script file
 * @param {number} port - Port number to use for the service
 * @param {string} cwd - Current working directory for the process
 * @param {boolean} [isRestart=false] - Whether this is a restart operation
 * @returns {Promise<void>} A promise that resolves when the process is successfully started
 *                          or rejects if the process fails to start
 * 
 * The function handles:
 * - Validation of Ruby executable and script file
 * - Termination of existing processes
 * - Process startup and output logging
 * - Health check to verify the service is responding
 * - Status updates to the renderer
 */
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
/**
 * Sets up file system watchers for Ruby projects.
 * 
 * This function creates a chokidar watcher to monitor file changes in Ruby project
 * directories. When changes are detected, it schedules restarts for the affected projects
 * with debouncing to prevent excessive restarts during rapid file changes.
 *
 * @param {string} rubyWebDir - The directory containing Ruby web projects to watch
 * @returns {void}
 */
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

/**
 * Starts the Ruby server and all sub-projects.
 * 
 * This function initializes all Ruby sub-projects by scanning for their
 * respective index.rb files, extracting port information, and starting each
 * project's server process. It also sets up file watching if enabled.
 * 
 * @returns {Promise<void>} A promise that resolves when all projects have been started
 */
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

/**
 * Restarts a specific Ruby project.
 * 
 * This function locates the project's index.rb file, extracts the port information,
 * and restarts the project's server process.
 * 
 * @param {string} projectName - The name of the project to restart
 * @returns {Promise<void>} A promise that resolves when the project has been restarted
 */
async function restartProject(projectName) {
  const scriptPath = projectName === 'main'
    ? path.join(rubyWebDir, 'index.rb')
    : path.join(rubyWebDir, projectName, 'index.rb');

  const port = extractPortFromScript(scriptPath);
  if (!port) return;

  logToRenderer(formatLog(projectName, 'Restarting...'));
  await startProcess(projectName, scriptPath, port, path.dirname(scriptPath), true);
}
/**
 * Sets up file system watchers for Ruby projects.
 * 
 * This function creates a chokidar watcher to monitor file changes in Ruby project
 * directories. When changes are detected, it schedules restarts for the affected projects
 * with debouncing to prevent excessive restarts during rapid file changes.
 *
 * @param {string} rubyWebDir - The directory containing Ruby web projects to watch
 * @returns {void}
 */
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

/**
 * Stops all running Ruby server processes.
 * 
 * This function gracefully terminates all Ruby processes that are currently running,
 * sends appropriate status updates to the renderer, and clears the processes registry.
 * 
 * @returns {Promise<void>} A promise that resolves when all processes have been signaled to stop
 */
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

/**
 * Retrieves runtime statistics for Ruby server processes.
 * 
 * This function collects and returns information about the currently running Ruby processes,
 * including CPU usage, memory consumption, and port details. If no processes are running,
 * it returns a basic status object.
 * 
 * @returns {Promise<Object>} A promise that resolves to an object containing Ruby server statistics
 */
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
