import { useState, useEffect } from 'react';
import {UpdateStatus} from "../models/update.interface.ts";

declare global {
    interface Window {
        require?: (module: string) => any;
    }
}

const getIpcRenderer = () => {
    if (typeof window !== 'undefined' && window.require) {
        const electron = window.require('electron');
        return electron?.ipcRenderer || null;
    }
    return null;
};

const ipcRenderer = getIpcRenderer();

export const useAutoUpdater = () => {
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
        isChecking: true, // Начинаем с проверки, чтобы показывать оверлей сразу
        isDownloading: false,
        isInstalling: false,
    });
    const [checkCompleted, setCheckCompleted] = useState(false);

    useEffect(() => {
        if (!ipcRenderer) {
            // Если не в Electron окружении, сразу помечаем проверку как завершенную
            setCheckCompleted(true);
            setUpdateStatus({
                isChecking: false,
                isDownloading: false,
                isInstalling: false,
            });
            return;
        }

        // Таймаут на случай, если проверка не начнется в течение 10 секунд
        const timeoutId = setTimeout(() => {
            setCheckCompleted(prev => {
                if (!prev) {
                    setUpdateStatus(prevStatus => {
                        if (prevStatus.isChecking) {
                            return {
                                ...prevStatus,
                                isChecking: false,
                            };
                        }
                        return prevStatus;
                    });
                    return true;
                }
                return prev;
            });
        }, 10000);

        const handleChecking = () => {
            setUpdateStatus({
                isChecking: true,
                isDownloading: false,
                isInstalling: false,
            });
        };

        const handleAvailable = (info: { version: string; isDelta?: boolean; packageType?: 'delta' | 'full' }) => {
            console.log('Update available, starting download:', info.version);
            console.log('Package type:', info.packageType || (info.isDelta ? 'delta' : 'full'));
            setUpdateStatus(prev => {
                console.log('Setting download state, prev:', prev);
                return {
                    isChecking: false,
                    isDownloading: true,
                    isInstalling: false,
                    version: info.version,
                    error: undefined, // Очищаем предыдущие ошибки
                    packageType: info.packageType || (info.isDelta ? 'delta' : 'full'),
                    isDelta: info.isDelta,
                };
            });
        };

        const handleNotAvailable = () => {
            setUpdateStatus({
                isChecking: false,
                isDownloading: false,
                isInstalling: false,
            });
            setCheckCompleted(true);
        };

        const handleError = (_event: any, message: string) => {
            console.error('Update error:', message);
            setUpdateStatus(prev => {
                const wasDownloading = prev.isDownloading;
                // Помечаем проверку как завершенную только если не было скачивания
                // Если было скачивание, ошибка может быть временной
                if (!wasDownloading) {
                    setCheckCompleted(true);
                }
                return {
                    ...prev,
                    isChecking: false,
                    isDownloading: false,
                    isInstalling: false,
                    error: message,
                };
            });
        };

        const handleProgress = (_event: any, progressObj: {
            percent: number;
            transferred: number;
            total: number;
            bytesPerSecond: number;
        }) => {
            console.log('Download progress:', progressObj.percent + '%');
            setUpdateStatus(prev => {
                // Убеждаемся, что isDownloading установлен
                if (!prev.isDownloading) {
                    console.warn('Received download-progress but isDownloading was false');
                }
                return {
                    ...prev,
                    isDownloading: true, // Убеждаемся, что флаг установлен
                    progress: progressObj,
                };
            });
        };

        const handleDownloaded = (_event: any, info: { version: string }) => {
            setUpdateStatus(prev => ({
                ...prev,
                isDownloading: false,
                isInstalling: true,
                version: info.version,
            }));
        };

        ipcRenderer.on('update-checking', handleChecking);
        ipcRenderer.on('update-available', handleAvailable);
        ipcRenderer.on('update-not-available', handleNotAvailable);
        ipcRenderer.on('update-error', handleError);
        ipcRenderer.on('update-progress', handleProgress);
        ipcRenderer.on('update-downloaded', handleDownloaded);

        return () => {
            clearTimeout(timeoutId);
            if (ipcRenderer) {
                ipcRenderer.removeListener('update-checking', handleChecking);
                ipcRenderer.removeListener('update-available', handleAvailable);
                ipcRenderer.removeListener('update-not-available', handleNotAvailable);
                ipcRenderer.removeListener('update-error', handleError);
                ipcRenderer.removeListener('update-progress', handleProgress);
                ipcRenderer.removeListener('update-downloaded', handleDownloaded);
            }
        };
    }, []);

    const isUpdating = updateStatus.isChecking || updateStatus.isDownloading || updateStatus.isInstalling;

    // Логируем состояние для отладки
    useEffect(() => {
        console.log('Update state:', {
            isChecking: updateStatus.isChecking,
            isDownloading: updateStatus.isDownloading,
            isInstalling: updateStatus.isInstalling,
            isUpdating,
            checkCompleted,
            hasError: !!updateStatus.error,
        });
    }, [updateStatus.isChecking, updateStatus.isDownloading, updateStatus.isInstalling, isUpdating, checkCompleted, updateStatus.error]);

    return {
        updateStatus,
        isUpdating,
        checkCompleted,
    };
};

