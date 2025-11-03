import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import './modal-alert.css';

export interface ModalAlertProps {
    open: boolean;
    title?: React.ReactNode;
    message: React.ReactNode;
    onClose: () => void;
    confirmText?: React.ReactNode;
}

const ModalAlert: React.FC<ModalAlertProps> = ({ open, title, message, onClose, confirmText = 'ОК' }) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return ReactDOM.createPortal(
        (
            <div className="modal-alert__backdrop" onClick={onClose}>
                <div className="modal-alert__container" onClick={(e) => e.stopPropagation()}>
                    {title && <div className="modal-alert__header">{title}</div>}
                    <div className="modal-alert__content">{message}</div>
                    <div className="modal-alert__footer">
                        <button className="modal-alert__button" onClick={onClose}>{confirmText}</button>
                    </div>
                </div>
            </div>
        ),
        document.body
    );
};

export default ModalAlert;


