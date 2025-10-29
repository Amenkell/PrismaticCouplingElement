import React from "react";

export interface ButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: ButtonType;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    fullWidth?: boolean;
}

export const buttonTypes = {
    button: 'button',
    submit: 'submit',
    reset: 'reset'
} as const;

export type ButtonType = typeof buttonTypes[keyof typeof buttonTypes];

export const buttonVariants = {
    primary: 'primary',
    secondary: 'secondary',
    danger: 'danger',
    success: 'success'
} as const;

export type ButtonVariant = typeof buttonVariants[keyof typeof buttonVariants];

export const buttonSizes = {
    small: 'small',
    medium: 'medium',
    large: 'large'
} as const;

export type ButtonSize = typeof buttonSizes[keyof typeof buttonSizes];