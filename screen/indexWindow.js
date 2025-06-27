const { BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    title: 'FhyServe',
    width: 800,
    height: 600,
    minWidth: 650,
    minHeight: 450,
    resizable: true,
    fullscreenable: true,
    icon: path.join(__dirname, '../templates/images/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../utils/preload.js'),
    },
  });

  nativeTheme.themeSource = 'system';
  win.loadFile(path.join(__dirname, '../templates/index.html'));

  return win;
}

module.exports = { createWindow };
