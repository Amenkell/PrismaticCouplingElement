const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

require('@electron/remote/main').initialize();

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1300,
        height: 800,
        webPreferences: {
            nodeIntegration: true ,
            enableRemoteModules: true
        }
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: 'file:',
        slashes: true,
    });

    mainWindow.loadURL(startUrl);

    // mainWindow.webContents.openDevTools(); // для отладки
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});