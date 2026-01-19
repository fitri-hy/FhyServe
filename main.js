const path = require('path');
const { app, BrowserWindow, Tray, Menu } = require('electron');
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
const { setFileBrowserMain, stopFileBrowser } = require('./runtime/fileBrowser');
const { setRedisMain, stopRedis } = require('./runtime/redis');

let mainWindow;
let tray;
let isAppQuitting = false;

const useTray = true;

async function stopAllServices() {
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
    await stopAllTunnels();
    await stopFileBrowser();
    await stopRedis();
  } catch (err) {
    console.error('Failed to stop services:', err);
  }
}

function createTray() {
  const iconPath = path.join(__dirname, 'templates/images/icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: () => mainWindow.show() },
    { label: 'Quit', click: async () => {
      isAppQuitting = true;
      await stopAllServices();
      app.exit(0);
    }}
  ]);
  tray.setToolTip('FhyServe');
  tray.setContextMenu(contextMenu);
}

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
  setFileBrowserMain(mainWindow);
  setRedisMain(mainWindow);

  setupIPC();
  createMainMenu(mainWindow);

  if (useTray) {
    createTray();

    mainWindow.on('close', (event) => {
      if (!isAppQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
    createMainMenu(mainWindow);
  }
});

app.on('before-quit', async (event) => {
  if (useTray && !isAppQuitting) {
    event.preventDefault();
    mainWindow.hide();
    return;
  }

  if (typeof resourceAbortController !== 'undefined') {
    resourceAbortController.abort();
  }

  try {
    await stopAllServices();
    app.exit(0);
  } catch (err) {
    console.error('Failed to stop services:', err);
    app.exit(1);
  }
});

app.on('window-all-closed', () => {
  if (!useTray && process.platform !== 'darwin') app.quit();
});
