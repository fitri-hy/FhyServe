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
          const filePathParts = ['wordpress', 'laravel', 'codeigniter', 'symfony', 'slim', 'yii', 'cakephp' ].includes(cmsName.toLowerCase())
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
		url = version === 'latest'
		  ? joomlaVersions['5.3.1']
		  : joomlaVersions[version] || (() => { throw new Error(`Joomla version ${version} is not supported`); })();
		break;

	  case 'laravel':
		const laravelVersions = {
		  '11': 'https://codeload.github.com/laravel/laravel/zip/refs/tags/v11.0.0',
		  '10': 'https://codeload.github.com/laravel/laravel/zip/refs/tags/v10.0.0',
		  '9':  'https://codeload.github.com/laravel/laravel/zip/refs/tags/v9.0.0',
		};
		url = version === 'latest'
		  ? laravelVersions['11']
		  : laravelVersions[version] || (() => { throw new Error(`Laravel version ${version} is not supported`); })();
		break;

	  case 'codeigniter':
		const codeigniterVersions = {
		  '4.5.1': 'https://codeload.github.com/codeigniter4/CodeIgniter4/zip/refs/tags/v4.5.1',
		  '4.5.0': 'https://codeload.github.com/codeigniter4/CodeIgniter4/zip/refs/tags/v4.5.0',
		  '4.4.6': 'https://codeload.github.com/codeigniter4/CodeIgniter4/zip/refs/tags/v4.4.6',
		};
		url = version === 'latest'
		  ? codeigniterVersions['4.5.1']
		  : codeigniterVersions[version] || (() => { throw new Error(`CodeIgniter version ${version} is not supported`); })();
		break;

	  case 'symfony':
		const symfonyVersions = {
		  '7.3.1': 'https://codeload.github.com/symfony/symfony/zip/refs/tags/v7.3.1',
		  '7.2.8': 'https://codeload.github.com/symfony/symfony/zip/refs/tags/v7.2.8',
		  '6.4.23': 'https://codeload.github.com/symfony/symfony/zip/refs/tags/v6.4.23',
		};
		url = version === 'latest'
		  ? symfonyVersions['7.3.1']
		  : symfonyVersions[version] || (() => { throw new Error(`Symfony version ${version} is not supported`); })();
		break;

	  case 'slim':
		const slimVersions = {
		  '4.5.0': 'https://codeload.github.com/slimphp/Slim-Skeleton/zip/refs/tags/4.5.0',
		  '4.4.0': 'https://codeload.github.com/slimphp/Slim-Skeleton/zip/refs/tags/4.4.0',
		  '4.3.0': 'https://codeload.github.com/slimphp/Slim-Skeleton/zip/refs/tags/4.3.0',
		};
		url = version === 'latest'
		  ? slimVersions['4.5.0']
		  : slimVersions[version] || (() => { throw new Error(`Slim version ${version} is not supported`); })();
		break;

	  case 'yii':
		const yiiVersions = {
		  '2.0.53': 'https://codeload.github.com/yiisoft/yii2-app-basic/zip/refs/tags/2.0.53',
		  '2.0.52': 'https://codeload.github.com/yiisoft/yii2-app-basic/zip/refs/tags/2.0.52',
		  '2.0.51': 'https://codeload.github.com/yiisoft/yii2-app-basic/zip/refs/tags/2.0.51',
		};
		url = version === 'latest'
		  ? yiiVersions['2.0.53']
		  : yiiVersions[version] || (() => { throw new Error(`Yii version ${version} is not supported`); })();
		break;

	  case 'cakephp':
		const cakephpVersions = {
		  '5.1.2': 'https://codeload.github.com/cakephp/app/zip/refs/tags/5.1.2',
		  '5.1.1': 'https://codeload.github.com/cakephp/app/zip/refs/tags/5.1.1',
		  '5.1.0': 'https://codeload.github.com/cakephp/app/zip/refs/tags/5.1.0',
		};
		url = version === 'latest'
		  ? cakephpVersions['5.1.2']
		  : cakephpVersions[version] || (() => { throw new Error(`CakePHP version ${version} is not supported`); })();
		break;

	  default:
		throw new Error('Pack is not supported: ' + cmsName);
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
