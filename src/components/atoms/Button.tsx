import React, { ButtonHTMLAttributes, FC } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const variantClass = styles[variant] || styles.primary;
  const fullWidthClass = fullWidth ? styles.fullWidth : '';

  return (
    <button
      className={`${styles.button} ${variantClass} ${fullWidthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
