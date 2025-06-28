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

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'cronjob', message });
  }
}

function setCronJobMain(win) {
  mainWindow = win;
  const jobs = readCronConfig();
  //logToRenderer(`Loading ${jobs.length} jobs (not yet run)`);
}

function ensureCronConfig() {
  const dirPath = path.dirname(cronConfigPath);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  if (!fs.existsSync(cronConfigPath)) fs.writeFileSync(cronConfigPath, '[]', 'utf-8');
}

function readCronConfig() {
  ensureCronConfig();
  try {
    return JSON.parse(fs.readFileSync(cronConfigPath, 'utf-8'));
  } catch {
    return [];
  }
}

function writeCronConfig(data) {
  fs.writeFileSync(cronConfigPath, JSON.stringify(data, null, 2));
}

function buildCommand(taskRelativePath) {
  const normalizedPath = taskRelativePath.split(/[/\\]+/).join(path.sep);
  const fullPath = path.join(basePath, normalizedPath);
  const ext = path.extname(fullPath).toLowerCase();

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

function runTask(command) {
  logToRenderer(`Operate: ${command}`);
  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      logToRenderer(`ERROR: ${error.message}`);
      return;
    }
    if (stderr) logToRenderer(`STDERR: ${stderr}`);
    if (stdout) logToRenderer(`STDOUT: ${stdout}`);
  });
}

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

function stopCronJob(id) {
  if (tasks[id]) {
    tasks[id].stop();
    delete tasks[id];
    logToRenderer(`[${id}] Job stopped.`);
  }
}

function startAllCronJobs() {
  if (isRunning) return;
  const jobs = readCronConfig();
  jobs.forEach(job => startCronJob(job.id));
  isRunning = true;
  logToRenderer('All jobs running.');
}

function stopAllCronJobs() {
  Object.keys(tasks).forEach(id => stopCronJob(id));
  isRunning = false;
  logToRenderer('All jobs stopped.');
}

function createCronJob(data) {
  const jobs = readCronConfig();
  const newJob = { id: uuidv4(), ...data };
  jobs.push(newJob);
  writeCronConfig(jobs);

  if (cron.validate(newJob.schedule)) {
    if (isRunning) startCronJob(newJob.id);
    logToRenderer(`Job added: ${newJob.id}`);
  }
}

function readCronJobs() {
  return readCronConfig();
}

function updateCronJob(id, updates) {
  const jobs = readCronConfig().map(job => {
    if (job.id === id) {
      stopCronJob(id);
      return { ...job, ...updates };
    }
    return job;
  });
  writeCronConfig(jobs);

  const updatedJob = jobs.find(job => job.id === id);
  if (updatedJob && cron.validate(updatedJob.schedule)) {
    if (isRunning) startCronJob(id);
    logToRenderer(`Job updated: ${id}`);
  }
}

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
