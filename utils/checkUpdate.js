const { app, dialog, shell } = require('electron');
const axios = require('axios');

/**
 * Checks for application updates by comparing the current version with the latest release on GitHub.
 * 
 * @async
 * @function checkForUpdates
 * @param {Electron.BrowserWindow} win - The Electron browser window to attach dialogs to
 * @param {boolean} [silent=false] - If true, only shows dialog for available updates, not for errors or when already updated
 * @returns {Promise<void>}
 * @description
 * This function fetches the latest release information from the GitHub repository,
 * compares versions, and prompts the user to update if a newer version is available.
 * The function handles downloading by redirecting the user to the appropriate download URL.
 */
async function checkForUpdates(win, silent = false) {
  const releasesUrl = 'https://api.github.com/repos/fitri-hy/FhyServe/releases/latest';

  try {
    const response = await axios.get(releasesUrl);
    const latest = response.data;
    const latestVersion = latest.tag_name?.replace(/^v/, '');
    const releaseNotes = latest.body || 'No details provided.';
    const currentVersion = app.getVersion();

    if (latestVersion && latestVersion !== currentVersion) {
      const exeAsset = latest.assets.find(asset => asset.name.endsWith('.exe'));
      const downloadUrl = exeAsset ? exeAsset.browser_download_url : null;

      const result = await dialog.showMessageBox(win, {
        type: 'info',
        buttons: ['Update Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'New Update Available',
        message: `New version: v${latestVersion}`,
        detail: `Current version: v${currentVersion}\n\nChangelog:\n${releaseNotes}`,
        noLink: true,
      });

      if (result.response === 0 && downloadUrl) {
        shell.openExternal(downloadUrl);
      }
    } else if (!silent) {
      dialog.showMessageBox(win, {
        type: 'info',
        title: 'No Updates',
        message: 'You are using the latest version.',
        buttons: ['OK'],
      });
    }
  } catch (error) {
    if (!silent) {
      dialog.showMessageBox(win, {
        type: 'error',
        title: 'Update Check Failed',
        message: 'Failed to check for updates. Please try again later.',
      });
    }
  }
}

module.exports = { checkForUpdates };
