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

// Golang
contextBridge.exposeInMainWorld('golangAPI', {
  start: () => ipcRenderer.send('golang-start'),
  stop: () => ipcRenderer.send('golang-stop'),
  onStatus: (callback) => ipcRenderer.on('golang-status', (event, data) => callback(data)),
  openGoFolder: () => ipcRenderer.invoke('open-go-folder'),
});

// Ruby
contextBridge.exposeInMainWorld('rubyAPI', {
  start: () => ipcRenderer.send('ruby-start'),
  stop: () => ipcRenderer.send('ruby-stop'),
  onStatus: (callback) => ipcRenderer.on('ruby-status', (event, data) => callback(data)),
  openRubyFolder: () => ipcRenderer.invoke('open-ruby-folder'),
});

// CMD
contextBridge.exposeInMainWorld('cmdAPI', {
  start: () => ipcRenderer.send('cmd-start'),
  stop: () => ipcRenderer.send('cmd-stop'),
  sendCommand: (cmd) => ipcRenderer.send('cmd-send', cmd),
  onOutput: (callback) => ipcRenderer.on('cmd-output', (_e, data) => callback(data)),
  onStatus: (callback) => ipcRenderer.on('cmd-status', (_e, status) => callback(status)),
  onClear: (callback) => ipcRenderer.on('cmd-clear', () => callback()),
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

// Cron Job
contextBridge.exposeInMainWorld('cronAPI', {
  create: (data) => ipcRenderer.send('cronjob-create', data),
  read: () => ipcRenderer.invoke('cronjob-read'),
  update: (id, data) => ipcRenderer.send('cronjob-update', id, data),
  delete: (id) => ipcRenderer.send('cronjob-delete', id),
  startAll: () => ipcRenderer.send('cronjob-start-all'),
  stopAll: () => ipcRenderer.send('cronjob-stop-all'),
});

// Monitoring
contextBridge.exposeInMainWorld('monitoringAPI', {
  getServiceStats: () => ipcRenderer.invoke('get-service-stats')
});

// Auto Installer
contextBridge.exposeInMainWorld('autoInstallerAPI', {
  installCMS: (cmsName, version, target) => ipcRenderer.invoke('install-cms', cmsName, version, target),
  onProgress: (callback) => ipcRenderer.on('install-progress', (event, downloaded, total) => callback(downloaded, total)),
});

// Resource Download
contextBridge.exposeInMainWorld('resourceDlAPI', {
  onResourceProgress: (callback) => ipcRenderer.on('resource-progress', (event, data) => callback(data))
});

// Tunnels
contextBridge.exposeInMainWorld('tunnelAPI', {
  getTunnels: () => ipcRenderer.invoke('get-tunnels'),
  createTunnel: (port) => ipcRenderer.invoke('create-tunnel', port),
  deleteTunnel: (id) => ipcRenderer.invoke('delete-tunnel', id),
  startTunnel: (id) => ipcRenderer.invoke('start-tunnel', id),
  stopTunnel: (id) => ipcRenderer.invoke('stop-tunnel', id),
});

/*
// PM2
contextBridge.exposeInMainWorld('pm2API', {
  list: () => ipcRenderer.invoke('pm2-list'),
  action: (action, id) => ipcRenderer.invoke('pm2-action', action, id),
  pickFile: () => ipcRenderer.invoke('pick-file'),
  startWithName: (filePath, name) => ipcRenderer.invoke('start-with-name', filePath, name),

  getLogs: (pmId) => ipcRenderer.invoke('pm2-logs', pmId),

  startTailLog: (pmId) => ipcRenderer.invoke('pm2-start-tail-log', pmId),
  stopTailLog: (pmId) => ipcRenderer.invoke('pm2-stop-tail-log', pmId),

  onLogOutLine: (callback) => {
    ipcRenderer.on('pm2-log-out-line', (event, data) => callback(data));
  },
  onLogErrLine: (callback) => {
    ipcRenderer.on('pm2-log-err-line', (event, data) => callback(data));
  },
  onLogError: (callback) => {
    ipcRenderer.on('pm2-log-error', (event, data) => callback(data));
  },

  removeAllLogListeners: () => {
    ipcRenderer.removeAllListeners('pm2-log-out-line');
    ipcRenderer.removeAllListeners('pm2-log-err-line');
    ipcRenderer.removeAllListeners('pm2-log-error');
  }
});
*/