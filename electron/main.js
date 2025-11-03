const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

require('@electron/remote/main').initialize();

// Исправление пути к ICU данным для упакованного приложения
if (process.env.NODE_ENV === 'production' || app.isPackaged) {
    // Устанавливаем путь к ресурсам Electron
    // const appPath = app.getAppPath();
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
    
    // Для Windows, когда приложение упаковано
    if (process.platform === 'win32') {
        const basePath = path.dirname(app.getPath('exe'));
        app.setPath('userData', path.join(basePath, 'userData'));
    }
}

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