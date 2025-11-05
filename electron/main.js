const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
const isDev = process.env.NODE_ENV === 'development';

require('@electron/remote/main').initialize();

// Настройка автообновления
if (!isDev) {
    // Настройка автоматической загрузки и установки
  autoUpdater.setAutoDownload(true);
  autoUpdater.setAutoInstallOnAppQuit(true);

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
}

// Отключаем предупреждения безопасности в production
if (!isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
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

    // Проверка обновлений после загрузки окна
    if (!isDev) {
        mainWindow.webContents.once('did-finish-load', () => {
            checkForUpdates();
        });
    }
}

// Функция проверки обновлений
function checkForUpdates() {
    if (isDev) {
        return;
    }

    autoUpdater.checkForUpdates().catch(err => {
        console.error('Error checking for updates:', err);
    });
}

// Обработчики событий автообновления
autoUpdater.on('checking-for-update', () => {
    if (mainWindow) {
        mainWindow.webContents.send('update-checking');
    }
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-available', info);
    }
});

autoUpdater.on('update-not-available', () => {
    console.log('Update not available');
    if (mainWindow) {
        mainWindow.webContents.send('update-not-available');
    }
});

autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater:', err);
    if (mainWindow) {
        mainWindow.webContents.send('update-error', err.message);
    }
});

autoUpdater.on('download-progress', (progressObj) => {
    const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    console.log(message);
    if (mainWindow) {
        mainWindow.webContents.send('update-progress', progressObj);
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded', info);
    }
    
    // Автоматически перезапустить после загрузки
    setTimeout(() => {
        autoUpdater.quitAndInstall(false, true);
    }, 1000);
});

// IPC обработчики для проверки обновлений из рендерера
ipcMain.on('check-for-updates', () => {
    checkForUpdates();
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall(false, true);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});