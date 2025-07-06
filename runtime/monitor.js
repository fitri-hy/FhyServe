const pidusage = require('pidusage');
const { getCmdStats } = require('./cmd');
const { getApacheStats } = require('./apache');
const { getMysqlStats } = require('./mysql');
const { getNginxStats } = require('./nginx');
const { getNodeStats } = require('./node');
const { getPythonStats } = require('./python');
const { getGoStats } = require('./go');
const { getRubyStats } = require('./ruby');
const si = require('systeminformation');

/**
 * Retrieves runtime statistics for all services.
 * 
 * This function collects status information from all services (Apache, CMD, MySQL, 
 * Nginx, Node.js, Python, Go, and Ruby) by calling their respective stats functions.
 * For each service, it attempts to get the current stats and handles any errors that
 * might occur during the process.
 * 
 * @async
 * @returns {Promise<Array<Object>>} An array of service status objects, each containing:
 *   - name {string} The service name
 *   - status {string} Current status ('RUNNING', 'STOPPED', or 'ERROR')
 *   - pid {number} Process ID (only when service is running)
 *   - cpu {string} CPU usage formatted as percentage (only when service is running)
 *   - memory {string} Memory usage formatted in MB (only when service is running)
 *   - port {string|number} Port the service is running on (only when service is running)
 *   - error {string} Error message (only when status is 'ERROR')
 */
async function getServiceStats() {
  const result = [];

  try {
    const apache = await getApacheStats();
    result.push(apache);
  } catch (err) {
    result.push({ name: 'Apache', status: 'ERROR', error: err.message });
  }

  try {
    const cmd = await getCmdStats();
    result.push(cmd);
  } catch (err) {
    result.push({ name: 'CMD', status: 'ERROR', error: err.message });
  }

  try {
    const mysql = await getMysqlStats();
    result.push(mysql);
  } catch (err) {
    result.push({ name: 'MySQL', status: 'ERROR', error: err.message });
  }

  try {
    const nginx = await getNginxStats();
    result.push(nginx);
  } catch (err) {
    result.push({ name: 'Nginx', status: 'ERROR', error: err.message });
  }

  try {
    const node = await getNodeStats();
    result.push(node);
  } catch (err) {
    result.push({ name: 'Node', status: 'ERROR', error: err.message });
  }

  try {
    const python = await getPythonStats();
    result.push(python);
  } catch (err) {
    result.push({ name: 'Python', status: 'ERROR', error: err.message });
  }

  try {
    const go = await getGoStats();
    result.push(go);
  } catch (err) {
    result.push({ name: 'Go', status: 'ERROR', error: err.message });
  }

  try {
    const ruby = await getRubyStats();
    result.push(ruby);
  } catch (err) {
    result.push({ name: 'Ruby', status: 'ERROR', error: err.message });
  }

  return result;
}

/**
 * Gets the current CPU usage percentage.
 * 
 * @async
 * @returns {Promise<number>} A promise that resolves with the current CPU load percentage
 * @throws {Error} If there was an error retrieving CPU information
 */
function getCpuUsage() {
  return new Promise((resolve, reject) => {
    si.currentLoad()
      .then(data => resolve(data.currentload))
      .catch(error => reject(error));
  });
}

/**
 * Gets the current memory usage statistics.
 * 
 * @async
 * @returns {Promise<Object>} A promise that resolves with memory usage data:
 *   - total {number} Total memory in bytes
 *   - free {number} Free memory in bytes
 *   - used {number} Used memory in bytes
 * @throws {Error} If there was an error retrieving memory information
 */
function getMemoryUsage() {
  return new Promise((resolve, reject) => {
    si.mem()
      .then(data => resolve({
        total: data.total,
        free: data.free,
        used: data.used
      }))
      .catch(error => reject(error));
  });
}

/**
 * Gets disk usage statistics for all mounted filesystems.
 * 
 * @async
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of disk usage objects:
 *   - fs {string} Name of the filesystem
 *   - size {number} Total size in bytes
 *   - used {number} Used space in bytes
 * @throws {Error} If there was an error retrieving disk information
 */
function getDiskUsage() {
  return new Promise((resolve, reject) => {
    si.fsSize()
      .then(data => resolve(data.map(disk => ({
        fs: disk.fs,
        size: disk.size,
        used: disk.used
      }))))
      .catch(error => reject(error));
  });
}

/**
 * Gets combined system statistics including CPU, memory and disk usage.
 * 
 * @async
 * @returns {Promise<Array>} A promise that resolves with an array containing:
 *   - [0] {number} CPU usage percentage
 *   - [1] {Object} Memory usage statistics
 *   - [2] {Array<Object>} Disk usage statistics
 * @throws {Error} If there was an error retrieving system information
 */
function getSystemStats() {
  return Promise.all([getCpuUsage(), getMemoryUsage(), getDiskUsage()]);
}

module.exports = { getServiceStats, getSystemStats };
