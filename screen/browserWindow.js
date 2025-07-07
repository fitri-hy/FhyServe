const { BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

/**
 * Creates a new browser window for the application.
 * 
 * This function initializes a BrowserWindow with specific dimensions,
 * constraints, and configuration settings. The window is set up with
 * secure web preferences including context isolation and limited
 * node integration for security.
 * 
 * @returns {BrowserWindow} The configured browser window instance
 */
function createBrowserWindow() {
  const win = new BrowserWindow({
    title: 'Browser',
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
      webviewTag: true,
      preload: path.join(__dirname, '../utils/preload.js'),
    }
  });

  nativeTheme.themeSource = 'system';
  win.loadFile(path.join(__dirname, '../templates/browser.html'));

  return win;
}

module.exports = { createBrowserWindow };
