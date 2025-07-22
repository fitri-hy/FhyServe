const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { pipeline } = require('stream/promises');
const unzipper = require('unzipper');
const { getCheckResource } = require('../utils/checkResource');
const { isDevelopment, getBasePath } = require('../utils/pathResource');

const CHECK_RESOURCE = getCheckResource('CHECK_RESOURCE');

const basePath = getBasePath();
const tempPath = isDevelopment()
  ? path.join(basePath, '.temp')
  : path.join(basePath, 'resources', '.temp');
const resourcePath = isDevelopment()
  ? path.join(basePath, 'resources')
  : path.join(basePath, 'resources');
const publichtmlPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'apache_web')
  : path.join(basePath, 'resources', 'public_html', 'apache_web');

const requiredResourcesFolders = [
  'apache', 'composer', 'git', 'go', 'mysql', 'nginx',
  'nodejs', 'python', 'php', 'php-fpm', 'ruby'
];

const requiredPublicHtmlFolders = ['phpmyadmin'];

const partialResourceUrls = {
  composer: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/composer.zip',
  apache: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/apache.zip',
  nginx: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/nginx.zip',
  phpmyadmin: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/phpmyadmin.zip',
  git: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/git.zip',
  ruby: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/ruby.zip',
  nodejs: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/nodejs.zip',
  python: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/python.zip',
  php: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/php.zip',
  'php-fpm': 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/php-fpm.zip',
  go: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/go.zip',
  mysql: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/mysql.zip',
};

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
      progressCallback?.({ status: 'download_skip', message: 'Cached zip already valid, skipping download.' });
      return;
    } else {
      await fs.unlink(destPath);
      progressCallback?.({ status: 'download_redundant', message: 'Cached zip outdated, re-downloading...' });
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

  const writeStream = fs.createWriteStream(destPath, { highWaterMark: 64 * 1024 });

  response.data.on('data', (chunk) => {
    downloaded += chunk.length;
    if (progressCallback && totalLength) {
      progressCallback({
        status: 'download_progress',
        message: `Downloading... ${(downloaded / totalLength * 100).toFixed(2)}%`,
        percent: downloaded / totalLength,
      });
    }
  });

  try {
    await pipeline(response.data, writeStream);
    progressCallback?.({ status: 'download_success', message: 'Download completed.' });
  } catch (err) {
    if (!abortSignal?.aborted) {
      console.error('Download failed:', err);
    }
    throw err;
  }
}

async function unzipStream(zipFilePath, targetFolderPath, abortSignal) {
  await fs.ensureDir(targetFolderPath);

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(zipFilePath);

    if (abortSignal) {
      const onAbort = () => {
        readStream.destroy(new Error('Extraction aborted'));
        reject(new Error('Extraction aborted'));
      };
      abortSignal.addEventListener('abort', onAbort);
      const cleanup = () => abortSignal.removeEventListener('abort', onAbort);
      readStream.on('close', cleanup);
      readStream.on('error', cleanup);
    }

    const parser = unzipper.Parse();

    parser.on('entry', async (entry) => {
      if (abortSignal?.aborted) {
        entry.autodrain();
        return;
      }

      const filePath = path.join(targetFolderPath, entry.path);
      if (entry.type === 'Directory') {
        await fs.ensureDir(filePath);
        entry.autodrain();
      } else {
        await fs.ensureDir(path.dirname(filePath));
        const writeStream = fs.createWriteStream(filePath, { highWaterMark: 64 * 1024 });
        entry.pipe(writeStream);
        await new Promise((res, rej) => {
          writeStream.on('finish', res);
          writeStream.on('error', rej);
        });
      }
    });

    parser.on('close', resolve);
    parser.on('error', reject);

    readStream.pipe(parser);
  });
}

async function ensureResources(progressCallback, abortSignal) {
  if (!CHECK_RESOURCE) {
    progressCallback?.({ status: 'skip', message: 'Resource check disabled.' });
    return;
  }

  const foldersToCheck = [
    ...requiredResourcesFolders.map(folder => ({ folder, type: 'resource' })),
    ...requiredPublicHtmlFolders.map(folder => ({ folder, type: 'public_html' })),
  ];

  for (const { folder, type } of foldersToCheck) {
    if (abortSignal?.aborted) throw new Error('Aborted');

    const baseFolderPath = type === 'resource' ? resourcePath : publichtmlPath;
    const targetFolderPath = path.join(baseFolderPath, folder);
    const zipFilePath = path.join(tempPath, `${folder}.zip`);

    const exists = await checkFolderExists(baseFolderPath, folder);
    if (exists) {
      progressCallback?.({ status: 'skip_folder', message: `${folder} already exists. Skipping.` });
      continue;
    }

    const zipUrl = partialResourceUrls[folder];
    if (!zipUrl) {
      progressCallback?.({ status: 'error', message: `No URL found for ${folder}` });
      continue;
    }

    try {
      progressCallback?.({ status: 'download_start', message: `Downloading ${folder}...` });

      await downloadZip(zipUrl, zipFilePath, progressCallback, abortSignal);
      progressCallback?.({ status: 'downloaded', message: `${folder}.zip downloaded.` });

      progressCallback?.({ status: 'extracting', message: `Extracting ${folder}...` });

      await unzipStream(zipFilePath, targetFolderPath, abortSignal);

      progressCallback?.({ status: 'extracted', message: `${folder} extracted.` });

      await fs.remove(zipFilePath);
      progressCallback?.({ status: 'cleanup_zip', message: `Removed ${folder}.zip after extraction.` });

    } catch (err) {
      progressCallback?.({ status: 'error', message: `Failed to process ${folder}: ${err.message}` });

      try {
        if (await fs.pathExists(zipFilePath)) {
          await fs.remove(zipFilePath);
          progressCallback?.({ status: 'cleanup', message: `Removed incomplete zip: ${folder}.zip` });
        }
        if (await fs.pathExists(targetFolderPath)) {
          await fs.remove(targetFolderPath);
          progressCallback?.({ status: 'cleanup', message: `Removed incomplete folder: ${folder}` });
        }
      } catch (cleanupErr) {
        progressCallback?.({ status: 'error', message: `Cleanup failed for ${folder}: ${cleanupErr.message}` });
      }
    }
  }

  progressCallback?.({ status: 'done', message: 'All resources have been processed.' });
}

module.exports = { ensureResources };
