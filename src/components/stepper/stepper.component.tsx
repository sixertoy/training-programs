import cn from 'classnames';
import { useCallback } from 'react';

import styles from './stepper.module.scss';

interface StepperProps {
  min?: number;
  onChange: (v: number) => void;
  step?: number;
  unit: string;
  value: number;
}

export function Stepper({ min = 0, onChange, step = 5, unit, value }: StepperProps) {
  const handleMinus = useCallback(() => {
    onChange(Math.max(min, value - step));
  }, [min, onChange, step, value]);

  const handlePlus = useCallback(() => {
    onChange(value + step);
  }, [onChange, step, value]);

  return (
    <div className="flex items-center gap-2">
      <button
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90',
          styles.control,
        )}
        onClick={handleMinus}>
        −
      </button>
      <span className={cn('font-900 text-base text-center', styles.value)}>
        {value}
        <span className={cn('text-xs font-700 ml-1', styles.unit)}>{unit}</span>
      </span>
      <button
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90',
          styles.control,
        )}
        onClick={handlePlus}>
        +
      </button>
    </div>
  );
}
