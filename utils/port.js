const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { isDevelopment, getBasePath } = require('./pathResource');

const basePath = getBasePath();
const configPath = isDevelopment()
  ? path.join(basePath, 'config', 'app.config.json')
  : path.join(basePath, 'resources', 'config', 'app.config.json');


let config = {
  APACHE_PORT: 8000,
  NGINX_PORT: 8080,
  PHP_FPM_PORT: 1111,
  MYSQL_PORT: 3306,
  NODEJS_PORT: 2999,
  PYHTON_PORT: 4000,
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

function getPORT(portKey) {
  if (!portKey) return null;
  return config[portKey] || null;
}

module.exports = { getPORT };
