const fs = require('fs-extra');
const path = require('path');
const { dialog, BrowserWindow } = require('electron');
const { Worker } = require('node:worker_threads');
const { getBasePath, isDevelopment } = require('./pathResource');

const basePath = getBasePath();

const tempPath = isDevelopment()
  ? path.join(basePath, '.temp')
  : path.join(basePath, 'resources', '.temp');

const resourcePath = path.join(basePath, 'resources');
const publicHtmlPath = isDevelopment()
  ? path.join(basePath, 'public_html')
  : path.join(basePath, 'resources', 'public_html');

const requiredResourcesFolders = [
  'apache', 'composer', 'git', 'go', 'mysql', 'nginx', 'nodejs', 'php', 'php-fpm', 'python', 'ruby', 'filebrowser'
];

const requiredPublicHtmlFolders = [
  path.join('apache_web', 'phpmyadmin')
];

async function folderExistsCheck(base, folderList) {
  const existing = [];

  for (const folder of folderList) {
    const fullPath = path.join(base, folder);
    if (await fs.pathExists(fullPath)) {
      existing.push(folder);
    }
  }

  return existing;
}

function runBackupWorker(data, onProgress) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: data,
    });

    worker.on('message', (msg) => {
      if (msg.status === 'done') {
        resolve();
      } else if (msg.status === 'error') {
        reject(new Error(msg.error));
      } else if (msg.status === 'progress' && onProgress) {
        onProgress(msg.percent);
      }
    });

    worker.on('error', reject);

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

function createProgressWindow(parent) {
  const progressWin = new BrowserWindow({
    width: 350,
    height: 200,
    parent: parent,
    modal: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    frame: true,
    movable: false,
    skipTaskbar: true,
    icon: path.join(__dirname, '../templates/images/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  progressWin.loadFile(path.join(__dirname, '../templates/progress.html'));

  return progressWin;
}

async function backupResources(win) {
  let progressWin = null;
  try {
    // Ambil hanya folder yang ada
    const existingResources = await folderExistsCheck(resourcePath, requiredResourcesFolders);
    const existingPublicHtml = await folderExistsCheck(publicHtmlPath, requiredPublicHtmlFolders);

    if (existingResources.length === 0 && existingPublicHtml.length === 0) {
      await dialog.showMessageBox(win, {
        type: 'info',
        title: 'Nothing to Backup',
        message: 'No folders found to backup.',
        buttons: ['OK']
      });
      return;
    }

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save Backup Resource',
      defaultPath: 'resource-development.zip',
      filters: [{ name: 'Zip Files', extensions: ['zip'] }]
    });

    if (canceled || !filePath) return;

    await fs.ensureDir(tempPath);

    const tempZipPath = path.join(tempPath, 'temp-backup-resource.zip');

    progressWin = createProgressWindow(win);

    await runBackupWorker({
      resourcePath,
      publicHtmlPath,
      requiredResourcesFolders: existingResources,
      requiredPublicHtmlFolders: existingPublicHtml,
      tempZipPath
    }, (percent) => {
      progressWin.webContents.send('main-progress', percent);
    });

    await fs.copy(tempZipPath, filePath, { overwrite: true });
    await fs.remove(tempZipPath);

    await dialog.showMessageBox(win, {
      type: 'info',
      title: 'Backup Complete',
      message: 'Backup successfully saved!',
      buttons: ['OK']
    });

  } catch (error) {
    console.error('Backup failed:', error);
    dialog.showErrorBox('Backup Failed', error.message);
  } finally {
    if (progressWin && !progressWin.isDestroyed()) {
      progressWin.close();
    }
  }
}

module.exports = {
  backupResources
};
