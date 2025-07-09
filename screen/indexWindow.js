const { BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

/**
 * Creates a new main application window for FhyServe.
 * 
 * This function initializes a BrowserWindow with specific dimensions,
 * constraints, and configuration settings. The window is set up with
 * secure web preferences including context isolation and disabled
 * node integration for security. The window loads the main index.html
 * template and respects the system's theme settings.
 * 
 * @returns {BrowserWindow} The configured main window instance
 */
function createWindow() {
  const win = new BrowserWindow({
    title: 'FhyServe',
    width: 1000,
    height: 800,
    minWidth: 800,
    minHeight: 600,
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
