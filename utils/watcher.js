const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { isDevelopment, getBasePath } = require('./pathResource');

const basePath = getBasePath();
const configPath = isDevelopment()
  ? path.join(basePath, 'config', 'watcher.json')
  : path.join(basePath, 'resources', 'config', 'watcher.json');


let config = {
  WATCHER: false,
};

function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      console.warn(`[WATCHER] File not found at ${configPath}, using defaults.`);
      return;
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    config = { ...config, ...parsed };
  } catch (err) {
    console.error('[WATCHER] Failed to load config:', err.message);
  }
}

loadConfig();

chokidar.watch(configPath).on('change', () => {
  loadConfig();
});

function getWATCHER(watcherKey) {
  if (!watcherKey) return null;
  return watcherKey in config ? config[watcherKey] : null;
}

module.exports = { getWATCHER };
