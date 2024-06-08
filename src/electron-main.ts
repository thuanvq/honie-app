import axios from 'axios';
import { BrowserWindow, Menu, app, screen as electronScreen, globalShortcut, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
});

let mainWindow: BrowserWindow | null;
let loginWindow: BrowserWindow | null;
function createLoginWindow() {
  if (mainWindow) {
    mainWindow.close();
  }

  loginWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'login.html'),
    protocol: 'file:',
    slashes: true,
  });

  loginWindow.loadURL(startUrl);
  // Menu.setApplicationMenu(Menu.buildFromTemplate([]));
}

async function createMenu() {
  try {
    const response = await axios.get('http://localhost:3000/app/template');
    const templates = response.data;

    const menuTemplate = templates.map((template) => ({
      label: template.label,
      submenu: template.submenu.map((submenu) => ({
        label: submenu.label,
        click: () => {
          mainWindow?.loadURL(
            url.format({
              pathname: path.join(__dirname, '..', 'src', 'frontend', 'list.html'),
              protocol: 'file:',
              slashes: true,
              search: `?apiEndpoint=${encodeURIComponent(submenu.apiEndpoint)}`,
            }),
          );
        },
      })),
    }));
    menuTemplate.unshift({
      label: 'Dashboard',
      click: () => {
        mainWindow?.loadURL(
          url.format({
            pathname: path.join(__dirname, '..', 'src', 'frontend', 'dashboard', 'dashboard.html'),
            protocol: 'file:',
            slashes: true,
          }),
        );
      },
    });
    menuTemplate.unshift({
      label: 'App',
      submenu: [
        {
          label: 'Logout',
          click: () => {
            createLoginWindow();
          },
        },
        {
          label: 'Exit',
          click: () => {
            app.quit();
          },
        },
      ],
    });
    menuTemplate.push({
      label: 'Tools',
      submenu: [
        {
          label: 'DevTools',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              if (focusedWindow.webContents.isDevToolsOpened()) {
                focusedWindow.webContents.closeDevTools();
              } else {
                focusedWindow.webContents.openDevTools();
              }
            }
          },
        },
        {
          label: 'Fetch Adsense Information',
          click: () => createRefetchWindow(''),
        },
        {
          label: 'Proxy Checker',
          click: () => {
            mainWindow?.loadURL(
              url.format({
                pathname: path.join(__dirname, '..', 'src', 'frontend', 'proxy-checker.html'),
                protocol: 'file:',
                slashes: true,
              }),
            );
          },
        },
      ],
    });

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  } catch (error) {
    console.error('Failed to fetch menu template:', error);
  }
}

async function createWindow() {
  const { width, height } = electronScreen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'dashboard', 'dashboard.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);
  createMenu().catch((error) => console.error('Failed to create menu:', error));

  mainWindow.webContents.on('new-window' as any, (event, externalUrl) => {
    event.preventDefault();
    shell.openExternal(externalUrl);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createAdsenseWindow(pid: string) {
  let adsenseWindow: BrowserWindow | null = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const detailUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-detail', 'adsense-detail.html'),
    protocol: 'file:',
    slashes: true,
    search: `?pid=${pid}`,
  });

  adsenseWindow.loadURL(detailUrl);

  adsenseWindow.on('closed', () => {
    adsenseWindow = null;
  });
}

ipcMain.on('open-adsense', (event, pid) => {
  createAdsenseWindow(pid);
});

function createFormWindow(key: string) {
  let formWindow: BrowserWindow | null = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const detailUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'form.html'),
    protocol: 'file:',
    slashes: true,
    search: `?key=${key}`,
  });

  formWindow.loadURL(detailUrl);

  formWindow.on('closed', () => {
    formWindow = null;
  });
}

ipcMain.on('open-form', (event, key) => {
  createFormWindow(key);
});

function createEmailWindow(id: string) {
  let emailWindow: BrowserWindow | null = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const detailUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'email.html'),
    protocol: 'file:',
    slashes: true,
    search: `?id=${id}`,
  });

  emailWindow.loadURL(detailUrl);

  emailWindow.on('closed', () => {
    emailWindow = null;
  });
}

ipcMain.on('open-email', (event, id) => {
  createEmailWindow(id);
});
function createRefetchWindow(pid: string) {
  let refetchWindow: BrowserWindow | null = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const detailUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'adsense-detail', 'refetch.html'),
    protocol: 'file:',
    slashes: true,
    search: `?pid=${pid}`,
  });

  refetchWindow.loadURL(detailUrl);

  refetchWindow.on('closed', () => {
    refetchWindow = null;
  });
}

ipcMain.on('open-refetch-window', (event, pid) => {
  createRefetchWindow(pid);
});

async function createWebViewWindow(siteUrl) {
  let webViewWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
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

async function waitForBackend() {
  while (true) {
    try {
      await axios.get('http://localhost:3000/app/health-check');
      break;
    } catch (error) {
      console.log('Waiting for backend to be ready...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
app.on('ready', async () => {
  await waitForBackend();
  createWindow();
  createMenu().catch((error) => console.error('Failed to create menu:', error));
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
