const pidusage = require('pidusage');
const { getCmdStats } = require('./cmd');
const { getApacheStats } = require('./apache');
const { getMysqlStats } = require('./mysql');
const { getNginxStats } = require('./nginx');
const { getNodeStats } = require('./node');
const { getPythonStats } = require('./python');

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

  return result;
}

module.exports = { getServiceStats };
