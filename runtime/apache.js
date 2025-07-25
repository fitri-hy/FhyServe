const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const kill = require('tree-kill');
const pidusage = require('pidusage');
const { spawn } = require('child_process');
const { isDevelopment, getBasePath } = require('../utils/pathResource');
const { getPORT } = require('../utils/port');
const { rApache, rPhp, rPhpMyAdmin, ReLaunchIsFinish } = require('./resourceDownload');

const PORT = getPORT('APACHE_PORT');

let apacheProcess;
let mainWindow = null;

const basePath = getBasePath();
const apacheCwd = isDevelopment()
  ? path.join(basePath, 'resources', 'apache')
  : path.join(basePath, 'resources', 'apache');
const apachePath = path.join(apacheCwd, 'bin', 'httpd.exe');

const htdocsPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'apache_web')
  : path.join(basePath, 'resources', 'public_html', 'apache_web');

const phpPath  = isDevelopment()
  ? path.join(basePath, 'resources', 'php')
  : path.join(basePath, 'resources', 'php');

const phpMyAdminConfigPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'apache_web', 'phpmyadmin', 'config.inc.php')
  : path.join(basePath, 'resources', 'public_html', 'apache_web', 'phpmyadmin', 'config.inc.php');

function setApacheMain(win) {
  mainWindow = win;
}

function logToRenderer(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('service-log', { service: 'apache', message });
  }
}

function updateStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('apache-status', status);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updatePhpMyAdminConfig() {
  try {
    if (!fs.existsSync(phpMyAdminConfigPath)) {
      return;
    }
    let content = fs.readFileSync(phpMyAdminConfigPath, 'utf8');

    if (/\$cfg\['Servers'\]\[\$i\]\['auth_type'\]\s*=/.test(content)) {
      content = content.replace(
        /\$cfg\['Servers'\]\[\$i\]\['auth_type'\]\s*=\s*'.*?';/,
        `$cfg['Servers'][$i]['auth_type'] = 'config';`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['auth_type'] = 'config';\n`;
    }

    if (/\$cfg\['Servers'\]\[\$i\]\['user'\]\s*=/.test(content)) {
      content = content.replace(
        /\$cfg\['Servers'\]\[\$i\]\['user'\]\s*=\s*'.*?';/,
        `$cfg['Servers'][$i]['user'] = 'root';`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['user'] = 'root';\n`;
    }

    if (/\$cfg\['Servers'\]\[\$i\]\['password'\]\s*=/.test(content)) {
      content = content.replace(
        /\$cfg\['Servers'\]\[\$i\]\['password'\]\s*=\s*'.*?';/,
        `$cfg['Servers'][$i]['password'] = '';`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['password'] = '';\n`;
    }

    if (/\$cfg\['Servers'\]\[\$i\]\['AllowNoPassword'\]\s*=/.test(content)) {
      content = content.replace(
        /\$cfg\['Servers'\]\[\$i\]\['AllowNoPassword'\]\s*=\s*.*?;/,
        `$cfg['Servers'][$i]['AllowNoPassword'] = true;`
      );
    } else {
      content += `\n$cfg['Servers'][$i]['AllowNoPassword'] = true;\n`;
    }

    fs.writeFileSync(phpMyAdminConfigPath, content, 'utf8');
  } catch (err) {
    logToRenderer('Failed to update phpMyAdmin config: ' + err.message);
  }
}


async function waitForApacheReady(port = PORT, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, resolve);
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });

      if (res.statusCode === 200) return true;
    } catch (_) {
      // ignore and retry
    }
    await delay(500);
  }
  return false;
}

function detectPhpDll(phpDir) {
  const files = fs.readdirSync(phpDir);
  const dllFile = files.find(f => /^php\d+apache2_4\.dll$/i.test(f));
  if (!dllFile) throw new Error('phpXapache2_4.dll not found in ' + phpDir);
  return path.join(phpDir, dllFile).replace(/\\/g, '/');
}

function enableMysqliExtension(phpIniPath) {
  try {
    let iniContent = fs.readFileSync(phpIniPath, 'utf8');

    iniContent = iniContent.replace(
      /^\s*;?\s*extension_dir\s*=.*$/m,
      `extension_dir = "${path.join(phpPath, 'ext').replace(/\\/g, '/')}"`,
    );

    const extensions = ['mysqli', 'openssl', 'pdo_mysql', 'curl', 'fileinfo', 'zip', 'intl', 'mbstring'];

    extensions.forEach(ext => {
      const regex = new RegExp(`^;*\\s*extension\\s*=\\s*${ext}\\s*$`, 'm');

      if (regex.test(iniContent)) {
        iniContent = iniContent.replace(regex, `extension=${ext}`);
      } else if (!new RegExp(`^\\s*extension\\s*=\\s*${ext}\\s*$`, 'm').test(iniContent)) {
        iniContent += `\nextension=${ext}\n`;
      }
    });

    fs.writeFileSync(phpIniPath, iniContent, 'utf8');
  } catch (err) {
    logToRenderer(`ERROR enabling mysqli extension: ${err.message}`);
  }
}


function updateApacheConfig(port = PORT) {
  try {
	// Http.conf
    const confPath = path.join(apacheCwd, 'conf', 'httpd.conf');
    let confContent = fs.readFileSync(confPath, 'utf8');

    const serverRootPath = apacheCwd.replace(/\\/g, '/');
    const docRootPath = htdocsPath.replace(/\\/g, '/');
    const phpPath = path.join(basePath, 'resources', 'php').replace(/\\/g, '/');
    const phpIniDir = phpPath;
    const phpDllPath = detectPhpDll(phpPath);

    confContent = confContent.replace(/^ServerRoot\s+".*"/m, `ServerRoot "${serverRootPath}"`);
    confContent = confContent.replace(/^DocumentRoot\s+".*"/m, `DocumentRoot "${docRootPath}"`);
    confContent = confContent.replace(/<Directory\s+".*htdocs.*?">/m, `<Directory "${docRootPath}">`);

    const serverNameRegex = /^ServerName\s+(.*)$/m;
    if (serverNameRegex.test(confContent)) {
      confContent = confContent.replace(serverNameRegex, 'ServerName localhost');
    } else {
      confContent = `ServerName localhost\n` + confContent;
    }

    const listenRegex = /^Listen\s+\d+$/m;
    if (listenRegex.test(confContent)) {
      confContent = confContent.replace(listenRegex, `Listen ${port}`);
    } else {
      confContent = confContent.replace(/#\s*Listen\s+\d+/, `Listen ${port}`);
    }

    const phpModuleRegex = /^LoadModule\s+php_module\s+".*php\d+apache2_4\.dll"$/m;
    const phpIniRegex = /^PHPIniDir\s+".*"$/m;
    if (phpModuleRegex.test(confContent)) {
      confContent = confContent.replace(phpModuleRegex, `LoadModule php_module "${phpDllPath}"`);
    } else {
      confContent += `\nLoadModule php_module "${phpDllPath}"`;
    }
    if (phpIniRegex.test(confContent)) {
      confContent = confContent.replace(phpIniRegex, `PHPIniDir "${phpIniDir}"`);
    } else {
      confContent += `\nPHPIniDir "${phpIniDir}"`;
    }

    if (!/DirectoryIndex\s+index\.php/m.test(confContent)) {
      confContent += `\nDirectoryIndex index.php index.html`;
    }

    if (!/<FilesMatch\s+\\\.php\$>/.test(confContent)) {
      confContent += `
<FilesMatch \\.php$>
    SetHandler application/x-httpd-php
</FilesMatch>`;
    }
	
	// PHP.ini
	const phpIniFile = path.join(phpIniDir, 'php.ini');
    enableMysqliExtension(phpIniFile);
	
	// PHPMyAdmin
    updatePhpMyAdminConfig();

    fs.writeFileSync(confPath, confContent, 'utf8');
  } catch (err) {
    logToRenderer(`ERROR updating config: ${err.message}`);
  }
}

async function startApache(port = PORT) {
	
  try {
    const progressHandler = progress => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('resource-progress', progress);
      }
    };

    const statuses = [];
    statuses.push(await ReLaunchIsFinish(rApache, progressHandler));
    statuses.push(await ReLaunchIsFinish(rPhp, progressHandler));
    statuses.push(await ReLaunchIsFinish(rPhpMyAdmin, progressHandler));

    if (statuses.includes('done')) {
      progressHandler({ status: 'restarting', message: 'Restarting app after resource initialization...' });
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 1000);
      return;
    }

  } catch (err) {
    console.error('Error during resource download:', err);
  }


  if (apacheProcess) return;

  updateApacheConfig(port);

  const env = { ...process.env };
  env.PATH = `${phpPath};${env.PATH}`;
  
  apacheProcess = spawn(apachePath, [], {
    cwd: apacheCwd,
    stdio: ['ignore', 'pipe', 'pipe'],
	env,
  });

  apacheProcess.stdout?.on('data', (data) => logToRenderer(data.toString()));
  apacheProcess.stderr?.on('data', (data) => logToRenderer(data.toString()));

  apacheProcess.on('close', (code) => {
    apacheProcess = null;
    updateStatus('STOPPED');
  });

  logToRenderer(`Initialized...`);
  logToRenderer(`Waiting for a response from http://localhost:${port}...`);

  const isReady = await waitForApacheReady(port, 5000);

  if (isReady) {
    updateStatus('RUNNING');
    logToRenderer('Is running.');
  } else {
    logToRenderer('Failed to respond. Please check configuration.');
  }
}

async function stopApache() {
  logToRenderer('Stopping...');

  if (!apacheProcess) {
    updateStatus('STOPPED');
    return;
  }

  kill(apacheProcess.pid, 'SIGTERM', async (err) => {
    if (err) {
      logToRenderer(`Stop failed: ${err.message}`);
    } else {
      logToRenderer('Has stopped.');
    }

    await delay(3000);

    updateStatus('STOPPED');
    apacheProcess = null;
  });
}

// Monitoring
async function getApacheStats() {
  if (!apacheProcess) {
    return {
      name: 'Apache',
      status: 'STOPPED',
    };
  }

  try {
    const usage = await pidusage(apacheProcess.pid);
    return {
      name: 'Apache',
      pid: apacheProcess.pid,
      cpu: usage.cpu.toFixed(1) + '%',
      memory: (usage.memory / 1024 / 1024).toFixed(1) + ' MB',
      port: PORT,
      status: 'RUNNING'
    };
  } catch (err) {
    return {
      name: 'Apache',
      status: 'ERROR',
      error: err.message
    };
  }
}

module.exports = { startApache, stopApache, setApacheMain, getApacheStats };
