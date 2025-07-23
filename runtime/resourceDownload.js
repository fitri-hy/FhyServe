const { app } = require('electron');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { pipeline } = require('stream/promises');
const unzipper = require('unzipper');
const { isDevelopment, getBasePath } = require('../utils/pathResource');

const basePath = getBasePath();
const tempPath = isDevelopment()
  ? path.join(basePath, '.temp')
  : path.join(basePath, 'resources', '.temp');
const resourcePath = path.join(basePath, 'resources');
const publichtmlPath = isDevelopment()
  ? path.join(basePath, 'public_html', 'apache_web')
  : path.join(basePath, 'resources', 'public_html', 'apache_web');

const partialResourceUrls = {
  mysql: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/mysql.zip',
  php: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/php.zip',
  nodejs: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/nodejs.zip',
  apache: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/apache.zip',
  nginx: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/nginx.zip',
  python: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/python.zip',
  ruby: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/ruby.zip',
  go: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/go.zip',
  composer: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/composer.zip',
  git: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/git.zip',
  'php-fpm': 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/php-fpm.zip',
  phpmyadmin: 'https://github.com/fitri-hy/FhyServe-resources/releases/download/1.0.0/phpmyadmin.zip',
};

async function checkFolderExists(baseDir, folderName) {
  try {
    const stats = await fs.stat(path.join(baseDir, folderName));
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function extractZipManual(zipFilePath, targetFolder) {
  await fs.ensureDir(targetFolder);
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(zipFilePath).pipe(unzipper.Parse());

    const writePromises = [];

    stream.on('entry', entry => {
      const filePath = path.join(targetFolder, entry.path);

      if (entry.type === 'Directory') {
        writePromises.push(
          fs.ensureDir(filePath)
            .then(() => entry.autodrain())
            .catch(reject)
        );
      } else {
        const writeStream = fs.createWriteStream(filePath);

        entry.pipe(writeStream);

        const p = new Promise((res, rej) => {
          writeStream.on('finish', res);
          writeStream.on('error', rej);
          entry.on('error', rej);
        });

        writePromises.push(p);
      }
    });

    stream.on('error', reject);

    stream.on('close', async () => {
      try {
        await Promise.all(writePromises);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function cleanTemp() {
  if (await fs.pathExists(tempPath)) {
    await fs.emptyDir(tempPath);
  }
}

async function downloadAndExtract(serviceName, baseFolder, progressCallback) {
  const targetFolder = path.join(baseFolder, serviceName);
  const url = partialResourceUrls[serviceName];

  if (!url) {
    progressCallback?.({
      status: 'error',
      message: `The URL for resource ${serviceName} was not found.`,
      service: serviceName,
    });
    throw new Error(`The URL for resource ${serviceName} was not found.`);
  }

  const exists = await checkFolderExists(baseFolder, serviceName);
  if (exists) {
    progressCallback?.({
      status: 'skip',
      message: `${serviceName} already available.`,
      service: serviceName,
    });
    return 'skip';
  }

  await fs.ensureDir(tempPath);
  const zipFilePath = path.join(tempPath, `${serviceName}.zip`);

  if (await fs.pathExists(zipFilePath)) await fs.unlink(zipFilePath);

  progressCallback?.({
    status: 'download_start',
    message: `Start downloading ${serviceName}...`,
    service: serviceName,
  });

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  const totalLength = parseInt(response.headers['content-length'] || '0', 10);
  let downloaded = 0;

  const writeStream = fs.createWriteStream(zipFilePath);

  response.data.on('data', (chunk) => {
    downloaded += chunk.length;
    if (progressCallback && totalLength) {
      progressCallback({
        status: 'download_progress',
        message: `Downloading ${serviceName}... ${(downloaded / totalLength * 100).toFixed(2)}%`,
        percent: downloaded / totalLength,
        service: serviceName,
      });
    }
  });

  try {
    await pipeline(response.data, writeStream);
  } catch (err) {
    response.data.destroy();
    writeStream.destroy();
    throw err;
  }

  const stats = await fs.stat(zipFilePath);
  if (totalLength && stats.size !== totalLength) {
    throw new Error(`Downloaded file size mismatch for ${serviceName}: expected ${totalLength}, got ${stats.size}`);
  }

  progressCallback?.({
    status: 'download_complete',
    message: `Download ${serviceName} finished.`,
    service: serviceName,
  });

  progressCallback?.({
    status: 'extracting',
    message: `Start extracting ${serviceName}...`,
    service: serviceName,
  });

  await fs.ensureDir(targetFolder);

  try {
    await pipeline(
      fs.createReadStream(zipFilePath),
      unzipper.Extract({ path: targetFolder })
    );
  } catch (err) {
    try {
      await extractZipManual(zipFilePath, targetFolder);
    } catch (manualErr) {
      throw new Error(`Extraction failed for ${serviceName}: ${manualErr.message}`);
    }
  }

  progressCallback?.({
    status: 'extracting',
    message: `${serviceName} extracted successfully.`,
    service: serviceName,
  });

  await fs.remove(zipFilePath);

  progressCallback?.({
    status: 'extracting',
    message: `Zip file ${serviceName} deleted.`,
    service: serviceName,
  });

  progressCallback?.({
    status: 'done',
    message: `${serviceName} finished downloading and extracting.`,
    service: serviceName,
  });

  try {
    await cleanTemp();
    progressCallback?.({
      status: 'cleaned',
      message: `Temporary folder cleaned after ${serviceName} extraction.`,
      service: serviceName,
    });
  } catch (cleanErr) {
    console.error(`Failed to clean temp folder after ${serviceName}:`, cleanErr);
  }

  return 'done';
}

async function downloadAndExtractWithRetry(serviceName, baseFolder, progressCallback, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await downloadAndExtract(serviceName, baseFolder, progressCallback);
      return result; // Return 'done' or 'skip'
    } catch (err) {
      console.warn(`Attempt ${attempt} failed for ${serviceName}: ${err.message}`);
      if (attempt === retries) throw err;
    }
  }
}

function createResourceFunc(serviceName, baseFolder) {
  return async function(progressCallback) {
    let finalStatus = null;
    await downloadAndExtractWithRetry(serviceName, baseFolder, (progress) => {
      progressCallback?.(progress);
      if (progress.status === 'done') finalStatus = 'done';
      if (progress.status === 'skip') finalStatus = finalStatus !== 'done' ? 'skip' : finalStatus;
    });
    return finalStatus;
  };
}

const rMysql = createResourceFunc('mysql', resourcePath);
const rPhp = createResourceFunc('php', resourcePath);
const rNode = createResourceFunc('nodejs', resourcePath);
const rApache = createResourceFunc('apache', resourcePath);
const rNginx = createResourceFunc('nginx', resourcePath);
const rPython = createResourceFunc('python', resourcePath);
const rRuby = createResourceFunc('ruby', resourcePath);
const rGo = createResourceFunc('go', resourcePath);
const rComposer = createResourceFunc('composer', resourcePath);
const rGit = createResourceFunc('git', resourcePath);
const rPhpFpm = createResourceFunc('php-fpm', resourcePath);
const rPhpMyAdmin = createResourceFunc('phpmyadmin', publichtmlPath);

function restartApp(progressCallback) {
  progressCallback?.({
    status: 'restarting',
    message: 'Restarting app after resource initialization...',
  });
  setTimeout(() => {
    app.relaunch();
    app.exit(0);
  }, 1000);
}

async function ReLaunchIsFinish(resourceFunc, progressCallback) {
  const status = await resourceFunc(progress => {
    progressCallback?.(progress);
  });
  return status;
}

module.exports = {
  rMysql,
  rPhp,
  rNode,
  rApache,
  rNginx,
  rPython,
  rRuby,
  rGo,
  rComposer,
  rGit,
  rPhpFpm,
  rPhpMyAdmin,
  ReLaunchIsFinish,
};
