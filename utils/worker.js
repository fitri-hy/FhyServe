const { parentPort, workerData } = require('worker_threads');
const AdmZip = require('adm-zip');
const path = require('path');

async function zipFolders() {
  try {
    const { resourcePath, publicHtmlPath, requiredResourcesFolders, requiredPublicHtmlFolders, tempZipPath } = workerData;
    const zip = new AdmZip();

    const folders = [
      ...requiredResourcesFolders.map(f => ({ base: resourcePath, folder: f, zipPath: path.posix.join('resource', f) })),
      ...requiredPublicHtmlFolders.map(f => ({ base: publicHtmlPath, folder: f, zipPath: path.posix.join('public_html', ...f.split(path.sep)) })),
    ];

    const totalFolders = folders.length;
    let processed = 0;

    for (const { base, folder, zipPath } of folders) {
      const fullPath = path.join(base, folder);
      zip.addLocalFolder(fullPath, zipPath);
      processed++;
      const percent = Math.round((processed / totalFolders) * 100);
      parentPort.postMessage({ status: 'progress', percent });
    }

    zip.writeZip(tempZipPath);

    parentPort.postMessage({ status: 'done' });
  } catch (error) {
    parentPort.postMessage({ status: 'error', error: error.message });
  }
}

zipFolders();
