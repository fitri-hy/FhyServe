const { app, BrowserWindow } = require('electron');
const { createWindow } = require('./screen/indexWindow');
const { setupIPC } = require('./utils/ipc');
const { stopAllTunnels } = require('./utils/tunnels');
const { createMainMenu } = require('./screen/menu/mainMenu');
const { setApacheMain, stopApache } = require('./runtime/apache');
const { setMysqlMain, stopMysql } = require('./runtime/mysql');
const { setNginxMain, stopNginx } = require('./runtime/nginx');
const { setNodeMain, stopNodeServer } = require('./runtime/node');
const { setPythonMain, stopPython } = require('./runtime/python');
const { setGoMain, stopGoServer } = require('./runtime/go');
const { setRubyMain, stopRubyServer } = require('./runtime/ruby');
const { setCmdMain, stopCmd } = require('./runtime/cmd');
const { setCronJobMain, stopAllCronJobs } = require('./runtime/cronjob');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createWindow();
  
  setApacheMain(mainWindow);
  setMysqlMain(mainWindow);
  setNginxMain(mainWindow);
  setNodeMain(mainWindow);
  setPythonMain(mainWindow);
  setGoMain(mainWindow);
  setRubyMain(mainWindow);
  setCmdMain(mainWindow);
  setCronJobMain(mainWindow);

  setupIPC();
  createMainMenu(mainWindow);
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
    createMainMenu(mainWindow);
  }
});

app.on('before-quit', async (event) => {
  isAppClosing = true;
  if (resourceAbortController) {
    resourceAbortController.abort();
  }
  
  event.preventDefault();

  try {
    await stopApache();
    await stopMysql();
    await stopNginx();
    await stopNodeServer();
    await stopPython();
    await stopGoServer();
    await stopRubyServer();
    await stopAllCronJobs();
    await stopCmd();
    await stopAllCronJobs();
	await stopAllTunnels();

    app.exit(0);
  } catch (err) {
    console.error('Failed to stop services:', err);
    app.exit(1);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});