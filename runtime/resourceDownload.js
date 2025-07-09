const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
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

const zipUrl = 'https://github.com/fitri-hy/FhyServe/releases/download/1.0.7/resource-development.zip';
const zipTempPath = path.join(tempPath, 'resource-development.zip');

const requiredResourcesFolders = [
  'apache', 'composer', 'git', 'go', 'mysql', 'nginx', 'nodejs', 'php', 'php-fpm', 'python', 'ruby'
];
const requiredPublicHtmlFolders = ['phpmyadmin'];

/**
 * Checks if a folder exists at the specified path
 * @param {string} baseDir - Base directory path
 * @param {string} folderName - Name of the folder to check
 * @returns {Promise<boolean>} True if folder exists, false otherwise
 */
async function checkFolderExists(baseDir, folderName) {
  try {
    const stats = await fs.stat(path.join(baseDir, folderName));
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Gets the size of a remote file without downloading it
 * @param {string} url - URL of the remote file
 * @returns {Promise<number|null>} File size in bytes or null if unavailable
 */
async function getRemoteFileSize(url) {
  try {
    const response = await axios.head(url);
    const length = response.headers['content-length'];
    return length ? parseInt(length, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Downloads a zip file from a URL with progress tracking
 * @param {string} url - URL of the zip file to download
 * @param {string} destPath - Destination path where the zip will be saved
 * @param {function} progressCallback - Optional callback for progress updates
 * @param {AbortSignal} abortSignal - Optional signal to abort the download
 * @returns {Promise<void>} Resolves when download completes
 */
async function downloadZip(url, destPath, progressCallback, abortSignal) {
  await fs.ensureDir(path.dirname(destPath));

  const remoteSize = await getRemoteFileSize(url);

  if (await fs.pathExists(destPath)) {
    const stats = await fs.stat(destPath);
    if (remoteSize && stats.size === remoteSize) {
      progressCallback && progressCallback({ status: 'download_skip', message: 'Zip already downloaded and valid, using cached file.' });
      return;
    } else {
      progressCallback && progressCallback({ status: 'download_redundant', message: 'Cached zip incomplete or outdated, re-downloading...' });
      await fs.unlink(destPath);
    }
  }

  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const totalLength = response.headers['content-length'];
  let downloaded = 0;

  return new Promise((resolve, reject) => {
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        writer.close();
        reject(new Error('Download aborted'));
      });
    }

    response.data.on('data', (chunk) => {
      if (abortSignal && abortSignal.aborted) {
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
/**
 * Extracts a specific folder from a zip file to a target location
 * @param {string} zipPath - Path to the zip file
 * @param {string} tempExtractPath - Target extraction path
 * @param {string} folderInZip - Folder path within the zip to extract
 * @returns {Promise<boolean>} True if extraction succeeded, false if folder not found
 */
async function extractFolderFromZipToTemp(zipPath, tempExtractPath, folderInZip) {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  const prefix = folderInZip.endsWith('/') ? folderInZip : folderInZip + '/';

  const entries = zipEntries.filter(e => e.entryName.startsWith(prefix));

  if (entries.length === 0) {
    return false;
  }

  for (const entry of entries) {
    const relativePath = entry.entryName.slice(prefix.length);
    if (!relativePath) continue;

    const targetPath = path.join(tempExtractPath, relativePath);

    if (await fs.pathExists(targetPath)) continue;

    if (entry.isDirectory) {
      await fs.ensureDir(targetPath);
    } else {
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, entry.getData());
    }
  }

  return true;
}

/**
 * Copies a folder and its contents to a destination
 * @param {string} src - Source folder path
 * @param {string} dest - Destination folder path
 * @returns {Promise<void>} Resolves when copy completes
 */
async function copyFolder(src, dest) {
  await fs.ensureDir(dest);
  await fs.copy(src, dest, { overwrite: true, errorOnExist: false });
}

/**
 * Ensures all required resources are available, downloading and extracting if needed
 * @param {function} progressCallback - Callback function for progress updates
 * @param {AbortSignal} abortSignal - Signal to abort the operation
 * @returns {Promise<void>} Resolves when resources are ensured
 * @throws {Error} If operation is aborted or fails
 */
async function ensureResources(progressCallback, abortSignal) {
  if (!CHECK_RESOURCE) {
    progressCallback && progressCallback({ status: 'skip', message: 'Resource check disabled, skipping download/extract.' });
    return;
  }

  /**
   * Checks if the operation has been aborted and throws an error if so
   * @throws {Error} If the abort signal is triggered
   */
  function checkAbort() {
    if (abortSignal && abortSignal.aborted) {
      throw new Error('Resource download aborted');
    }
  }

  let needExtractFolders = [];

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
    progressCallback && progressCallback({ status: 'skip', message: 'All required folders exist.' });
    return;
  }

  progressCallback && progressCallback({ status: 'download_start', message: 'Preparing resources...' });
  await downloadZip(zipUrl, zipTempPath, progressCallback, abortSignal);
  progressCallback && progressCallback({ status: 'download_complete', message: 'Resources ready.' });

  for (const item of needExtractFolders) {
    checkAbort();
    if (item.type === 'resource') {
      progressCallback && progressCallback({ status: 'extracting', message: `Extracting resources ${item.folder}. Please wait...` });
      const targetPath = path.join(resourcePath, item.folder);
      const folderInZip = `resources/${item.folder}`;
      const success = await extractFolderFromZipToTemp(zipTempPath, targetPath, folderInZip);
      if (!success) {
        console.warn(`Resources ${item.folder} not found, skipping extract.`);
      }
    } else {
      progressCallback && progressCallback({ status: 'extracting', message: `Extracting resources ${item.folder}. Please wait...` });
      const targetPath = path.join(publichtmlPath, item.folder);
      const folderInZip = `public_html/apache_web/${item.folder}`;
      const success = await extractFolderFromZipToTemp(zipTempPath, targetPath, folderInZip);
      if (!success) {
        console.warn(`Resources ${item.folder} not found, skipping extract.`);
      }
    }
  }

  progressCallback && progressCallback({ status: 'done', message: 'Extraction finished.' });
}

module.exports = { ensureResources };
