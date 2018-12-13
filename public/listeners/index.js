const {
  dialog,
  ipcMain,
  shell,
} = require('electron');

const openApp = require('../libs/app-management/open-app');
const installAppAsync = require('../libs/app-management/install-app-async');
const uninstallAppAsync = require('../libs/app-management/uninstall-app-async');
const getInstalledAppsAsync = require('../libs/app-management/get-installed-apps-async');

const {
  getPreference,
  getPreferences,
  setPreference,
  resetPreferences,
} = require('../libs/preferences');

const mainWindow = require('../windows/main');

const packageJson = require('../../package.json');

const loadListeners = () => {
  ipcMain.on('request-open-in-browser', (e, browserUrl) => {
    shell.openExternal(browserUrl);
  });

  // Preferences
  ipcMain.on('get-preference', (e, name) => {
    const val = getPreference(name);
    e.returnValue = val;
  });

  ipcMain.on('get-preferences', (e) => {
    const preferences = getPreferences();
    e.returnValue = preferences;
  });

  ipcMain.on('request-set-preference', (e, name, value) => {
    setPreference(name, value);
  });

  ipcMain.on('request-reset-preferences', () => {
    dialog.showMessageBox(mainWindow.get(), {
      type: 'question',
      buttons: ['Reset Now', 'Cancel'],
      message: 'Are you sure? All preferences will be restored to their original defaults. Browsing data won\'t be affected. This action cannot be undone.',
      cancelId: 1,
    }, (response) => {
      if (response === 0) {
        resetPreferences();
      }
    });
  });

  ipcMain.on('request-get-installed-apps', (e) => {
    getInstalledAppsAsync()
      .then((apps) => {
        apps.forEach((app) => {
          e.sender.send('set-app', app.id, app);
        });
      });
  });

  ipcMain.on('request-open-app', (e, id, name) => openApp(id, name));

  ipcMain.on('request-uninstall-app', (e, id, name) => {
    dialog.showMessageBox(mainWindow.get(), {
      type: 'question',
      buttons: ['Uninstall', 'Cancel'],
      message: `Are you sure you want to uninstall ${name}? This action cannot be undone.`,
      cancelId: 1,
    }, (response) => {
      if (response === 0) {
        e.sender.send('set-app', id, {
          status: 'UNINSTALLING',
        });

        uninstallAppAsync(id, name)
          .then(() => {
            e.sender.send('remove-app', id);
          })
          .catch((error) => {
            /* eslint-disable-next-line */
            console.log(error);
            e.sender.send('set-app', id, {
              status: 'INSTALLED',
            });
          });
      }
    });
  });

  ipcMain.on('request-install-app', (e, id, name, url, icon, mailtoHandler) => {
    e.sender.send('set-app', id, {
      status: 'INSTALLING',
      id,
      name,
      url,
      icon,
      mailtoHandler,
    });
    installAppAsync(id, name, url, icon, mailtoHandler)
      .then(() => {
        e.sender.send('set-app', id, {
          version: packageJson.templateVersion,
          status: 'INSTALLED',
        });
      })
      .catch((error) => {
        /* eslint-disable-next-line */
        console.log(error);
        e.sender.send('remove-app', id);
      });
  });
};

module.exports = loadListeners;
