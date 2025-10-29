import React, {memo, useId} from 'react';
import './button-style.css';
import {ButtonProps, buttonSizes, buttonTypes, buttonVariants} from "./button.interface";

const CustomButton: React.FC<ButtonProps> = ({
                                           children,
                                           onClick,
                                           type = buttonTypes.button,
                                           variant = buttonVariants.primary,
                                           size = buttonSizes.medium,
                                           disabled = false,
                                           loading = false,
                                           className = '',
                                           fullWidth = false,
                                       }) => {

    const id = useId();

    const buttonClasses = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        disabled && 'btn--disabled',
        loading && 'btn--loading',
        fullWidth && 'btn--full-width',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            id={id}
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading && <span className="btn__spinner">⏳</span>}
            {children}
        </button>
    );
};

export default memo(CustomButton);