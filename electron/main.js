const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const isDev = process.env.NODE_ENV === 'development';

// Исправление ICU проблемы для упакованных приложений
app.commandLine.appendSwitch('--disable-icu-data-url');

require('@electron/remote/main').initialize();

// Отключаем предупреждения безопасности в production
if (!isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1300,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModules: true,
            contextIsolation: false
        }
    });

    // Правильная загрузка в зависимости от режима
    if (isDev) {
        // В разработке используем dev server
        const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
        mainWindow.loadURL(startUrl);
        // mainWindow.webContents.openDevTools(); // для отладки
    } else {
        // В production загружаем из упакованного приложения
        const startUrl = url.format({
            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file:',
            slashes: true,
        });
        mainWindow.loadURL(startUrl);
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});