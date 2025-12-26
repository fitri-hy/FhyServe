const fs = require('fs');
const path = require('path');
const { ipcMain, nativeTheme, shell, dialog } = require('electron');
const { getBasePath, isDevelopment } = require('../utils/pathResource');
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
const pm2runtime = require('../runtime/pm2');
const { createTunnel, deleteTunnel, getAllTunnels, startTunnel, stopTunnel, } = require('./tunnels');
const { startFileBrowser, stopFileBrowser, setFileBrowserMain, getFileBrowserStats } = require('../runtime/fileBrowser');

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
  
  // Tunels
  ipcMain.handle('get-tunnels', () => {
    return getAllTunnels();
  });

  ipcMain.handle('create-tunnel', (event, port) => {
    try {
      const tunnel = createTunnel(port);
      return { success: true, tunnel };
    } catch (e) {
      return { success: false, message: e.message };
    }
  });

  ipcMain.handle('delete-tunnel', (event, id) => {
    const deleted = deleteTunnel(id);
    return { success: deleted };
  });

  ipcMain.handle('start-tunnel', async (event, id) => {
    try {
      const url = await startTunnel(id);
      return { success: true, url };
    } catch (e) {
      return { success: false, message: e.message };
    }
  });

  ipcMain.handle('stop-tunnel', (event, id) => {
    try {
      const stopped = stopTunnel(id);
      return { success: stopped };
    } catch (e) {
      return { success: false, message: e.message };
    }
  });
  
  // File Browser
  ipcMain.on('file-browser-start', (event) => {
    setFileBrowserMain(event.sender.getOwnerBrowserWindow());
    startFileBrowser();
  });

  ipcMain.on('file-browser-stop', async (event) => {
   await stopFileBrowser();
  });

  ipcMain.on('file-browser-get-stats', async (event) => {
    const stats = await getFileBrowserStats();
    event.sender.send('file-browser-stats', stats);
  });

  ipcMain.handle('open-filebrowser-folder', async () => {
    try {
      const basePath = getBasePath();
      const folderPath = isDevelopment()
        ? path.join(basePath, 'resources', 'filebrowser')  // lokasi db saat dev
        : path.join(basePath, 'resources', 'filebrowser'); // lokasi db saat build
      await shell.openPath(folderPath);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  });
  
  /*
  // PM2
  ipcMain.handle('pm2-list', () => pm2runtime.list());
  ipcMain.handle('pm2-action', (event, action, id) => pm2runtime.action(action, id));
  ipcMain.handle('pick-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JavaScript Files', extensions: ['js'] }],
    });
    if (canceled || !filePaths[0]) return null;
    return filePaths[0];
  });
  ipcMain.handle('start-with-name', (event, filePath, name) => pm2runtime.startWithName(filePath, name));
  ipcMain.handle('pm2-logs', (event, pmId) => pm2runtime.getLogs(pmId));
  ipcMain.handle('pm2-start-tail-log', (event, pmId) => pm2runtime.startTailLog(pmId, event.sender));
  ipcMain.handle('pm2-stop-tail-log', (event, pmId) => pm2runtime.stopTailLog(pmId));
  */
}

module.exports = { setupIPC };
