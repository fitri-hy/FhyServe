const path = require('path');

function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.defaultApp || /node_modules[\\/]electron/.test(process.execPath);
}

function getBasePath() {
  if (isDevelopment()) {
    return path.resolve(__dirname, '..');
  } else {
    return path.dirname(process.execPath);
  }
}

function apacheOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'apache_web')
    : path.join(basePath, 'resources', 'public_html', 'apache_web');
}

function nginxOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'nginx_web')
    : path.join(basePath, 'resources', 'public_html', 'nginx_web');
}

function nodeOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'node_web')
    : path.join(basePath, 'resources', 'public_html', 'node_web');
}

function pythonOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'public_html', 'python_web')
    : path.join(basePath, 'resources', 'public_html', 'python_web');
}

function portOpenFolder() {
  const basePath = getBasePath();
  return isDevelopment()
    ? path.join(basePath, 'config')
    : path.join(basePath, 'resources', 'config');
}

module.exports = { 
  isDevelopment, getBasePath, 
  apacheOpenFolder, nginxOpenFolder, nodeOpenFolder, pythonOpenFolder, portOpenFolder
};
