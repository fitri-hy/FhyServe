const fs = require('fs-extra');
const path = require('path');
const extract = require('extract-zip');
const { dialog, BrowserWindow } = require('electron');
const { getBasePath, isDevelopment } = require('./pathResource');

const basePath = getBasePath();
const resourcePath = path.join(basePath, 'resources');
const publicHtmlPath = isDevelopment()
  ? path.join(basePath, 'public_html')
  : path.join(basePath, 'resources', 'public_html');

const resourceFolders = [
  'apache', 'composer', 'git', 'go', 'mysql', 'nginx',
  'nodejs', 'php', 'php-fpm', 'python', 'ruby'
];

const publicHtmlFolders = [
  path.join('apache_web', 'phpmyadmin')
];

function createProgressWindow(parent) {
  const win = new BrowserWindow({
    width: 350,
    height: 200,
    parent,
    modal: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
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

  win.loadFile(path.join(__dirname, '../templates/progress.html'));
  return win;
}

async function importResources(win) {
  let progressWin = null;

  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Import Resource Zip',
      filters: [{ name: 'Zip Files', extensions: ['zip'] }],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) return;

    const zipPath = filePaths[0];
    const tempExtractPath = path.join(basePath, '.temp_import');

    progressWin = createProgressWindow(win);
    progressWin.webContents.send('main-progress', 5);

    await fs.remove(tempExtractPath);
    await fs.ensureDir(tempExtractPath);
    await extract(zipPath, { dir: tempExtractPath });
    progressWin.webContents.send('main-progress', 15);

    for (const folder of resourceFolders) {
      const dest = path.join(resourcePath, folder);
      if (await fs.pathExists(dest)) {
        await fs.remove(dest);
      }
    }

    for (const folder of publicHtmlFolders) {
      const dest = path.join(publicHtmlPath, folder);
      if (await fs.pathExists(dest)) {
        await fs.remove(dest);
      }
    }

    progressWin.webContents.send('main-progress', 30);

    for (let i = 0; i < resourceFolders.length; i++) {
      const folder = resourceFolders[i];
      const src = path.join(tempExtractPath, 'resource', folder);
      const dest = path.join(resourcePath, folder);

      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
      }

      const percent = 30 + Math.round((i / (resourceFolders.length + publicHtmlFolders.length)) * 50);
      progressWin.webContents.send('main-progress', percent);
    }

    for (let j = 0; j < publicHtmlFolders.length; j++) {
      const folder = publicHtmlFolders[j];
      const src = path.join(tempExtractPath, 'public_html', folder);
      const dest = path.join(publicHtmlPath, folder);

      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
      }

      const percent = 80 + Math.round((j / publicHtmlFolders.length) * 15);
      progressWin.webContents.send('main-progress', percent);
    }

    await fs.remove(tempExtractPath);
    progressWin.webContents.send('main-progress', 100);

    await dialog.showMessageBox(win, {
      type: 'info',
      title: 'Import Complete',
      message: 'Resources imported successfully.',
      buttons: ['OK']
    });

  } catch (err) {
    console.error('Import failed:', err);
    dialog.showErrorBox('Import Failed', err.message);
  } finally {
    if (progressWin && !progressWin.isDestroyed()) {
      progressWin.close();
    }
  }
}

module.exports = {
  importResources
};
