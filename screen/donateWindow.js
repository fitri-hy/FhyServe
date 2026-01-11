const { BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

function createDonateWindow(parentWindow) {
  const donateWindow = new BrowserWindow({
    title: 'Donate',
    width: 350,
    height: 500,
    minWidth: 300,
    minHeight: 450,
    resizable: false,
    fullscreenable: false,
    modal: !!parentWindow,
    parent: parentWindow || null,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../templates/images/icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../utils/preload.js'),
    },
  });

  nativeTheme.themeSource = 'system';
  donateWindow.loadFile(path.join(__dirname, '../templates/donate.html'));

  return donateWindow;
}

module.exports = { createDonateWindow };
