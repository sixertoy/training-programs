import { useCallback } from 'react';

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
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90"
        style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
        onClick={handleMinus}>
        −
      </button>
      <span className="font-900 text-base text-center" style={{ minWidth: 52 }}>
        {value}
        <span className="text-xs font-700 ml-1" style={{ color: '#555' }}>
          {unit}
        </span>
      </span>
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90"
        style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
        onClick={handlePlus}>
        +
      </button>
    </div>
  );
}
