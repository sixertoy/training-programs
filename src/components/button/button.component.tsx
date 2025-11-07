import React from 'react';

import styles from './button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Button = React.memo(
  ({ children, className, size = 'medium', variant = 'primary', ...props }: ButtonProps) => {
    return (
      <button
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${className || ''}`}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
