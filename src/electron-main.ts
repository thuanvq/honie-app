import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
});

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, '..', 'src', 'frontend', 'index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null!;
  });
}

app.on('ready', createWindow);

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
