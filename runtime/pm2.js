const pm2 = require('pm2');
const { Tail } = require('tail');
const fs = require('fs');
const path = require('path');

const tails = {};

function connectPM2() {
  return new Promise((resolve, reject) => {
    pm2.connect(err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function disconnectPM2() {
  pm2.disconnect();
}

async function list() {
  await connectPM2();
  return new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      disconnectPM2();
      if (err) reject(err);
      else resolve(list);
    });
  });
}

async function action(actionName, id) {
  await connectPM2();
  return new Promise((resolve, reject) => {
    const pmId = Number(id);
    if (isNaN(pmId)) {
      disconnectPM2();
      return reject(new Error('Invalid process ID'));
    }

    if (actionName === 'start') {
      pm2.list((err, list) => {
        if (err) {
          disconnectPM2();
          return reject(err);
        }
        const proc = list.find(p => p.pm_id === pmId);
        if (!proc) {
          disconnectPM2();
          return reject(new Error('Process not found'));
        }

        const config = {
          script: proc.pm2_env.pm_exec_path,
          name: proc.name,
          cwd: proc.pm2_env.pm_cwd || path.dirname(proc.pm2_env.pm_exec_path),
        };

        pm2.start(config, (err, proc) => {
          disconnectPM2();
          if (err) reject(err);
          else resolve(proc);
        });
      });
    } else {
      const actions = {
        restart: pm2.restart,
        stop: pm2.stop,
        delete: pm2.delete || ((id, cb) => pm2.deleteProcess(id, cb)),
      };

      const fn = actions[actionName];
      if (!fn) {
        disconnectPM2();
        return reject(new Error('Invalid action'));
      }

      fn.call(pm2, pmId, (err, result) => {
        disconnectPM2();
        if (err) reject(err);
        else resolve(result);
      });
    }
  });
}

async function startWithName(filePath, name) {
  const cwd = path.dirname(filePath);
  await connectPM2();

  return new Promise((resolve, reject) => {
    pm2.start({ script: filePath, name, cwd }, (err, proc) => {
      disconnectPM2();
      if (err) reject(err);
      else resolve(proc);
    });
  });
}

async function getLogs(pmId) {
  await connectPM2();
  return new Promise((resolve, reject) => {
    pm2.describe(pmId, (err, processDescription) => {
      disconnectPM2();
      if (err) return reject(err);
      if (!processDescription || processDescription.length === 0) {
        return resolve(null);
      }
      const proc = processDescription[0];
      const outLogPath = proc.pm2_env.pm_out_log_path;
      const errLogPath = proc.pm2_env.pm_err_log_path;

      const readLog = (path) => new Promise(res => {
        fs.readFile(path, 'utf8', (err, data) => {
          if (err) return res(`Cannot read log file: ${path}`);
          res(data);
        });
      });

      Promise.all([readLog(outLogPath), readLog(errLogPath)]).then(([outLog, errLog]) => {
        resolve({ outLog, errLog });
      }).catch(() => {
        resolve({ outLog: '', errLog: 'Error reading logs' });
      });
    });
  });
}

function startTailLog(pmId, eventSender) {
  return new Promise((resolve, reject) => {
    connectPM2().then(() => {
      pm2.describe(pmId, (err, procDesc) => {
        if (err || !procDesc || procDesc.length === 0) {
          disconnectPM2();
          return reject(err || new Error('Process not found'));
        }

        const proc = procDesc[0];
        const outLogPath = proc.pm2_env.pm_out_log_path;
        const errLogPath = proc.pm2_env.pm_err_log_path;

        disconnectPM2();

        if (tails[pmId]) {
          tails[pmId].outTail.unwatch();
          tails[pmId].errTail.unwatch();
        }

        const outTail = new Tail(outLogPath, { follow: true, useWatchFile: true });
        const errTail = new Tail(errLogPath, { follow: true, useWatchFile: true });

        tails[pmId] = { outTail, errTail };

        outTail.on('line', (line) => {
          eventSender.send('pm2-log-out-line', { pmId, line });
        });
        outTail.on('error', (error) => {
          eventSender.send('pm2-log-error', { pmId, error: 'Output tail error: ' + error.message });
        });

        errTail.on('line', (line) => {
          eventSender.send('pm2-log-err-line', { pmId, line });
        });
        errTail.on('error', (error) => {
          eventSender.send('pm2-log-error', { pmId, error: 'Error tail error: ' + error.message });
        });

        resolve({ outLogPath, errLogPath });
      });
    }).catch(reject);
  });
}

function stopTailLog(pmId) {
  if (tails[pmId]) {
    tails[pmId].outTail.unwatch();
    tails[pmId].errTail.unwatch();
    delete tails[pmId];
  }
  return Promise.resolve();
}

module.exports = {
  list,
  action,
  startWithName,
  getLogs,
  startTailLog,
  stopTailLog,
};
