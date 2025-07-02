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

function getCpuUsage() {
  return new Promise((resolve, reject) => {
    si.currentLoad()
      .then(data => resolve(data.currentload))
      .catch(error => reject(error));
  });
}

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

function getSystemStats() {
  return Promise.all([getCpuUsage(), getMemoryUsage(), getDiskUsage()]);
}

module.exports = { getServiceStats, getSystemStats };
