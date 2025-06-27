const { BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

function createDocsWindow() {
  const docWindow = new BrowserWindow({
    title: 'Documentation',
    width: 800,
    height: 600,
    minWidth: 650,
    minHeight: 450,
    resizable: true,
    fullscreenable: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../templates/images/icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../utils/preload.js'),
    },
  });

  nativeTheme.themeSource = 'system';
  docWindow.loadFile(path.join(__dirname, '../templates/docs.html'));

  return docWindow;
}

module.exports = { createDocsWindow };
