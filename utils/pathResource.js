const path = require('path');
const path = require('path');

/**
 * Determines whether the application is running in development mode.
 * @returns {boolean} True if running in development environment, false otherwise.
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.defaultApp || /node_modules[\\/]electron/.test(process.execPath);
}

/**
 * Gets the base path of the application.
 * @returns {string} The absolute path to the application's base directory.
 */
function getBasePath() {
  if (isDevelopment()) {
    return path.resolve(__dirname, '..');
  } else {
    return path.dirname(process.execPath);
  }
}

/**
 * Returns the path to the Apache web directory.
 * @returns {string} The absolute path to the Apache web directory.
 */
function apacheOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'apache_web')
    : path.join(basePath, 'resources', 'public_html', 'apache_web');
}

/**
 * Returns the path to the Nginx web directory.
 * @returns {string} The absolute path to the Nginx web directory.
 */
function nginxOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'nginx_web')
    : path.join(basePath, 'resources', 'public_html', 'nginx_web');
}

/**
 * Returns the path to the Node.js web directory.
 * @returns {string} The absolute path to the Node.js web directory.
 */
function nodeOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'node_web')
    : path.join(basePath, 'resources', 'public_html', 'node_web');
}

/**
 * Returns the path to the Python web directory.
 * @returns {string} The absolute path to the Python web directory.
 */
function pythonOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'python_web')
    : path.join(basePath, 'resources', 'public_html', 'python_web');
}

/**
 * Returns the path to the Go web directory.
 * @returns {string} The absolute path to the Go web directory.
 */
function goOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'go_web')
    : path.join(basePath, 'resources', 'public_html', 'go_web');
}

/**
 * Returns the path to the Ruby web directory.
 * @returns {string} The absolute path to the Ruby web directory.
 */
function rubyOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'ruby_web')
    : path.join(basePath, 'resources', 'public_html', 'ruby_web');
}

/**
 * Returns the path to the configuration directory.
 * @returns {string} The absolute path to the configuration directory.
 */
function portOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'config')
    : path.join(basePath, 'resources', 'config');
}

module.exports = {
  isDevelopment, getBasePath,
  apacheOpenFolder, nginxOpenFolder, nodeOpenFolder, pythonOpenFolder, goOpenFolder, rubyOpenFolder, portOpenFolder
};
