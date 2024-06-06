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
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-using.html'),
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
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-detail', 'adsense-detail.html'),
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

function createWebViewWindow(siteUrl) {
  let webViewWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'), // Use preload script
      nodeIntegration: true,
      contextIsolation: true, // Enable context isolation
      webviewTag: true,
    },
  });

  const webViewUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'webview.html'),
    protocol: 'file:',
    slashes: true,
  });

  webViewWindow.loadURL(webViewUrl);
  webViewWindow.webContents.openDevTools();

  webViewWindow.webContents.on('did-finish-load', () => {
    webViewWindow.webContents.send('load-url', siteUrl);
  });

  webViewWindow.on('closed', () => {
    webViewWindow = null;
  });
}

ipcMain.on('open-webview', (event, siteUrl) => {
  createWebViewWindow(siteUrl);
});

app.on('ready', () => {
  setTimeout(() => createWindow(), 2000);

  // Register global shortcuts
  const registerShortcuts = () => {
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
          label: 'Using',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-using.html'),
                protocol: 'file:',
                slashes: true,
              }),
            );
          },
        },
        {
          label: 'Pantip.com',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-pantip.html'),
                protocol: 'file:',
                slashes: true,
              }),
            );
          },
        },
        {
          label: 'Wordpress',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-wordpress.html'),
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
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'website-ready.html'),
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
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'website-getting.html'),
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
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'website-attention.html'),
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
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'website-review.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Requires review`,
              }),
            );
          },
        },
      ],
    },
    {
      label: 'Blogspot',
      submenu: [
        {
          label: 'Using',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'blogspot-using.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Ready`,
              }),
            );
          },
        },
        {
          label: 'TEMP',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'blogspot-temp.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Getting ready`,
              }),
            );
          },
        },
        {
          label: 'Unused',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'blogspot-unused.html'),
                protocol: 'file:',
                slashes: true,
                search: `?status=Needs attention`,
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
