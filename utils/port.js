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
  PYTHON_PORT: 4000,
  GOLANG_PORT: 5000,
  RUBY_PORT: 4559,
};
/**
 * Loads port configuration from the JSON config file
 * If the file doesn't exist, keeps default port configuration values
 * Logs warning or error messages as appropriate
 */
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

// Initialize configuration on startup
loadConfig();

// Watch for configuration file changes and reload when modified
chokidar.watch(configPath).on('change', () => {
  loadConfig();
});

/**
 * Retrieves port number for a specified service
 * @param {string} portKey - The key identifying the service port (e.g. 'APACHE_PORT')
 * @returns {number|null} - The port number or null if not found
 */
function getPORT(portKey) {
  if (!portKey) return null;
  return config[portKey] || null;
}

module.exports = { getPORT };
