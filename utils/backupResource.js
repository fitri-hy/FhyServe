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
  'apache', 'composer', 'git', 'go', 'mysql', 'nginx', 'nodejs', 'php', 'php-fpm', 'python', 'ruby'
];

const requiredPublicHtmlFolders = [
  path.join('apache_web', 'phpmyadmin')
];

/**
 * Checks if specified folders exist in the base directory
 * @param {string} base - Base directory path to check
 * @param {string[]} folderList - List of folder names to check
 * @returns {Promise<string[]>} - Array of missing folder paths (relative to base)
 */
async function folderExistsCheck(base, folderList) {
  const missing = [];

  for (const folder of folderList) {
    const fullPath = path.join(base, folder);
    const exists = await fs.pathExists(fullPath);
    if (!exists) {
      missing.push(path.posix.join(path.basename(base), folder));
    }
  }

  return missing;
}

/**
 * Runs a backup worker in a separate thread
 * @param {Object} data - Data to pass to the worker
 * @param {string} data.resourcePath - Path to the resources directory
 * @param {string} data.publicHtmlPath - Path to the public_html directory
 * @param {string[]} data.requiredResourcesFolders - List of required resource folders
 * @param {string[]} data.requiredPublicHtmlFolders - List of required public_html folders
 * @param {string} data.tempZipPath - Path where temporary zip file will be created
 * @param {Function} onProgress - Callback function for progress updates
 * @returns {Promise<void>} - Resolves when backup is complete
 */
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

/**
 * Creates a modal progress window
 * @param {BrowserWindow} parent - Parent window that will own this modal
 * @returns {BrowserWindow} - The configured progress window instance
 */
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
/**
 * Backs up application resources and public_html folders to a zip file
 * 
 * This function performs the following steps:
 * 1. Validates that all required resource folders exist
 * 2. Prompts the user to select a save location
 * 3. Creates a temporary zip file using a worker thread
 * 4. Copies the zip to the user-selected location
 * 
 * @param {BrowserWindow} win - The parent Electron window
 * @returns {Promise<void>} - Resolves when backup completes or is cancelled
 * @throws {Error} - If backup process fails
 */
async function backupResources(win) {
  let progressWin = null;
  try {
    const missingResource = await folderExistsCheck(resourcePath, requiredResourcesFolders);
    const missingPublicHtml = await folderExistsCheck(publicHtmlPath, requiredPublicHtmlFolders);
    const allMissing = [...missingResource, ...missingPublicHtml];

    if (allMissing.length > 0) {
      await dialog.showMessageBox(win, {
        type: 'error',
        title: 'Backup Failed',
        message: 'The following required folders are missing:\n\n' + allMissing.join('\n'),
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
      requiredResourcesFolders,
      requiredPublicHtmlFolders,
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
