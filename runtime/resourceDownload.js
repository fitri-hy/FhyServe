const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const unzipper = require('unzipper');
const { getCheckResource } = require('../utils/checkResource');
const { isDevelopment, getBasePath } = require('../utils/pathResource');

const CHECK_RESOURCE = getCheckResource('CHECK_RESOURCE');

const basePath = getBasePath();
const tempPath = isDevelopment()
  ? path.join(basePath, '.temp')
  : path.join(basePath, 'resources', '.temp');

const resourcePath = path.join(basePath, 'resources');
const publichtmlPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'apache_web')
  : path.join(basePath, 'resources', 'public_html', 'apache_web');

const zipUrl = 'https://github.com/fitri-hy/FhyServe/releases/download/1.0.8/resource-development.zip';
const zipTempPath = path.join(tempPath, 'resource-development.zip');

const requiredResourcesFolders = [
  'apache', 'composer', 'git', 'go', 'mysql', 'nginx', 'nodejs', 'php', 'php-fpm', 'python', 'ruby'
];
const requiredPublicHtmlFolders = ['phpmyadmin'];

async function checkFolderExists(baseDir, folderName) {
  try {
    const stats = await fs.stat(path.join(baseDir, folderName));
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function getRemoteFileSize(url) {
  try {
    const response = await axios.head(url);
    const length = response.headers['content-length'];
    return length ? parseInt(length, 10) : null;
  } catch {
    return null;
  }
}

async function downloadZip(url, destPath, progressCallback, abortSignal) {
  await fs.ensureDir(path.dirname(destPath));
  const remoteSize = await getRemoteFileSize(url);

  if (await fs.pathExists(destPath)) {
    const stats = await fs.stat(destPath);
    if (remoteSize && stats.size === remoteSize) {
      progressCallback?.({ status: 'download_skip', message: 'Zip already downloaded and valid, using cached file.' });
      return;
    } else {
      progressCallback?.({ status: 'download_redundant', message: 'Cached zip incomplete or outdated, re-downloading...' });
      await fs.unlink(destPath);
    }
  }

  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const totalLength = parseInt(response.headers['content-length'], 10);
  let downloaded = 0;

  return new Promise((resolve, reject) => {
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        writer.close();
        reject(new Error('Download aborted'));
      });
    }

    response.data.on('data', (chunk) => {
      if (abortSignal?.aborted) {
        writer.close();
        reject(new Error('Download aborted'));
        return;
      }
      downloaded += chunk.length;
      if (progressCallback && totalLength) {
        progressCallback({
          status: 'download_progress',
          message: `Downloading resources ${(downloaded / totalLength * 100).toFixed(2)}%. Please wait...`,
          percent: downloaded / totalLength,
        });
      }
    });

    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// ✅ Ekstrak per-folder dari ZIP secara streaming, RAM efisien
async function extractFolderFromZipToTemp(zipPath, tempExtractPath, folderInZip) {
  const prefix = folderInZip.endsWith('/') ? folderInZip : folderInZip + '/';

  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', async (entry) => {
        const entryName = entry.path;

        if (entryName.startsWith(prefix)) {
          const relativePath = entryName.slice(prefix.length);
          if (!relativePath) {
            entry.autodrain();
            return;
          }

          const targetPath = path.join(tempExtractPath, relativePath);
          await fs.ensureDir(path.dirname(targetPath));

          if (entry.type === 'Directory') {
            await fs.ensureDir(targetPath);
            entry.autodrain();
          } else {
            entry.pipe(fs.createWriteStream(targetPath));
          }
        } else {
          entry.autodrain();
        }
      })
      .on('close', () => resolve(true))
      .on('error', reject);
  });
}

async function ensureResources(progressCallback, abortSignal) {
  if (!CHECK_RESOURCE) {
    progressCallback?.({ status: 'skip', message: 'Resource check disabled, skipping download/extract.' });
    return;
  }

  function checkAbort() {
    if (abortSignal?.aborted) throw new Error('Resource download aborted');
  }

  const needExtractFolders = [];

  for (const folder of requiredResourcesFolders) {
    checkAbort();
    const exists = await checkFolderExists(resourcePath, folder);
    if (!exists) {
      needExtractFolders.push({ folder, type: 'resource' });
    }
  }

  for (const folder of requiredPublicHtmlFolders) {
    checkAbort();
    const exists = await checkFolderExists(publichtmlPath, folder);
    if (!exists) {
      needExtractFolders.push({ folder, type: 'public_html' });
    }
  }

  if (needExtractFolders.length === 0) {
    progressCallback?.({ status: 'skip', message: 'All required folders exist.' });
    return;
  }

  progressCallback?.({ status: 'download_start', message: 'Preparing resources...' });
  await downloadZip(zipUrl, zipTempPath, progressCallback, abortSignal);
  progressCallback?.({ status: 'download_complete', message: 'Resources ready.' });

  for (const item of needExtractFolders) {
    checkAbort();
    progressCallback?.({ status: 'extracting', message: `Extracting ${item.folder}...` });

    const targetPath = item.type === 'resource'
      ? path.join(resourcePath, item.folder)
      : path.join(publichtmlPath, item.folder);

    const folderInZip = item.type === 'resource'
      ? `resources/${item.folder}`
      : `public_html/apache_web/${item.folder}`;

    const success = await extractFolderFromZipToTemp(zipTempPath, targetPath, folderInZip);
    if (!success) {
      console.warn(`Folder ${item.folder} not found in ZIP.`);
    }
  }

  progressCallback?.({ status: 'done', message: 'Extraction finished.' });
}

module.exports = { ensureResources };
