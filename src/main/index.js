'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  var window;
  if (process.platform != 'darwin') {
    window = new BrowserWindow({
      backgroundColor: '#171920',
      width: 610, 
      minWidth: 400,
      height: 480,
      minHeight: 155,
      frame: false,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
  
    window.removeMenu()
  }

  window = new BrowserWindow({
    backgroundColor: '#171920',
    width: 610, 
    minWidth: 400,
    height: 480,
    minHeight: 155,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  if (isDevelopment) {
    //window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

ipcMain.on('windowController', (event, arg) => {
  if (arg == 'close') mainWindow.close();
  if (arg == 'minimize') mainWindow.minimize();
  if (arg == 'maximize') {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  };
  if (arg == 'fullscreen') mainWindow.maximize();
  console.log(arg)
})

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';