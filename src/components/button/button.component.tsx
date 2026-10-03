import type { ComponentType, CSSProperties } from 'react';

interface ButtonProps {
  className?: string;
  disabled?: boolean;
  icon?: ComponentType;
  label?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export const Button = ({ className, disabled, icon: Icon, label, onClick, style }: ButtonProps) => {
  return (
    <button
      className={['inline-flex items-center justify-center gap-2', className]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      style={style}
      type="button"
      onClick={onClick}>
      {Icon ? <Icon /> : null}
      {label}
    </button>
  );
};

Button.displayName = 'Button';
