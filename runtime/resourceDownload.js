const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { pipeline } = require('stream/promises');
const unzipper = require('unzipper');
const pLimit = require('p-limit');
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

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    signal: abortSignal,
  });

  const totalLength = parseInt(response.headers['content-length'] || '0', 10);
  let downloaded = 0;

  const writeStream = fs.createWriteStream(destPath, { highWaterMark: 16 * 1024 });

  response.data.on('data', (chunk) => {
    downloaded += chunk.length;
    if (progressCallback && totalLength) {
      progressCallback({
        status: 'download_progress',
        message: `Downloading resources ${(downloaded / totalLength * 100).toFixed(2)}%. Please wait...`,
        percent: downloaded / totalLength,
      });
    }
  });

  try {
    await pipeline(response.data, writeStream);
    progressCallback?.({ status: 'download_success', message: 'Download completed successfully.' });
  } catch (err) {
    if (!abortSignal?.aborted) {
      console.error('Download failed:', err);
    }
    throw err;
  }
}

async function extractFolderFromZipToTemp(zipPath, tempExtractPath, folderInZip) {
  const limit = pLimit(3);
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(zipPath).pipe(unzipper.Parse());
    const promises = [];

    stream.on('entry', (entry) => {
      const entryName = entry.path;

      if (!entryName.startsWith(folderInZip + '/')) {
        entry.autodrain();
        return;
      }

      const relativePath = entryName.slice(folderInZip.length + 1);
      const targetPath = path.join(tempExtractPath, relativePath);

      const p = limit(async () => {
        if (entry.type === 'Directory') {
          await fs.ensureDir(targetPath);
          entry.autodrain();
        } else {
          await fs.ensureDir(path.dirname(targetPath));
          await new Promise((res, rej) => {
            const writeStream = fs.createWriteStream(targetPath, { highWaterMark: 16 * 1024 });
            entry.pipe(writeStream);
            writeStream.on('finish', res);
            writeStream.on('error', rej);
          });
        }
      });
      promises.push(p);
    });

    stream.on('close', async () => {
      try {
        await Promise.all(promises);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });

    stream.on('error', reject);
  });
}

async function copyFolder(src, dest) {
  await fs.ensureDir(dest);
  await fs.copy(src, dest, { overwrite: true, errorOnExist: false });
}

async function ensureResources(progressCallback, abortSignal) {
  if (!CHECK_RESOURCE) {
    progressCallback?.({ status: 'skip', message: 'Resource check disabled, skipping download/extract.' });
    return;
  }

  function checkAbort() {
    if (abortSignal?.aborted) {
      throw new Error('Resource download aborted');
    }
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

    progressCallback?.({ status: 'extracting', message: `Extracting ${item.folder}. Please wait...` });

    const targetPath =
      item.type === 'resource'
        ? path.join(resourcePath, item.folder)
        : path.join(publichtmlPath, item.folder);

    const folderInZip =
      item.type === 'resource'
        ? `resource/${item.folder}`
        : `public_html/apache_web/${item.folder}`;

    const success = await extractFolderFromZipToTemp(zipTempPath, targetPath, folderInZip);
    if (!success) {
      console.warn(`Resources ${item.folder} not found or failed to extract.`);
    }
  }

  progressCallback?.({ status: 'done', message: 'Extraction finished.' });
}

module.exports = { ensureResources };
