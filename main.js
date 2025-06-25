const { app } = require('electron');
const { createWindow } = require('./screen/indexWindow');
const { setupIPC } = require('./utils/ipc');
const { createMainMenu } = require('./screen/menu/mainMenu');
const { setApacheMain } = require('./runtime/apache');
const { setMysqlMain } = require('./runtime/mysql');
const { setNginxMain } = require('./runtime/nginx');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createWindow();
  setApacheMain(mainWindow);
  setMysqlMain(mainWindow);
  setNginxMain(mainWindow);
  setupIPC();
  createMainMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      createMainMenu();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
