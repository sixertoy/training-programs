import { useRef } from 'react';

import { IconPlus } from './assets/icons';

const ACCENT_PRESETS = ['#CBFF47', '#FF6B35', '#4ECDC4', '#A78BFA', '#FF6B6B'] as const;

interface AccentColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function AccentColorPicker({ onChange, value }: AccentColorPickerProps) {
  const customColorRef = useRef<HTMLInputElement>(null);
  const normalized = value.toUpperCase();
  const isCustom = !(ACCENT_PRESETS as readonly string[]).includes(normalized);

  return (
    <div className="flex gap-3 flex-wrap items-center">
      <button
        aria-label="Custom color"
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          backgroundColor: isCustom ? value : '#2a2a2a',
          border: isCustom ? '3px solid #fff' : '3px solid transparent',
          color: isCustom ? '#0d0d0d' : '#888',
          transform: isCustom ? 'scale(1.15)' : 'scale(1)',
        }}
        onClick={() => {
          customColorRef.current?.click();
        }}>
        {!isCustom && <IconPlus />}
      </button>
      <input
        ref={customColorRef}
        aria-hidden
        className="sr-only"
        tabIndex={-1}
        type="color"
        value={normalized.toLowerCase()}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase());
        }}
      />
      {ACCENT_PRESETS.map((c) => (
        <button
          key={c}
          aria-label={`Accent ${c}`}
          className="w-10 h-10 rounded-full transition-all active:scale-90"
          style={{
            backgroundColor: c,
            border: normalized === c ? '3px solid #fff' : '3px solid transparent',
            transform: normalized === c ? 'scale(1.15)' : 'scale(1)',
          }}
          onClick={() => {
            onChange(c);
          }}
        />
      ))}
    </div>
  );
}
