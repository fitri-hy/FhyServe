const fs = require('fs');
const path = require('path');

const replacements = {
  'apache-httpd.conf': '.\\resources\\apache\\conf\\httpd.conf',
  'nginx-nginx.conf': '.\\resources\\nginx\\conf\\nginx.conf',
  'phpfpm-php.ini': '.\\resources\\php-fpm\\php.ini',
  'php-php.ini': '.\\resources\\php\\php.ini',
  'phpmyadmin-config.inc.php': '.\\public_html\\apache_web\\phpmyadmin\\config.inc.php'
};

const sourceDir = path.resolve(__dirname, 'conf-restore');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function showLoading(message, times = 3, interval = 300) {
  process.stdout.write(message);
  for (let i = 0; i < times; i++) {
    process.stdout.write('.');
    await delay(interval);
  }
  process.stdout.write('\n');
}

async function deletePath(targetPath, type = 'file') {
  try {
    if (type === 'folder') {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(targetPath);
    }
  } catch (err) {
    // You can handle errors here if needed
  }
}

async function copyFile(srcPath, destPath) {
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(srcPath, destPath);
}

async function replaceFiles() {
  console.log('Execute configuration reset.');

  await showLoading('Processing please wait');

  const mysqlDataFolder = path.resolve(__dirname, 'resources/mysql/data');
  if (fs.existsSync(mysqlDataFolder)) {
    await deletePath(mysqlDataFolder, 'folder');
  }

  const myIniFile = path.resolve(__dirname, 'resources/mysql/my.ini');
  if (fs.existsSync(myIniFile)) {
    await deletePath(myIniFile, 'file');
  }

  for (const [srcFile, destFile] of Object.entries(replacements)) {
    const srcPath = path.resolve(sourceDir, srcFile);
    const destPath = path.resolve(__dirname, destFile);
    await copyFile(srcPath, destPath);
  }

  console.log('Config completed reset.');
}

replaceFiles();
