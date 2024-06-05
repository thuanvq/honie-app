import { BrowserWindow, Menu, app, screen as electronScreen, globalShortcut, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
});

let mainWindow: BrowserWindow | null;

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
  //   mainWindow.webContents.openDevTools();

  mainWindow.webContents.on('new-window' as any, (event, externalUrl) => {
    event.preventDefault();
    shell.openExternal(externalUrl);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createDetailWindow(pid: string) {
  let detailWindow: BrowserWindow | null = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const detailUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-detail.html'),
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
  setTimeout(() => createWindow(), 2000);

  // Register global shortcuts
  const registerShortcuts = () => {
    globalShortcut.register('F12', () => {
      if (mainWindow && mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else if (mainWindow) {
        mainWindow.webContents.openDevTools();
      }
    });

    globalShortcut.register('Ctrl+Shift+I', () => {
      if (mainWindow && mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else if (mainWindow) {
        mainWindow.webContents.openDevTools();
      }
    });
  };

  registerShortcuts();

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
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense.html'),
                protocol: 'file:',
                slashes: true,
              }),
            );
          },
        },
        {
          label: 'Error',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-error.html'),
                protocol: 'file:',
                slashes: true,
              }),
            );
          },
        },
        {
          label: 'Unused',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-unused.html'),
                protocol: 'file:',
                slashes: true,
              }),
            );
          },
        },
      ],
    },
    {
      label: 'Websites',
      submenu: [
        {
          label: 'Ready',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'websites.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Ready`,
              }),
            );
          },
        },
        {
          label: 'Getting ready',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'websites.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Getting ready`,
              }),
            );
          },
        },
        {
          label: 'Needs attention',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'websites.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Needs attention`,
              }),
            );
          },
        },
        {
          label: 'Requires review',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'websites.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Requires review`,
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

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
