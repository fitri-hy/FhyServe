const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { dialog, BrowserWindow } = require('electron');
const { getBasePath, isDevelopment } = require('./pathResource');

const basePath = getBasePath();
const resourcePath = path.join(basePath, 'resources');
const publicHtmlPath = isDevelopment()
  ? path.join(basePath, 'public_html')
  : path.join(basePath, 'resources', 'public_html');

const requiredResourcesFolders = [
  'apache', 'composer', 'git', 'go', 'mysql', 'nginx',
  'nodejs', 'php', 'php-fpm', 'python', 'ruby', 'filebrowser'
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
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile(path.join(__dirname, '../templates/progress.html'));
  return win;
}

async function backupResources(win) {
  let progressWin;

  try {
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Backup Resources',
      defaultPath: 'fhyserve-resources-backup.zip',
      filters: [{ name: 'Zip Files', extensions: ['zip'] }],
    });

    if (canceled || !filePath) return;

    progressWin = createProgressWindow(win);
    progressWin.webContents.send('main-progress', 5);

    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    for (const folder of requiredResourcesFolders) {
      const fullPath = path.join(resourcePath, folder);
      if (await fs.pathExists(fullPath)) {
        archive.directory(fullPath, path.join('resource', folder));
      }
    }

    progressWin.webContents.send('main-progress', 50);

    if (await fs.pathExists(publicHtmlPath)) {
      archive.directory(publicHtmlPath, 'public_html');
    }

    await archive.finalize();
    progressWin.webContents.send('main-progress', 100);

    await dialog.showMessageBox(win, {
      type: 'info',
      title: 'Backup Complete',
      message: 'Resources backup created successfully.',
      buttons: ['OK']
    });

  } catch (err) {
    console.error('Backup failed:', err);
    dialog.showErrorBox('Backup Failed', err.message);
  } finally {
    if (progressWin && !progressWin.isDestroyed()) {
      progressWin.close();
    }
  }
}

module.exports = {
  backupResources
};
