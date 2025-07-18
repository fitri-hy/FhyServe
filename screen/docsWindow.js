const { BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

/**
 * Creates a new documentation window for the application.
 * 
 * This function initializes a BrowserWindow with specific dimensions,
 * constraints, and configuration settings. The window is set up with
 * secure web preferences including context isolation and limited
 * node integration for security.
 * 
 * @returns {BrowserWindow} The configured documentation window instance
 */
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
