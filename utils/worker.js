const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');

async function zipFolders() {
  try {
    const {
      resourcePath,
      publicHtmlPath,
      requiredResourcesFolders,
      requiredPublicHtmlFolders,
      tempZipPath
    } = workerData;

    await fs.ensureDir(path.dirname(tempZipPath));
    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const folders = [
      ...requiredResourcesFolders.map(f => ({
        base: resourcePath,
        folder: f,
        zipPath: path.posix.join('resource', f)
      })),
      ...requiredPublicHtmlFolders.map(f => ({
        base: publicHtmlPath,
        folder: f,
        zipPath: path.posix.join('public_html', ...f.split(path.sep))
      })),
    ];

    const totalFolders = folders.length;
    let processed = 0;

    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err.message);
      } else {
        throw err;
      }
    });

    archive.on('error', err => {
      throw err;
    });

    output.on('close', () => {
      parentPort.postMessage({ status: 'done' });
    });

    archive.pipe(output);

    for (const { base, folder, zipPath } of folders) {
      const fullPath = path.join(base, folder);
      if (await fs.pathExists(fullPath)) {
        archive.directory(fullPath, zipPath);
      }
      processed++;
      const percent = Math.round((processed / totalFolders) * 100);
      parentPort.postMessage({ status: 'progress', percent });
    }

    await archive.finalize();
  } catch (error) {
    parentPort.postMessage({ status: 'error', error: error.message });
  }
}

zipFolders();
