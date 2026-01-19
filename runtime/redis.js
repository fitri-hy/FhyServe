const { app } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const pidusage = require('pidusage');
const fs = require('fs');
const net = require('net');

const { isDevelopment, getBasePath } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');
const { rRedis, ReLaunchIsFinish } = require('./resourceDownload');

let redisProcess = null;
let mainWindow = null;

const basePath = getBasePath();

const htdocsPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'redis')
  : path.join(basePath, 'resources', 'public_html', 'redis');

const redisBase = path.join(basePath, 'resources', 'redis');
const exePath = path.join(redisBase, 'redis-server.exe');
const confPath = path.join(redisBase, 'redis.conf');

const PORT = getPORT('REDIS_PORT') || 6379;

function setRedisMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', {
      service: 'redis',
      message
    });
  }
}

function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('redis-status', status);
    if (status === 'RUNNING') {
      mainWindow.webContents.send('redis-url', `127.0.0.1:${PORT}`);
    } else {
      mainWindow.webContents.send('redis-url', null);
    }
  }
}

async function isPortInUse(port) {
  return new Promise(resolve => {
    const tester = net.createServer()
      .once('error', err => resolve(err.code === 'EADDRINUSE'))
      .once('listening', () => tester.close(() => resolve(false)))
      .listen(port, '127.0.0.1');
  });
}

function isRedisRunning() {
  return new Promise(resolve => {
    exec('tasklist', (err, stdout) => {
      if (err) return resolve(false);
      resolve(stdout.toLowerCase().includes('redis-server.exe'));
    });
  });
}

async function stopIfRunning() {
  if (redisProcess || await isRedisRunning()) {
    return new Promise(resolve => {
      exec('taskkill /IM redis-server.exe /T /F', err => {
        if (err) logToRenderer('Failed to stop Redis: ' + err.message);
        else logToRenderer('Redis stopped.');

        redisProcess = null;
        updateStatus('STOPPED');
        resolve();
      });
    });
  } else {
    updateStatus('STOPPED');
  }
}

async function startRedis() {
  try {
    const progressHandler = progress => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('resource-progress', progress);
      }
    };
    const status = await ReLaunchIsFinish(rRedis, progressHandler);
    if (status === 'done') {
      progressHandler({
        status: 'restarting',
        message: 'Restarting app after Redis resource initialization...'
      });
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 1000);
      return;
    }
  } catch (err) {
    logToRenderer('Redis resource init failed: ' + err.message);
    updateStatus('ERROR');
    return;
  }

  if (await isPortInUse(PORT)) {
    logToRenderer('Port in use, restarting Redis...');
    await stopIfRunning();
    await new Promise(r => setTimeout(r, 1500));
  }

  if (!fs.existsSync(exePath)) {
    logToRenderer('redis-server.exe not found.');
    updateStatus('ERROR');
    return;
  }

  if (!fs.existsSync(redisBase)) fs.mkdirSync(redisBase, { recursive: true });
  if (!fs.existsSync(htdocsPath)) fs.mkdirSync(htdocsPath, { recursive: true });

  const args = fs.existsSync(confPath) ? [confPath] : ['--port', `${PORT}`];

  redisProcess = spawn(exePath, args, { stdio: ['pipe', 'pipe', 'pipe'], cwd: redisBase });

  redisProcess.stdout.on('data', data => {
    const msg = data.toString().trim();
    if (msg.includes('Redis starting')) {
      logToRenderer(`initialization ...`);
    } else if (msg.includes('Ready to accept connections')) {
      logToRenderer(`Redis is ready at 127.0.0.1:${PORT}`);
      updateStatus('RUNNING');
    }
  });

  redisProcess.stderr.on('data', data => logToRenderer('ERROR: ' + data.toString().trim()));

  redisProcess.on('close', () => {
    redisProcess = null;
    updateStatus('STOPPED');
  });

  logToRenderer(`Redis starting at port ${PORT}, cwd: ${redisBase}`);
}

async function stopRedis() {
  await stopIfRunning();
}

async function getRedisStats() {
  if (!redisProcess) return { name: 'Redis', status: 'STOPPED' };

  try {
    const usage = await pidusage(redisProcess.pid);
    return {
      name: 'Redis',
      pid: redisProcess.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: PORT,
      status: 'RUNNING'
    };
  } catch (err) {
    return { name: 'Redis', status: 'ERROR', error: err.message };
  }
}

module.exports = {
  setRedisMain,
  startRedis,
  stopRedis,
  getRedisStats
};
