const fs = require('fs');
const path = require('path');
const { ipcMain, nativeTheme, shell } = require('electron');
const { startApache, stopApache } = require('../runtime/apache');
const { startMysql, stopMysql } = require('../runtime/mysql');
const { startNginx, stopNginx } = require('../runtime/nginx');
const { startNodeServer, stopNodeServer } = require('../runtime/node');
const { startPython, stopPython } = require('../runtime/python');
const { startGoServer, stopGoServer } = require('../runtime/go');
const { startRubyServer, stopRubyServer } = require('../runtime/ruby');
const { startCmd, stopCmd, sendCommand, startMysqlTerminal } = require('../runtime/cmd');
const { createCronJob, readCronJobs, updateCronJob, deleteCronJob, startCronJob, stopCronJob, readCronJobs: getAllJobs } = require('../runtime/cronjob');
const { getServiceStats } = require('../runtime/monitor');
const { apacheOpenFolder, nginxOpenFolder, nodeOpenFolder, pythonOpenFolder, goOpenFolder, rubyOpenFolder, portOpenFolder } = require('./pathResource');
const { installCMS } = require('../runtime/autoInstaller');

function setupIPC() {
  // Dark Mode
  ipcMain.on('dark-mode-changed', (event, isDark) => {
    nativeTheme.themeSource = isDark ? 'dark' : 'light';
  });
  
  // Apache
  ipcMain.on('apache-start', () => {
    startApache();
  });

  ipcMain.on('apache-stop', () => {
    stopApache();
  });
  
  ipcMain.handle('open-apache-folder', async () => {
    const folderPath = apacheOpenFolder();
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, message: result };
    }
    return { success: true };
  });
  
  // MySQL
  ipcMain.on('mysql-start', () => {
    startMysql();
  });

  ipcMain.on('mysql-stop', () => {
    stopMysql();
  });
  
  // Nginx
  ipcMain.on('nginx-start', () => {
    startNginx();
  });

  ipcMain.on('nginx-stop', () => {
    stopNginx();
  });
  
  ipcMain.handle('open-nginx-folder', async () => {
    const folderPath = nginxOpenFolder();
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, message: result };
    }
    return { success: true };
  });
  
  // Node
  ipcMain.on('nodejs-start', () => {
    startNodeServer();
  });

  ipcMain.on('nodejs-stop', () => {
    stopNodeServer();
  });
  
  ipcMain.handle('open-node-folder', async () => {
    const folderPath = nodeOpenFolder();
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, message: result };
    }
    return { success: true };
  });
  
  // Python
  ipcMain.on('python-start', () => {
    startPython();
  });
  
  ipcMain.on('python-stop', () => {
    stopPython();
  });
  
  ipcMain.handle('open-python-folder', async () => {
    const folderPath = pythonOpenFolder();
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, message: result };
    }
    return { success: true };
  });
  
  // Golang
  ipcMain.on('golang-start', () => {
    startGoServer();
  });

  ipcMain.on('golang-stop', () => {
    stopGoServer();
  });

  ipcMain.handle('open-go-folder', async () => {
    const folderPath = goOpenFolder();
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, message: result };
    }
    return { success: true };
  });
  
  // Ruby
  ipcMain.on('ruby-start', () => {
    startRubyServer();
  });

  ipcMain.on('ruby-stop', () => {
    stopRubyServer();
  });

  ipcMain.handle('open-ruby-folder', async () => {
    const folderPath = rubyOpenFolder();
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, message: result };
    }
    return { success: true };
  });
  
  // CMD
  ipcMain.on('cmd-start', () => {
    startCmd();
  });

  ipcMain.on('cmd-stop', () => {
    stopCmd();
  });

  ipcMain.on('cmd-send', (event, command) => {
    sendCommand(command);
  });
  
  // Docs
  ipcMain.handle('load-markdown', async (event, section) => {
    const filePath = path.join(__dirname, '../templates/docs', `${section}.md`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (err) {
      return `# Error\n\nFile not found: ${section}.md`;
    }
  });

  // Port
  ipcMain.handle('open-port-folder', async () => {
    const folderPath = portOpenFolder();
    const result = await shell.openPath(folderPath);
    if (result) {
      return { success: false, message: result };
    }
    return { success: true };
  });
  
  // Cron Job
  ipcMain.on('cronjob-create', (e, data) => createCronJob(data));
  ipcMain.handle('cronjob-read', () => readCronJobs());
  ipcMain.on('cronjob-update', (e, id, updates) => updateCronJob(id, updates));
  ipcMain.on('cronjob-delete', (e, id) => deleteCronJob(id));

  ipcMain.on('cronjob-start-all', () => {
    const jobs = getAllJobs();
    jobs.forEach(job => startCronJob(job.id));
  });

  ipcMain.on('cronjob-stop-all', () => {
    const jobs = getAllJobs();
    jobs.forEach(job => stopCronJob(job.id));
  });
  
  // Monitoring
  ipcMain.handle('get-service-stats', async () => {
    return await getServiceStats();
  });
  
  // Auto Installer
  ipcMain.handle('install-cms', async (event, cmsName, version, target) => {
    try {
      await installCMS(cmsName, version, (downloaded, total) => { event.sender.send('install-progress', downloaded, total); }, target);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupIPC };
