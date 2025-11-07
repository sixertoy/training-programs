import React, { useId } from 'react';

import styles from './select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.memo(
  ({ className, error, id, label, options, ...props }: SelectProps) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={styles.container}>
        {label && (
          <label className={styles.label} htmlFor={selectId}>
            {label}
          </label>
        )}
        <select
          aria-describedby={error ? `${selectId}-error` : undefined}
          aria-invalid={error ? 'true' : 'false'}
          className={`${styles.select} ${error ? styles.error : ''} ${className || ''}`}
          id={selectId}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className={styles.errorMessage} id={`${selectId}-error`} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
