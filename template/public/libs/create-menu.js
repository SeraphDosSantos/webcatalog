const {
  Menu,
  clipboard,
  shell,
  dialog,
} = require('electron');

const appJson = require('../app.json');

const mainWindow = require('../windows/main');
const preferencesWindow = require('../windows/preferences');

const {
  countWorkspaces,
  getWorkspaces,
  getActiveWorkspace,
  getNextWorkspace,
  getPreviousWorkspace,
} = require('../libs/workspaces');

const {
  createWorkspaceView,
  setActiveWorkspaceView,
  clearBrowsingData,
} = require('./workspaces-views');

function createMenu() {
  const template = [
    {
      label: appJson.name,
      submenu: [
        { role: 'about' },
        {
          label: 'Check for Updates...',
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: () => preferencesWindow.show(),
        },
        { type: 'separator' },
        {
          label: 'Clear Browsing Data...',
          accelerator: 'CmdOrCtrl+Shift+Delete',
          click: () => {
            dialog.showMessageBox(preferencesWindow.get() || mainWindow.get(), {
              type: 'question',
              buttons: ['Clear Now', 'Cancel'],
              message: 'Are you sure? All browsing data will be cleared. This action cannot be undone.',
              cancelId: 1,
            }, (response) => {
              if (response === 0) {
                clearBrowsingData();
              }
            });
          },
        },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Reload This Page',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            const win = mainWindow.get();

            if (win != null) {
              win.getBrowserView().webContents.reload();
            }
          },
        },
      ],
    },
    {
      label: 'History',
      submenu: [
        {
          label: 'Home',
          accelerator: 'Shift+CmdOrCtrl+H',
          click: () => {
            const win = mainWindow.get();

            if (win != null) {
              const activeWorkspace = getActiveWorkspace();
              const homeUrl = activeWorkspace.home || appJson.url;
              win.getBrowserView().webContents.loadURL(homeUrl);
            }
          },
        },
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+[',
          click: () => {
            const win = mainWindow.get();

            if (win != null && win.getBrowserView().webContents.canGoBack()) {
              win.getBrowserView().webContents.goBack();
            }
          },
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+]',
          click: () => {
            const win = mainWindow.get();

            if (win != null && win.getBrowserView().webContents.canGoForward()) {
              win.getBrowserView().webContents.goForward();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Copy URL',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            const win = mainWindow.get();

            if (win != null) {
              const url = win.getBrowserView().webContents.getURL();
              clipboard.writeText(url);
            }
          },
        },
      ],
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Website',
          click: () => shell.openExternal('https://getwebcatalog.com'),
        },
        { type: 'separator' },
        {
          label: 'Contact Us',
          click: () => shell.openExternal('https://getwebcatalog.com/support'),
        },
      ],
    },
  ];

  Object.values(getWorkspaces())
    .sort((a, b) => a.order - b.order)
    .forEach((workspace) => {
      template[4].submenu.push({
        label: workspace.name || `Workspace ${workspace.order + 1}`,
        type: 'checkbox',
        checked: workspace.active,
        click: () => {
          setActiveWorkspaceView(workspace.id);
          createMenu();
        },
        accelerator: `CmdOrCtrl+${workspace.order + 1}`,
      });
    });

  template[4].submenu.push(
    { type: 'separator' },
    {
      label: 'Select Next Workspace',
      click: () => {
        const currentActiveWorkspace = getActiveWorkspace();
        const nextWorkspace = getNextWorkspace(currentActiveWorkspace.id);
        setActiveWorkspaceView(nextWorkspace.id);
        createMenu();
      },
      accelerator: 'CmdOrCtrl+Shift+]',
    },
    {
      label: 'Select Previous Workspace',
      click: () => {
        const currentActiveWorkspace = getActiveWorkspace();
        const nextWorkspace = getPreviousWorkspace(currentActiveWorkspace.id);
        setActiveWorkspaceView(nextWorkspace.id);
        createMenu();
      },
      accelerator: 'CmdOrCtrl+Shift+[',
    },
    { type: 'separator' },
    {
      label: 'Add Workspace',
      enabled: countWorkspaces() < 9,
      click: () => {
        createWorkspaceView();
        createMenu();
      },
    },
  );

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = createMenu;
