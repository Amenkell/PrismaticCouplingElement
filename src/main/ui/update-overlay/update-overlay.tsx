import React from 'react';
import './update-overlay.css';
import {UpdateOverlayProps} from "../../models/update.interface.ts";

const UpdateOverlay: React.FC<UpdateOverlayProps> = ({ status }) => {
    const getStatusText = () => {
        if (status.error) {
            return 'Ошибка при обновлении';
        }
        if (status.isInstalling) {
            return 'Установка обновления...';
        }
        if (status.isDownloading) {
            return 'Скачивание обновления...';
        }
        if (status.isChecking) {
            return 'Проверка обновлений...';
        }
        return 'Обновление...';
    };

    const getProgressText = () => {
        if (status.progress) {
            const percent = Math.round(status.progress.percent);
            const transferredMB = (status.progress.transferred / 1024 / 1024).toFixed(2);
            const totalMB = (status.progress.total / 1024 / 1024).toFixed(2);
            const speedMBps = (status.progress.bytesPerSecond / 1024 / 1024).toFixed(2);
            
            return `${percent}% (${transferredMB} MB / ${totalMB} MB) - ${speedMBps} MB/s`;
        }
        return '';
    };

    return (
        <div className="update-overlay">
            <div className="update-overlay__content">
                <div className="update-overlay__icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <h2 className="update-overlay__title">{getStatusText()}</h2>
                {status.version && (
                    <p className="update-overlay__version">Версия {status.version}</p>
                )}
                {status.error && (
                    <p className="update-overlay__error">{status.error}</p>
                )}
                {(status.isDownloading || status.isInstalling) && (
                    <div className="update-overlay__progress-container">
                        <div className="update-overlay__progress-bar">
                            <div
                                className="update-overlay__progress-fill"
                                style={{
                                    width: `${status.progress?.percent || 0}%`
                                }}
                            />
                        </div>
                        {status.progress && (
                            <p className="update-overlay__progress-text">{getProgressText()}</p>
                        )}
                    </div>
                )}
                {status.isInstalling && (
                    <p className="update-overlay__note">Пожалуйста, подождите. Приложение будет перезапущено автоматически.</p>
                )}
            </div>
        </div>
    );
};

export default UpdateOverlay;

