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

/**
 * Loads configuration from the specified config file path
 * If the file doesn't exist, keeps default configuration values
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
 * Retrieves a specific configuration value by key
 * @param {string} checkKey - The configuration key to retrieve
 * @returns {*|null} - The configuration value or null if not found
 */
function getCheckResource(checkKey) {
  if (!checkKey) return null;
  return config[checkKey] || null;
}

module.exports = { getCheckResource };
