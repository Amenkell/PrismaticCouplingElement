import React, {useEffect, useRef, useCallback} from 'react';
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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

    // Close on Escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        } else if (e.key === 'Tab' && containerRef.current) {
            // Simple focus trap
            const focusable = containerRef.current.querySelectorAll<HTMLElement>(
                'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const isShift = (e as KeyboardEvent).shiftKey;
            const active = document.activeElement as HTMLElement | null;
            if (!isShift && active === last) {
                e.preventDefault();
                first.focus();
            } else if (isShift && active === first) {
                e.preventDefault();
                last.focus();
            }
        }
    }, [onClose]);

    useEffect(() => {
        if (!open) return;

        // Body scroll lock with guard for SSR
        if (typeof document !== 'undefined' && document.body) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            // Focus management
            const timer = window.setTimeout(() => {
                if (confirmBtnRef.current) {
                    confirmBtnRef.current.focus();
                } else if (containerRef.current) {
                    containerRef.current.focus();
                }
            }, 0);

            // Keydown listener
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.clearTimeout(timer);
                document.body.style.overflow = prevOverflow;
            };
        }
    }, [open, handleKeyDown]);

    if (!open) return null;

    if (typeof document === 'undefined') return null;

    const headerId = title ? 'modal-alert-title' : undefined;

    const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (e.currentTarget === e.target) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        (
            <div className="modal-alert__backdrop" onClick={handleBackdropClick}>
                <div
                    className="modal-alert__container"
                    ref={containerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={headerId}
                    tabIndex={-1}
                    onClick={(e) => e.stopPropagation()}
                >
                    {title && <div id={headerId} className="modal-alert__header">{title}</div>}
                    <div className="modal-alert__content">{message}</div>
                    <div className="modal-alert__footer">
                        <button
                            className="modal-alert__button"
                            type="button"
                            ref={confirmBtnRef}
                            onClick={onClose}
                        >{confirmText}</button>
                    </div>
                </div>
            </div>
        ),
        document.body
    );
};

export default ModalAlert;


