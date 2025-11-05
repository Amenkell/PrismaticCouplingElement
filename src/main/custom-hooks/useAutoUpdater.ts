import { useState, useEffect } from 'react';
import {UpdateStatus} from "../models/update.interface.ts";

declare global {
    interface Window {
        require?: (module: string) => any;
    }
}

const getIpcRenderer = () => {
    try {
        if (typeof window !== 'undefined' && window.require) {
            const electron = window.require('electron');
            return electron?.ipcRenderer || null;
        }
    } catch (e) {
        // Не в Electron окружении
    }
    return null;
};

const ipcRenderer = getIpcRenderer();

export const useAutoUpdater = () => {
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
        isChecking: false,
        isDownloading: false,
        isInstalling: false,
    });

    useEffect(() => {
        if (!ipcRenderer) {
            return;
        }

        const handleChecking = () => {
            setUpdateStatus({
                isChecking: true,
                isDownloading: false,
                isInstalling: false,
            });
        };

        const handleAvailable = (info: { version: string }) => {
            setUpdateStatus(prev => ({
                ...prev,
                isChecking: false,
                isDownloading: true,
                version: info.version,
            }));
        };

        const handleNotAvailable = () => {
            setUpdateStatus({
                isChecking: false,
                isDownloading: false,
                isInstalling: false,
            });
        };

        const handleError = (_event: any, message: string) => {
            setUpdateStatus(prev => ({
                ...prev,
                isChecking: false,
                isDownloading: false,
                isInstalling: false,
                error: message,
            }));
        };

        const handleProgress = (_event: any, progressObj: {
            percent: number;
            transferred: number;
            total: number;
            bytesPerSecond: number;
        }) => {
            setUpdateStatus(prev => ({
                ...prev,
                progress: progressObj,
            }));
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

    return {
        updateStatus,
        isUpdating,
    };
};

