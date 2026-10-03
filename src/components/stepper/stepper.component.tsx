export const Stepper = ({
  max,
  min = 0,
  onChange,
  step = 5,
  unit,
  value,
}: {
  value: number;
  onChange: (v: number) => void;
  unit: string;
  step?: number;
  min?: number;
  max?: number;
}) => {
  const display =
    Number.isInteger(step) && Number.isInteger(value)
      ? String(value)
      : value.toFixed(step < 1 ? 1 : 0);

  const handleDecrement = () => {
    const next = Math.round((value - step) * 10) / 10;
    onChange(Math.max(min, next));
  };

  const handleIncrement = () => {
    const next = Math.round((value + step) * 10) / 10;
    onChange(max === undefined ? next : Math.min(max, next));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90"
        style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
        type="button"
        onClick={handleDecrement}>
        −
      </button>
      <span className="font-900 text-base text-center" style={{ minWidth: 52 }}>
        {display}
        <span className="text-xs font-700 ml-1" style={{ color: '#555' }}>
          {unit}
        </span>
      </span>
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90"
        style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
        type="button"
        onClick={handleIncrement}>
        +
      </button>
    </div>
  );
};

Stepper.displayName = 'Stepper';
