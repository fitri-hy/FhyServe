const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { isDevelopment, getBasePath } = require('../utils/pathResource');

const basePath = getBasePath();

const phpPath = path.join(basePath, 'resources', 'php', 'php.exe');
const nodePath = path.join(basePath, 'resources', 'nodejs', 'node.exe');
const pythonPath = path.join(basePath, 'resources', 'python', 'python.exe');

const phpExe = process.platform === 'win32' ? `"${phpPath}"` : 'php';
const nodeExe = process.platform === 'win32' ? `"${nodePath}"` : 'node';
const pythonExe = process.platform === 'win32' ? `"${pythonPath}"` : 'python3';

const configPath = isDevelopment()
  ? path.join(basePath, 'config')
  : path.join(basePath, 'resources', 'config');

const cronConfigPath = path.join(configPath, 'cronjob.json');

let tasks = {};
let isRunning = false;
let mainWindow = null;

/**
 * Logs a message to the renderer process.
 * 
 * @param {string} message - The message to be sent to the renderer process.
 * This message is associated with the 'cronjob' service.
 *
 * @returns {void} - This function does not return anything.
 */
function logToRenderer(message) {
  // Check if mainWindow exists and is not destroyed before sending message
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'cronjob', message });
  }
}

/**
 * Initializes the main cron job configuration.
 * 
 * @param {Object} win - The main window object, used as a reference for the cron job context.
 *     This should be an instance of BrowserWindow or equivalent.
 * @return {void} This function does not return anything but sets up the global variable `mainWindow`.
 */
function setCronJobMain(win) {
  mainWindow = win;

  // Reads the cron job configuration and stores it in `jobs`
  const jobs = readCronConfig();
  //logToRenderer(`Loading ${jobs.length} jobs (not yet run)`);
}

/**
 * Ensures that the cron job configuration file and its directory exist.
 * If the directory or file doesn't exist, they will be created.
 *
 * @returns {void} No return value.
 */
function ensureCronConfig() {
  const dirPath = path.dirname(cronConfigPath);

  // If the directory containing the configuration file doesn't exist, create it recursively
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  // If the configuration file itself doesn't exist, initialize it with an empty JSON array
  if (!fs.existsSync(cronConfigPath)) fs.writeFileSync(cronConfigPath, '[]', 'utf-8');
}

/**
 * Reads and parses the cron configuration file.
 * 
 * This function ensures that the cron configuration exists by calling `ensureCronConfig`, 
 * then attempts to read and parse the file from `cronConfigPath`.
 * If parsing fails or the file doesn't exist, it returns an empty array as fallback.
 * 
 * @returns {Array} Parsed cron configuration if successful, otherwise an empty array.
 */
function readCronConfig() {
  ensureCronConfig();
  try {
    // Attempts to read and parse the cron configuration file
    return JSON.parse(fs.readFileSync(cronConfigPath, 'utf-8'));
  } catch {
    // Returns an empty array if reading or parsing fails
    return [];
  }
}

/**
 * Writes the provided cron job data to the configuration file.
 * 
 * @param {Array} data - The array of cron job objects to be written to the configuration file.
 * @returns {void} No return value.
 */
function writeCronConfig(data) {
  fs.writeFileSync(cronConfigPath, JSON.stringify(data, null, 2));
}

/**
 * Builds a command string to execute a task based on its relative path.
 * 
 * @param {string} taskRelativePath - The relative path of the task file (e.g., "tasks/myTask.js").
 * @returns {string} The full command to execute the task. If the file type is recognized (e.g., .js, .php, .py),
 *                   it returns the appropriate execution command. Otherwise, it returns the taskRelativePath unchanged.
 */
function buildCommand(taskRelativePath) {
  // Normalize the task's relative path to support both / and \ as directory separators
  const normalizedPath = taskRelativePath.split(/[/\\]+/).join(path.sep);
  const fullPath = path.join(basePath, normalizedPath);
  const ext = path.extname(fullPath).toLowerCase();

  // Determine the execution command based on the file extension
  switch (ext) {
    case '.php':
      return `${phpExe} "${fullPath}"`;
    case '.js':
    case '.mjs':
      return `${nodeExe} "${fullPath}"`;
    case '.py':
      return `${pythonExe} "${fullPath}"`;
    default:
      return taskRelativePath;
  }
}

/**
 * Executes a shell command and logs the output.
 * 
 * @param {string} command - The shell command to execute.
 *                         This command will be run in a shell environment.
 */
function runTask(command) {
  logToRenderer(`Operate: ${command}`);

  // Executes the given command and captures error, stdout, and stderr
  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      // Logs any error encountered during execution
      logToRenderer(`ERROR: ${error.message}`);
      return;
    }

    // Logs standard error if present
    if (stderr) logToRenderer(`STDERR: ${stderr}`);

    // Logs standard output if present
    if (stdout) logToRenderer(`STDOUT: ${stdout}`);
  });
}

/**
 * Starts a specific cron job by its ID.
 *
 * This function looks up the job in the configuration, validates its schedule,
 * builds the command to execute, and schedules it to run. If the job is already
 * running or if the job ID doesn't exist, appropriate messages are logged.
 *
 * @param {string} id - The unique identifier of the cron job to start.
 * @returns {void} - This function does not return a value.
 */
