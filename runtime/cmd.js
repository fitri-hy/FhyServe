const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const pidusage = require('pidusage');
const { getBasePath, apacheOpenFolder, nginxOpenFolder, nodeOpenFolder, pythonOpenFolder, goOpenFolder, rubyOpenFolder } = require('../utils/pathResource');
const { getENV } = require('../utils/env');

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

/**
 * Sets the main window for command operations.
 * 
 * @param {Object} window - The window object to be set as the main window.
 *                          This is typically a reference to a browser window or similar UI component.
 * @returns {void}
 */
function setCmdMain(window) {
  // Assigns the passed window object to the global variable 'mainWindow'.
  mainWindow = window;
}

/**
 * Starts a command process if one isn't already running.
 * 
 * This function performs the following operations:
 * 1. Checks if a command process is already running, and if so, returns early.
 * 2. Constructs an appropriate PATH environment variable based on the operating system:
 *    - If `PATH_SYSTEM` is true, it includes custom paths and the current system's PATH.
 *    - If `PATH_SYSTEM` is false, it adds Windows System32 to the path on Windows systems.
 * 3. Sets up a shell environment (`cmd.exe` for Windows, `bash` for others) with customized environment variables.
 * 4. Spawns a new shell process with specific configurations (hidden window, piped stdio).
 * 5. Handles shell output:
 *    - Processes stdout data by splitting into lines and analyzing each line.
 *    - Skips certain commands like `echo %cd%`.
 *    - Detects and updates the last prompt path (for drives like C:\> on Windows).
 *    - Sends clean command outputs to the main window via IPC communication.
 * 6. Handles errors by sending them to the main window as well.
 * 7. Detects when the shell process closes and updates its status in the main window.
 * 
 * @returns {void} Does not return any value explicitly but spawns a background process.
 */
function startCmd() {
  // Check if a command process is already running
  if (cmdProcess) return;

  // Build the appropriate PATH environment variable based on the operating system
  const systemPath = PATH_SYSTEM ? process.env.PATH || '' : '';
  const winSystem32 = path.join(process.env.windir || 'C:\Windows', 'System32');
  const finalPath = PATH_SYSTEM
    ? [...customPaths, process.env.PATH || ''].join(pathSeparator)
    : [...customPaths, winSystem32].join(pathSeparator);

  // Prepare the environment object which includes the updated PATH
  const env = {
    ...process.env,
    PATH: finalPath,
  };

  // Determine the shell executable based on the platform
  const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';

  // Spawn a new shell process with hidden windows and modified environment variables
  cmdProcess = spawn(shell, [], {
    shell: true,
    windowsHide: true,
    env,
    stdio: 'pipe',
  });

  // Process incoming data from the shell's standard output
  cmdProcess.stdout.on('data', (data) => {
    const output = data.toString();
    const lines = output.split(/\r?\n/);

    // Analyze each line of the output
    for (let line of lines) {
      line = line.trim();
      if (line === '') continue; // Ignore empty lines

      if (/^echo\s+%cd%$/i.test(line)) continue; // Skip echo commands related to the current directory

      if (/^[A-Z]:\\/.test(line)) {
        // Update the last prompt path (relevant for Windows drive letters)
        lastPrompt = line.replace(/>+$/, '') + '>';
        continue;
      }

      // Send valid output lines to the main window for display
      mainWindow?.webContents.send('cmd-output', line + '\n');
    }

    // Append the last prompt if available
    if (lastPrompt) {
      mainWindow?.webContents.send('cmd-output', lastPrompt + ' ');
      lastPrompt = '';
    }
  });

  // Handle error messages from the shell's standard error
  cmdProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    mainWindow?.webContents.send('cmd-output', msg);
  });

  // Detect when the shell process has closed and update the status accordingly
  cmdProcess.on('close', () => {
    cmdProcess = null;
    mainWindow?.webContents.send('cmd-status', 'STOPPED');
  });

  // Notify the main window that the shell process is now running
  mainWindow?.webContents.send('cmd-status', 'RUNNING');
}

/**
 * Attempts to stop the command process by sending a SIGTERM signal.
 * If the process cannot be killed, logs an error message.
 * Updates the main window with the status of the command if the window exists and is not destroyed.
 *
 * @returns {void} - No return value.
 */
function stopCmd() {
  if (!cmdProcess) return;

  // Send a SIGTERM signal to the command process PID and handle errors if it fails.
  kill(cmdProcess.pid, 'SIGTERM', (err) => {
    if (err) console.error('Failed to kill process:', err);
  });

  cmdProcess = null;

  // Notify the main window that the command has been stopped, if the window exists.
  if (!mainWindow?.isDestroyed()) {
    mainWindow.webContents.send('cmd-status', 'STOPPED');
  }
}

/**
 * Sends a command to the active process or performs specific actions based on the input.
 * 
 * @param {string} command - The command string to be processed. It can include navigation commands, clear screen, or SQL queries.
 * @param {boolean} [isSQL=false] - Indicates whether the command is an SQL query. Used to ensure SQL commands end with a semicolon.
 * @returns {void}
 */
function sendCommand(command, isSQL = false) {
  if (!cmdProcess) return;

  let cmd = command.trim();
  let targetPath = null;

  // Handle clearing of the terminal
  if (cmd === 'cls' || cmd === 'clear') {
    mainWindow?.webContents.send('cmd-clear');
    cmdProcess.stdin.write('echo %CD%\n');
    return;
  }

  // Navigate to specific directories based on the command
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

  // If a target path was set, change the directory to that path
  if (targetPath) {
    const cdCommand = process.platform === 'win32'
      ? `cd /d "${targetPath}"`
      : `cd "${targetPath}"`;
    cmdProcess.stdin.write(cdCommand + '\n');
    return;
  }

  // Append a semicolon to SQL commands if not present
  if (isSQL && !cmd.endsWith(';')) {
    cmd += ';';
  }

  // Send the processed command to the stdin of the active process
  cmdProcess.stdin.write(cmd + '\r\n');
}

/**
 * Monitoring function to retrieve CMD process statistics.
 * 
 * @returns {Object} An object containing the following properties:
 *   - name {string}: The name of the process ('CMD').
 *   - status {string}: The current status of the process ('STOPPED', 'RUNNING', or 'ERROR').
 *   - pid {number}: The process ID (only present if the process is running).
 *   - cpu {string}: CPU usage as a percentage (only present if the process is running).
 *   - memory {string}: Memory usage in megabytes (only present if the process is running).
 *   - port {string}: Placeholder for port information (always '-').
 *   - error {string}: Error message (only present if an error occurred).
 */
async function getCmdStats() {
  if (!cmdProcess) {
    // If the CMD process doesn't exist, return its status as stopped.
    return {
      name: 'CMD',
      status: 'STOPPED',
    };
  }

  try {
    // Use pidusage to fetch resource usage statistics for the CMD process.
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
    // If an error occurs during stats collection, return an error status with the message.
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
