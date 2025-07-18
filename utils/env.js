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

/**
 * Loads environment configuration from the specified JSON file
 * If the file doesn't exist, uses default configuration values
 * Logs appropriate warning or error messages
 */
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

// Initialize configuration on startup
loadConfig();

// Watch for configuration file changes and reload when modified
chokidar.watch(configPath).on('change', () => {
  loadConfig();
});

/**
 * Retrieves a specific environment variable from the loaded configuration
 * @param {string} envKey - The key of the environment variable to retrieve
 * @returns {*} The value of the environment variable or null if not found
 */
function getENV(envKey) {
  if (!envKey) return null;
  return envKey in config ? config[envKey] : null;
}

module.exports = { getENV };
