import React, {memo} from 'react';
import './icon-button.css';

export interface IconButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
    ariaLabel?: string;
    className?: string;
    variant?: 'delete' | 'edit' | 'default';
    children: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({
    onClick,
    disabled = false,
    title,
    ariaLabel,
    className = '',
    variant = 'default',
    children
}) => {
    const buttonClasses = [
        'icon-button',
        `icon-button--${variant}`,
        disabled && 'icon-button--disabled',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={ariaLabel || title}
            type="button"
        >
            {children}
        </button>
    );
};

export default memo(IconButton);

