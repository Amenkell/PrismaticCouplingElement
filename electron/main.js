const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const isDev = process.env.NODE_ENV === 'development';

require('@electron/remote/main').initialize();

// Настройка автообновления
if (!isDev) {
  // Настройка автоматической загрузки и установки (используем свойства, не методы)
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
        mainWindow.webContents.openDevTools(); // для отладки
    } else {
        // В production загружаем из упакованного приложения
        const startUrl = url.format({
            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file:',
            slashes: true,
        });
        mainWindow.loadURL(startUrl);
        // В production можно открыть DevTools нажатием F12 или Ctrl+Shift+I
        // mainWindow.webContents.openDevTools(); // раскомментируйте для отладки в production
    }

    // Горячие клавиши для открытия DevTools (F12 или Ctrl+Shift+I)
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
            mainWindow.webContents.toggleDevTools();
        }
    });

    // Проверка обновлений после загрузки окна
    if (!isDev) {
        mainWindow.webContents.once('did-finish-load', () => {
            checkForUpdates();
        });
    }
}

// Функция проверки обновлений
function checkForUpdates() {
    // if (isDev) {
    //     return;
    // }

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
    console.log('Update info:', JSON.stringify(info, null, 2));
    // Определяем тип пакета: если есть files с delta, значит это дифференциальное обновление
    const isDelta = info.files && info.files.some(file => file.url && file.url.includes('-delta'));
    const updateInfo = {
        ...info,
        isDelta: isDelta,
        packageType: isDelta ? 'delta' : 'full'
    };
    if (mainWindow) {
        mainWindow.webContents.send('update-available', updateInfo);
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
    
    // Автоматически перезапустить после загрузки в silent режиме
    setTimeout(() => {
        console.log('Installing update in silent mode and restarting...');
        try {
            autoUpdater.quitAndInstall(true, true);
        } catch (error) {
            console.error('Error during quitAndInstall:', error);
            if (mainWindow) {
                mainWindow.webContents.send('update-error', 'Ошибка при установке обновления: ' + error.message);
            }
        }
    }, 2000);
});

// IPC обработчики для проверки обновлений из рендерера
ipcMain.on('check-for-updates', () => {
    checkForUpdates();
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall(false, true);
});

// IPC обработчик для получения версии приложения
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});