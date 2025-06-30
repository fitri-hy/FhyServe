const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { isDevelopment, getBasePath } = require('./pathResource');

const basePath = getBasePath();
const configPath = isDevelopment()
  ? path.join(basePath, 'config', 'check_resource.json')
  : path.join(basePath, 'resources', 'config', 'check_resource.json');

let config = {
  CHECK_RESOURCE: true,
};

function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      console.warn(`[CONFIG] Config file not found at ${configPath}, using defaults.`);
      return;
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    config = { ...config, ...parsed };
  } catch (err) {
    console.error('[CONFIG] Failed to load config:', err.message);
  }
}

loadConfig();

chokidar.watch(configPath).on('change', () => {
  loadConfig();
});

function getCheckResource(checkKey) {
  if (!checkKey) return null;
  return config[checkKey] || null;
}

module.exports = { getCheckResource };
