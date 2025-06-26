const fs = require('fs');
const path = require('path');

const replacements = {
  'apache-httpd.conf': '.\\resources\\apache\\conf\\httpd.conf',
  'nginx-nginx.conf': '.\\resources\\nginx\\conf\\nginx.conf',
  'phpfpm-php.ini': '.\\resources\\php-fpm\\php.ini',
  'php-php.ini': '.\\resources\\php\\php.ini',
  'phpmyadmin-config.inc.php': '.\\htdocs\\phpmyadmin\\config.inc.php'
};

const sourceDir = path.resolve(__dirname, 'conf-restore');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function copyFileWithLoading(srcPath, destPath, srcFile) {
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Destination folder created: ${destDir}`);
  }

  process.stdout.write(`Reset files to default ${srcFile} `);

  for (let i = 0; i < 3; i++) {
    process.stdout.write('.');
    await delay(300);
  }

  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(' Success');
  } catch (err) {
    console.log(` Failed: ${err.message}`);
  }
}

async function replaceFiles() {
  for (const [srcFile, destFile] of Object.entries(replacements)) {
    const srcPath = path.resolve(sourceDir, srcFile);
    const destPath = path.resolve(__dirname, destFile);
    await copyFileWithLoading(srcPath, destPath, srcFile);
  }
}

replaceFiles();
