import { app, BrowserWindow } from 'electron';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import * as url from 'url';

const electronReload = require('electron-reload');

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

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(
        __dirname,
        '..',
        '..',
        'src',
        'frontend',
        'index.html',
      ),
      protocol: 'file:',
      slashes: true,
    });

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null!;
  });
}

async function startNest() {
  const server = await NestFactory.create(AppModule);
  await server.listen(3000);
}

app.on('ready', async () => {
  // Hot Reloading
  electronReload(__dirname, {
    electron: path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      '.bin',
      'electron',
    ),
  });

  await startNest();
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
