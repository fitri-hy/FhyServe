const { ipcMain, nativeTheme } = require('electron');
const { startApache, stopApache } = require('../runtime/apache');
const { startMysql, stopMysql } = require('../runtime/mysql');
const { startNginx, stopNginx } = require('../runtime/nginx');
const { startNodeServer, stopNodeServer } = require('../runtime/node');
const { startCmd, stopCmd, sendCommand, startMysqlTerminal } = require('../runtime/cmd');

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
  
  // Node
  ipcMain.on('nodejs-start', () => {
    startNodeServer();
  });

  ipcMain.on('nodejs-stop', () => {
    stopNodeServer();
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
}

module.exports = { setupIPC };
