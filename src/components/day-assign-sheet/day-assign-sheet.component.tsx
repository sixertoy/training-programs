import cn from 'classnames';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { IconCouch, IconPlus } from '../../assets/icons';
import { resolveRoutePath } from '../../config';
import { circuitDurationMin } from '../../helpers';
import type { Circuit, DayProgram } from '../../interfaces';
import { DAY_DATES, DAY_LABELS } from '../../mocks';
import ui from '../../styles/ui.module.scss';
import styles from './day-assign-sheet.module.scss';

interface DayAssignSheetProps {
  circuits: Circuit[];
  day: DayProgram;
  dayIndex: number;
  onAssign: (d: DayProgram) => void;
  onClose: () => void;
}

function CheckMark() {
  return (
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
  );
}

export function DayAssignSheet({
  circuits,
  day,
  dayIndex,
  onAssign,
  onClose,
}: DayAssignSheetProps) {
  return (
    <div
      className={cn('absolute inset-0 flex flex-col justify-end', ui.overlay)}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className={cn('rounded-t-3xl px-5 pt-5 pb-8', ui.sheetPanel, styles.sheet)}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-900 text-lg">{DAY_LABELS[dayIndex]}</p>
            <p className={cn('text-xs font-700 mt-0.5', ui.textDim)}>
              {DAY_DATES[dayIndex]} sept. 2026
            </p>
          </div>
          <button
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900',
              ui.roundButtonSecondary,
            )}
            onClick={onClose}>
            ×
          </button>
        </div>

        <button
          className={cn(
            'w-full flex items-center gap-4 rounded-2xl px-4 py-3 mb-3 transition-all active:opacity-70',
            day.isRest ? styles.restButtonActive : styles.restButtonDefault,
          )}
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
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center',
                ui.accentCheckBadge,
              )}>
              <CheckMark />
            </span>
          )}
        </button>

        <div className={cn('space-y-2 overflow-y-auto', styles.circuitList)}>
          {circuits.map((c) => {
            const selected = !day.isRest && day.circuitId === c.id;
            const rowStyle = { '--row-color': c.color } as CSSProperties;
            return (
              <button
                key={c.id}
                className={cn(
                  'w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all active:opacity-70',
                  selected ? styles.selectableRowSelected : styles.selectableRow,
                )}
                style={rowStyle}
                onClick={() => {
                  onAssign({
                    ...day,
                    circuit: c.name,
                    circuitId: c.id,
                    exercises: c.exerciseIds.length,
                    isRest: false,
                  });
                }}>
                <div className={cn('w-3 h-3 rounded-full shrink-0', styles.colorDot)} />
                <div className="flex-1 text-left">
                  <p className="font-800 text-sm">{c.name}</p>
                  <p className={cn('text-xs font-600 mt-0.5', ui.textDim)}>
                    {c.exerciseIds.length} exo · {c.rounds} rounds · {c.cycles} cycles · ~
                    {circuitDurationMin(c)} min
                  </p>
                </div>
                {selected && (
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                      styles.checkBadge,
                    )}>
                    <CheckMark />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Link
          className={cn(
            'w-full mt-3 rounded-2xl py-3 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95 no-underline',
            ui.accentDashedAction,
          )}
          to={resolveRoutePath('create-circuit')}>
          <IconPlus /> Nouveau circuit
        </Link>
      </div>
    </div>
  );
}
