const { app, BrowserWindow, Menu } = require('electron');
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
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
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

  createWindow();
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
