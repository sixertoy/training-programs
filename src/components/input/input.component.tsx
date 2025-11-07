import React, { useId } from 'react';

import styles from './input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.memo(({ className, error, id, label, ...props }: InputProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`${styles.input} ${error ? styles.error : ''} ${className || ''}`}
        id={inputId}
        {...props}
      />
      {error && (
        <span className={styles.errorMessage} id={`${inputId}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
