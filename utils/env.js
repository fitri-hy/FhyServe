const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { isDevelopment, getBasePath } = require('./pathResource');

const basePath = getBasePath();
const configPath = isDevelopment()
  ? path.join(basePath, 'config', 'env.json')
  : path.join(basePath, 'resources', 'config', 'env.json');


let config = {
  PATH_SYSTEM: false,
};

function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      console.warn(`[ENV] File not found at ${configPath}, using defaults.`);
      return;
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    config = { ...config, ...parsed };
  } catch (err) {
    console.error('[ENV] Failed to load config:', err.message);
  }
}

loadConfig();

chokidar.watch(configPath).on('change', () => {
  loadConfig();
});

function getENV(envKey) {
  if (!envKey) return null;
  return envKey in config ? config[envKey] : null;
}

module.exports = { getENV };
