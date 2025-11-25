const DEFAULT_VERSION = '0.4.0';

export const getAppVersion = (): string => {
    if (typeof window !== 'undefined') {
        const electron = (window as any).require?.('electron');
        if (electron?.remote?.app) {
            return electron.remote.app.getVersion();
        }
    }
    return DEFAULT_VERSION;
};

// Асинхронное получение версии (для обновления после IPC)
export const getAppVersionAsync = async (): Promise<string> => {
    if (typeof window !== 'undefined') {
        const electron = (window as any).require?.('electron');
        if (electron?.ipcRenderer) {
            // Используем IPC для получения версии из main процесса
            const version = await electron.ipcRenderer.invoke('get-app-version');
            if (version) {
                return version;
            }
        }
        // Если IPC не работает, пробуем remote
        if (electron?.remote?.app) {
            return electron.remote.app.getVersion();
        }
    }
    return getAppVersion();
};

