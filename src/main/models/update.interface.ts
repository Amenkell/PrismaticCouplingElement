export interface UpdateStatus {
    isChecking: boolean;
    isDownloading: boolean;
    isInstalling: boolean;
    progress?: {
        percent: number;
        transferred: number;
        total: number;
        bytesPerSecond: number;
    };
    version?: string;
    error?: string;
}

export interface UpdateOverlayProps {
    status: UpdateStatus;
}