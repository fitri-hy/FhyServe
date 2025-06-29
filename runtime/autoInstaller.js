const fs = require('fs');
const path = require('path');
const https = require('https');
const unzipper = require('unzipper');
const { isDevelopment, getBasePath } = require('../utils/pathResource');

const basePath = getBasePath();

async function downloadAndExtract(url, extractPath, onProgress, cmsName) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('Failed to download: ' + res.statusCode));
        return;
      }

      const total = parseInt(res.headers['content-length'] || 0, 10);
      let downloaded = 0;

      if (!fs.existsSync(extractPath)) {
        fs.mkdirSync(extractPath, { recursive: true });
      }

      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
        downloaded += chunk.length;
        if (onProgress) onProgress(downloaded, total);
      });

      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const directory = unzipper.Parse();

        directory.on('entry', (entry) => {
          const filePathParts = cmsName.toLowerCase() === 'wordpress'
            ? entry.path.split('/').slice(1)
            : entry.path.split('/');

          const filePath = path.join(extractPath, ...filePathParts);

          if (entry.type === 'Directory') {
            fs.mkdirSync(filePath, { recursive: true });
            entry.autodrain();
          } else {
            const dirName = path.dirname(filePath);
            if (!fs.existsSync(dirName)) {
              fs.mkdirSync(dirName, { recursive: true });
            }
            entry.pipe(fs.createWriteStream(filePath));
          }
        });

        directory.on('close', resolve);
        directory.on('error', reject);

        directory.end(buffer);
      });

      res.on('error', reject);
    });
  });
}

async function installCMS(cmsName, version = 'latest', onProgress, target = 'apache') {
  if (!cmsName) throw new Error('CMS name cannot be empty');

  const folderName = target === 'nginx' ? 'nginx_web' : 'apache_web';
  const baseInstallPath = isDevelopment()
    ? path.join(basePath, 'public_html', folderName)
    : path.join(basePath, 'resources', 'public_html', folderName);

  let url = '';
  let extractFolder = path.join(baseInstallPath, cmsName.toLowerCase());

  switch (cmsName.toLowerCase()) {
    case 'wordpress':
      url = version === 'latest'
        ? 'https://wordpress.org/latest.zip'
        : `https://wordpress.org/wordpress-${version}.zip`;
      break;

    case 'joomla':
      const joomlaVersions = {
        '5.3.1': 'https://update.joomla.org/releases/5.3.1/Joomla_5.3.1-Stable-Full_Package.zip',
        '5.3.0': 'https://update.joomla.org/releases/5.3.0/Joomla_5.3.0-Stable-Full_Package.zip',
        '5.2.6': 'https://update.joomla.org/releases/5.2.6/Joomla_5.2.6-Stable-Full_Package.zip',
      };
      if (version === 'latest') {
        url = joomlaVersions['5.3.1'];
      } else if (joomlaVersions[version]) {
        url = joomlaVersions[version];
      } else {
        throw new Error(`Joomla version ${version} is not supported`);
      }
      break;

    default:
      throw new Error('CMS is not supported: ' + cmsName);
  }

  if (fs.existsSync(extractFolder)) {
    let i = 1;
    let newFolder;
    do {
      newFolder = path.join(baseInstallPath, `${cmsName.toLowerCase()}-${i}`);
      i++;
    } while (fs.existsSync(newFolder));
    extractFolder = newFolder;
  }

  await downloadAndExtract(url, extractFolder, onProgress, cmsName);
  return extractFolder;
}


module.exports = { installCMS };