function startCronJob(id) {
  if (tasks[id]) return;

  const jobs = readCronConfig();
  const job = jobs.find(j => j.id === id);
  if (!job) {
    logToRenderer(`Job not found: ${id}`);
    return;
  }

  if (!cron.validate(job.schedule)) {
    logToRenderer(`Invalid schedule: ${job.schedule}`);
    return;
  }

  const command = buildCommand(job.task.trim());
  const cronJob = cron.schedule(job.schedule, () => runTask(command));
  tasks[id] = cronJob;

  logToRenderer(`Job running: [${id}]`);
}

/**
 * Stops a specific cron job by its ID.
 *
 * This function finds the job in the tasks object, stops its execution,
 * removes it from the tasks object, and logs a message indicating the job was stopped.
 *
 * @param {string} id - The unique identifier of the cron job to stop.
 * @returns {void} - This function does not return a value.
 */
function stopCronJob(id) {
  if (tasks[id]) {
    tasks[id].stop();
    delete tasks[id];
    logToRenderer(`[${id}] Job stopped.`);
  }
}

/**
 * Starts all cron jobs.
 *
 * This function reads the cron configuration, starts each job by ID,
 * sets the running state to true, and logs a message indicating all jobs are running.
 *
 * @returns {void} - This function does not return a value.
 */
function startAll() {
  if (isRunning) return;
  const jobs = readCronConfig();
  jobs.forEach(job => startCronJob(job.id));
  isRunning = true;
  logToRenderer('All jobs running.');
}

/**
 * Starts all cron jobs.
 *
 * This function reads the cron configuration, starts each job by ID,
 * sets the running state to true, and logs a message indicating all jobs are running.
 *
 * @returns {void} - This function does not return a value.
 */
function CronJobs() {
  if (isRunning) return;
  const jobs = readCronConfig();
  jobs.forEach(job => startCronJob(job.id));
  isRunning = true;
  logToRenderer('All jobs running.');
}

/**
 * Stops all running cron jobs.
 *
 * This function iterates through all job IDs in the tasks object,
 * stops each job, sets the running state to false, and logs a message
 * indicating all jobs are stopped.
 *
 * @returns {void} - This function does not return a value.
 */
function stopAllCronJobs() {
  Object.keys(tasks).forEach(id => stopCronJob(id));
  isRunning = false;
  logToRenderer('All jobs stopped.');
}

/**
 * Creates a new cron job with the provided data.
 * 
 * This function generates a unique ID for the job, adds it to the configuration,
 * validates the schedule format, and starts the job if the cron service is running.
 * 
 * @param {Object} data - The cron job data.
 * @param {string} data.schedule - The cron schedule expression (e.g. "* * * * *").
 * @param {string} data.task - The task to execute when the schedule triggers.
 * @returns {Object} The newly created cron job object.
 */
function createCronJob(data) {
  const jobs = readCronConfig();
  const newJob = { id: uuidv4(), ...data };
  jobs.push(newJob);
  writeCronConfig(jobs);

  if (cron.validate(newJob.schedule)) {
    if (isRunning) startCronJob(newJob.id);
    logToRenderer(`Job added: ${newJob.id}`);
  }

  return newJob;
}

/**
 * Reads all configured cron jobs from the configuration file.
 * 
 * @returns {Array} Array of cron job objects from the configuration.
 */
function readCronJobs() {
  return readCronConfig();
}

/**
 * Updates an existing cron job with new properties.
 * @param {string} id - The unique identifier of the cron job to update.
 * @param {Object} updates - An object containing the fields to update in the cron job.
 * @returns {void}
 */
function updateCronJob(id, updates) {
  const jobs = readCronConfig().map(job => {
    if (job.id === id) {
      // Stop the cron job before making changes.
      stopCronJob(id);
      return { ...job, ...updates };
    }
    return job;
  });
  writeCronConfig(jobs);

  // Retrieve the updated job from the list of jobs.
  const updatedJob = jobs.find(job => job.id === id);
  if (updatedJob && cron.validate(updatedJob.schedule)) {
    // Restart the job if it was running and validate the schedule.
    if (isRunning) startCronJob(id);
    logToRenderer(`Job updated: ${id}`);
  }
}

/**
 * Deletes a cron job with the specified ID.
 * 
 * This function stops the cron job if it's running, removes it from the 
 * configuration file, and logs a message indicating the job was deleted.
 * 
 * @param {string} id - The unique identifier of the cron job to delete.
 * @returns {void} - This function does not return a value.
 */
function deleteCronJob(id) {
  stopCronJob(id);
  const jobs = readCronConfig().filter(job => job.id !== id);
  writeCronConfig(jobs);
  logToRenderer(`Job deleted: ${id}`);
}

module.exports = {
  setCronJobMain,
  startCronJob,
  stopCronJob,
  startAllCronJobs,
  stopAllCronJobs,
  createCronJob,
  readCronJobs,
  updateCronJob,
  deleteCronJob,
};
