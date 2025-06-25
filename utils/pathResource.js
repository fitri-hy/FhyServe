const path = require('path');

function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.defaultApp || /node_modules[\\/]electron/.test(process.execPath);
}

function getBasePath() {
  if (isDevelopment()) {
    // __dirname di utils/ jadi naik satu folder ke root projek
    return path.resolve(__dirname, '..');
  } else {
    // Saat build/installer, ambil folder executable
    return path.dirname(process.execPath);
  }
}

module.exports = { isDevelopment, getBasePath };
