import { IconCouch, IconPlus } from '../../assets/icons';
import { circuitDurationMin, withAlpha } from '../../helpers';
import type { Circuit, DayProgram } from '../../interfaces';
import { DAY_DATES, DAY_LABELS } from '../../mocks';

interface DayAssignSheetProps {
  accent: string;
  circuits: Circuit[];
  day: DayProgram;
  dayIndex: number;
  onAssign: (d: DayProgram) => void;
  onCreateCircuit: () => void;
  onClose: () => void;
}

export function DayAssignSheet({
  accent,
  circuits,
  day,
  dayIndex,
  onAssign,
  onClose,
  onCreateCircuit,
}: DayAssignSheetProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col justify-end"
      style={{ backgroundColor: '#00000085', zIndex: 50 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div
        className="rounded-t-3xl px-5 pt-5 pb-8"
        style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '75%' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-900 text-lg">{DAY_LABELS[dayIndex]}</p>
            <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
              {DAY_DATES[dayIndex]} sept. 2026
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900"
            style={{ backgroundColor: '#2a2a2a', color: '#888' }}
            onClick={onClose}>
            ×
          </button>
        </div>

        <button
          className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 mb-3 transition-all active:opacity-70"
          style={{
            backgroundColor: day.isRest ? '#2a2a2a' : '#1a1a1a',
            border: day.isRest ? `1px solid ${withAlpha(accent, 0.3)}` : '1px solid #2a2a2a',
          }}
          onClick={() => {
            onAssign({
              ...day,
              circuit: undefined,
              circuitId: undefined,
              exercises: undefined,
              isRest: true,
            });
          }}>
          <IconCouch />
          <span className="font-800 flex-1 text-left">Repos</span>
          {day.isRest && (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accent }}>
              <svg
                fill="none"
                height="10"
                stroke="#000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
                viewBox="0 0 24 24"
                width="10">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </button>

        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 220 }}>
          {circuits.map((c) => {
            const selected = !day.isRest && day.circuitId === c.id;
            return (
              <button
                key={c.id}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all active:opacity-70"
                style={{
                  backgroundColor: selected ? withAlpha(c.color, 0.1) : '#1a1a1a',
                  border: selected ? `1px solid ${withAlpha(c.color, 0.4)}` : '1px solid #2a2a2a',
                }}
                onClick={() => {
                  onAssign({
                    ...day,
                    circuit: c.name,
                    circuitId: c.id,
                    exercises: c.exerciseIds.length,
                    isRest: false,
                  });
                }}>
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <div className="flex-1 text-left">
                  <p className="font-800 text-sm">{c.name}</p>
                  <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                    {c.exerciseIds.length} exo · {c.rounds} rounds · {c.cycles} cycles · ~
                    {circuitDurationMin(c)} min
                  </p>
                </div>
                {selected && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.color }}>
                    <svg
                      fill="none"
                      height="10"
                      stroke="#000"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3.5"
                      viewBox="0 0 24 24"
                      width="10">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          className="w-full mt-3 rounded-2xl py-3 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a1a',
            border: `1px dashed ${withAlpha(accent, 0.3)}`,
            color: accent,
          }}
          onClick={onCreateCircuit}>
          <IconPlus /> Nouveau circuit
        </button>
      </div>
    </div>
  );
}
