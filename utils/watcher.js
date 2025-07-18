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

/**
 * Loads watcher configuration from the JSON config file
 * If the file doesn't exist, keeps default watcher configuration values
 * Logs warning or error messages as appropriate
 */
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

// Initialize configuration on startup
loadConfig();

// Watch for configuration file changes and reload when modified
chokidar.watch(configPath).on('change', () => {
  loadConfig();
});

/**
 * Retrieves a specific watcher configuration value by key
 * @param {string} watcherKey - The configuration key to look up
 * @returns {*} The configuration value if found, null otherwise
 */
function getWATCHER(watcherKey) {
  if (!watcherKey) return null;
  return watcherKey in config ? config[watcherKey] : null;
}

module.exports = { getWATCHER };
