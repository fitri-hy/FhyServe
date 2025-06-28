const { contextBridge, ipcRenderer } = require('electron');

let projectPorts = {};

ipcRenderer.on('nodejs-project-ports', (event, mapping) => {
  projectPorts = mapping;
  console.log('Updated project ports:', projectPorts);
});

contextBridge.exposeInMainWorld('themeAPI', {
  setDarkMode: (isDark) => ipcRenderer.send('dark-mode-changed', isDark),
});

// Apache
contextBridge.exposeInMainWorld('apacheAPI', {
  start: () => ipcRenderer.send('apache-start'),
  stop: () => ipcRenderer.send('apache-stop'),
  onStatus: (callback) => ipcRenderer.on('apache-status', (_event, status) => callback(status)),
  openApacheFolder: () => ipcRenderer.invoke('open-apache-folder'),
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
  openNginxFolder: () => ipcRenderer.invoke('open-nginx-folder'),
});

// Node
contextBridge.exposeInMainWorld('nodejsAPI', {
  start: () => ipcRenderer.send('nodejs-start'),
  stop: () => ipcRenderer.send('nodejs-stop'),
  onStatus: (callback) => {
    ipcRenderer.on('nodejs-status-main', (event, status) => {
      callback(status);
    });
  },
  openNodeFolder: () => ipcRenderer.invoke('open-node-folder'),
});

// Python
contextBridge.exposeInMainWorld('pythonAPI', {
  start: () => ipcRenderer.send('python-start'),
  stop: () => ipcRenderer.send('python-stop'),
  onStatus: (callback) => ipcRenderer.on('python-status', (event, data) => callback(data)),
  openPythonFolder: () => ipcRenderer.invoke('open-python-folder'),
});

// CMD
contextBridge.exposeInMainWorld('cmdAPI', {
  start: () => ipcRenderer.send('cmd-start'),
  stop: () => ipcRenderer.send('cmd-stop'),
  sendCommand: (cmd) => ipcRenderer.send('cmd-send', cmd),
  onOutput: (callback) => ipcRenderer.on('cmd-output', (_e, data) => callback(data)),
  onStatus: (callback) => ipcRenderer.on('cmd-status', (_e, status) => callback(status)),
});

// Log
contextBridge.exposeInMainWorld('serviceAPI', {
  onLog: (callback) => ipcRenderer.on('service-log', (_event, log) => callback(log)),
});

// Port
contextBridge.exposeInMainWorld('portAPI', {
  openPortFolder: () => ipcRenderer.invoke('open-port-folder'),
});

// Docs
contextBridge.exposeInMainWorld('docAPI', {
  loadMarkdown: (section) => ipcRenderer.invoke('load-markdown', section)
});