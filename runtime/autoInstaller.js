const fs = require('fs');
const path = require('path');
const https = require('https');
const unzipper = require('unzipper');
const { isDevelopment, getBasePath } = require('../utils/pathResource');

const basePath = getBasePath();

/**
 * Downloads a file from URL, extracts its contents to specified path, and tracks download progress.
 * @param {string} url - The URL of the file to download
 * @param {string} extractPath - Local path where contents should be extracted
 * @param {function} onProgress - Optional callback for download progress (received bytes, total bytes)
 * @param {string} cmsName - Name of CMS/platform (used for special path handling)
 * @returns {Promise} Resolves when extraction completes, rejects on error
 */
async function downloadAndExtract(url, extractPath, onProgress, cmsName) {
	return new Promise((resolve, reject) => {
		https.get(url, (res) => {
			// Handle non-200 HTTP status codes
			if (res.statusCode !== 200) {
				reject(new Error('Failed to download: ' + res.statusCode));
				return;
			}

			const total = parseInt(res.headers['content-length'] || 0, 10);
			let downloaded = 0;

			// Create extraction directory if it doesn't exist
			if (!fs.existsSync(extractPath)) {
				fs.mkdirSync(extractPath, { recursive: true });
			}

			// Accumulate downloaded chunks and track progress
			const chunks = [];
			res.on('data', (chunk) => {
				chunks.push(chunk);
				downloaded += chunk.length;
				if (onProgress) onProgress(downloaded, total);
			});

			res.on('end', () => {
				const buffer = Buffer.concat(chunks);
				const directory = unzipper.Parse();

				// Process each entry in the archive
				directory.on('entry', (entry) => {
					// Special path handling for certain CMS platforms
					const filePathParts = ['wordpress', 'laravel', 'codeigniter', 'symfony', 'slim', 'yii', 'cakephp'].includes(cmsName.toLowerCase())
						? entry.path.split('/').slice(1)
						: entry.path.split('/');

					const filePath = path.join(extractPath, ...filePathParts);

					if (entry.type === 'Directory') {
						// Create directory structure
						fs.mkdirSync(filePath, { recursive: true });
						entry.autodrain();
					} else {
						// Ensure parent directory exists and write file
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

/**
 * Asynchronously installs a specified CMS into the target directory.
 * 
 * @param {string} cmsName - The name of the CMS to install (e.g., 'wordpress', 'joomla').
 * @param {string} [version='latest'] - The version of the CMS to install. Defaults to 'latest'.
 * @param {function} onProgress - Callback function for tracking installation progress.
 * @param {string} [target='apache'] - The target server type ('apache' or 'nginx'). Defaults to 'apache'.
 * @returns {Promise<string>} - Resolves to the path where the CMS was installed.
 */
async function installCMS(cmsName, version = 'latest', onProgress, target = 'apache') {
	if (!cmsName) throw new Error('CMS name cannot be empty');

	// Determine the folder name based on the target server type.
	const folderName = target === 'nginx' ? 'nginx_web' : 'apache_web';
	const baseInstallPath = isDevelopment()
		? path.join(basePath, 'public_html', folderName)
		: path.join(basePath, 'resources', 'public_html', folderName);

	let url = '';
	let extractFolder = path.join(baseInstallPath, cmsName.toLowerCase());

	// Set up the download URL and handle different CMS versions.
	switch (cmsName.toLowerCase()) {
		case 'wordpress':
			url = version === 'latest'
				? 'https://wordpress.org/latest.zip'
				: `https://wordpress.org/wordpress-${version}.zip`;
			break;

		case 'joomla':
			// Joomla version-specific URLs.
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
			// Laravel version-specific URLs.
			const laravelVersions = {
				'11': 'https://codeload.github.com/laravel/laravel/zip/refs/tags/v11.0.0',
				'10': 'https://codeload.github.com/laravel/laravel/zip/refs/tags/v10.0.0',
				'9': 'https://codeload.github.com/laravel/laravel/zip/refs/tags/v9.0.0',
			};
			url = version === 'latest'
				? laravelVersions['11']
				: laravelVersions[version] || (() => { throw new Error(`Laravel version ${version} is not supported`); })();
			break;

		case 'codeigniter':
			// CodeIgniter version-specific URLs.
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
			// Symfony version-specific URLs.
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
			// Slim version-specific URLs.
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
			// Yii version-specific URLs.
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
			// CakePHP version-specific URLs.
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

	// If the target extraction folder already exists, create a uniquely numbered folder.
	if (fs.existsSync(extractFolder)) {
		let i = 1;
		let newFolder;
		do {
			newFolder = path.join(baseInstallPath, `${cmsName.toLowerCase()}-${i}`);
			i++;
		} while (fs.existsSync(newFolder));
		extractFolder = newFolder;
	}

	// Download and extract the CMS files to the target folder.
	await downloadAndExtract(url, extractFolder, onProgress, cmsName);
	return extractFolder;
}


module.exports = { installCMS };
