const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const electronScreen = require('electron').screen;
const path = require('path');
const url = require('url');

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
});

let mainWindow;

function createWindow() {
  const { width, height } = electronScreen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createDetailWindow(pid) {
  let detailWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const detailUrl = url.format({
    pathname: path.join(
      __dirname,
      '..',
      'src',
      'frontend',
      'adsense-detail.html',
    ),
    protocol: 'file:',
    slashes: true,
    search: `?pid=${pid}`,
  });

  detailWindow.loadURL(detailUrl);

  detailWindow.on('closed', () => {
    detailWindow = null;
  });
}

ipcMain.on('open-detail-window', (event, pid) => {
  createDetailWindow(pid);
});

app.on('ready', () => {
  createWindow();

  const template = [
    {
      label: 'App',
      submenu: [
        {
          label: 'About MyApp',
          click: () => {
            console.log('About Menu Item Clicked');
          },
        },
      ],
    },
    {
      label: 'Adsense',
      submenu: [
        {
          label: 'List All',
          click: () => {
            mainWindow.loadURL(
              url.format({
                pathname: path.join(
                  __dirname,
                  '..',
                  'src',
                  'frontend',
                  'adsense.html',
                ),
                protocol: 'file:',
                slashes: true,
              }),
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
