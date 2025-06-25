const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('themeAPI', {
  setDarkMode: (isDark) => ipcRenderer.send('dark-mode-changed', isDark),
});

// Apache
contextBridge.exposeInMainWorld('apacheAPI', {
  start: () => ipcRenderer.send('apache-start'),
  stop: () => ipcRenderer.send('apache-stop'),
  onStatus: (callback) => ipcRenderer.on('apache-status', (_event, status) => callback(status))
});

// Mysql
contextBridge.exposeInMainWorld('mysqlAPI', {
  start: () => ipcRenderer.send('mysql-start'),
  stop: () => ipcRenderer.send('mysql-stop'),
  onStatus: (callback) => ipcRenderer.on('mysql-status', (_, status) => callback(status)),
});

// Nginx
contextBridge.exposeInMainWorld('nginxAPI', {
  start: () => ipcRenderer.send('nginx-start'),
  stop: () => ipcRenderer.send('nginx-stop'),
  onStatus: (callback) => ipcRenderer.on('nginx-status', (_event, status) => callback(status)),
});

contextBridge.exposeInMainWorld('serviceAPI', {
  onLog: (callback) => ipcRenderer.on('service-log', (_event, log) => callback(log)),
});