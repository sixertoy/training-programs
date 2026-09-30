import { useState } from 'react';
import { Link } from 'react-router';

import { IconChevronLeft, IconChevronRight, IconCouch, IconPlay } from '../../assets/icons';
import { DayAssignSheet } from '../../components/day-assign-sheet';
import { resolveRoutePath } from '../../config';
import { TODAY_INDEX } from '../../constants/program.constants';
import { withAlpha } from '../../helpers';
import type { Circuit, DayProgram } from '../../interfaces';
import { WEEK_HISTORY } from '../../mocks';

export interface WeeklyScreenProps {
  accent: string;
  circuits: Circuit[];
  currentWeekDays: DayProgram[];
  onUpdateDay: (i: number, d: DayProgram) => void;
}

export function WeeklyScreen({
  accent,
  circuits,
  currentWeekDays,
  onUpdateDay,
}: WeeklyScreenProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [assignIndex, setAssignIndex] = useState<number | null>(null);
  const isCurrentWeek = weekOffset === 0;
  const week =
    weekOffset === 0 ? { ...WEEK_HISTORY[0], days: currentWeekDays } : WEEK_HISTORY[weekOffset];
  const todayCard = currentWeekDays[TODAY_INDEX];

  const allDayNumbers = [
    ['08', '09', '10', '11', '12', '13', '14'],
    ['01', '02', '03', '04', '05', '06', '07'],
    ['25', '26', '27', '28', '29', '30', '31'],
    ['18', '19', '20', '21', '22', '23', '24'],
    ['11', '12', '13', '14', '15', '16', '17'],
  ];
  const dayNumbers = allDayNumbers[weekOffset] ?? allDayNumbers[0];

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-3xl font-900">Programme</h1>
          <p className="text-sm mt-0.5" style={{ color: '#888' }}>
            Hebdomadaire
          </p>
        </div>

        <div
          className="mx-5 mb-4 flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
            disabled={weekOffset >= WEEK_HISTORY.length - 1}
            style={{
              backgroundColor: weekOffset >= WEEK_HISTORY.length - 1 ? '#111' : '#2a2a2a',
              color: weekOffset >= WEEK_HISTORY.length - 1 ? '#333' : '#aaa',
            }}
            onClick={() => {
              setWeekOffset((o) => Math.min(o + 1, WEEK_HISTORY.length - 1));
            }}>
            <IconChevronLeft />
          </button>
          <div className="text-center">
            <p className="font-900 text-sm" style={{ color: isCurrentWeek ? accent : '#f5f5f5' }}>
              {week.label}
            </p>
            <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
              {week.dateRange}
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
            disabled={weekOffset === 0}
            style={{
              backgroundColor: weekOffset === 0 ? '#111' : '#2a2a2a',
              color: weekOffset === 0 ? '#333' : '#aaa',
            }}
            onClick={() => {
              setWeekOffset((o) => Math.max(o - 1, 0));
            }}>
            <IconChevronRight />
          </button>
        </div>

        {!isCurrentWeek && (
          <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Séances', value: `${week.stats.sessions}` },
              { label: 'Minutes', value: `${week.stats.totalMin}` },
              { label: 'Volume', value: week.stats.volume },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <p className="text-lg font-900" style={{ color: accent }}>
                  {s.value}
                </p>
                <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {isCurrentWeek && !todayCard.isRest && (
          <div
            className="mx-5 mb-5 rounded-2xl overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)` }}>
            <div className="p-5 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-800 tracking-widest uppercase"
                  style={{ color: '#0d0d0d90' }}>
                  Aujourd'hui · Lundi
                </p>
                <h2 className="text-2xl font-900 mt-1" style={{ color: '#0d0d0d' }}>
                  {todayCard.circuit}
                </h2>
                <p className="text-sm font-700 mt-1" style={{ color: '#0d0d0d80' }}>
                  {todayCard.exercises} exercices
                </p>
              </div>
              <Link
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 no-underline"
                style={{ backgroundColor: '#0d0d0d' }}
                to={resolveRoutePath('timer')}>
                <span style={{ color: accent, marginLeft: 3 }}>
                  <IconPlay />
                </span>
              </Link>
            </div>
          </div>
        )}

        <div className="px-5 space-y-2.5 pb-6">
          {week.days.map((day, i) => {
            const isToday = isCurrentWeek && i === TODAY_INDEX;
            const isDone = !isCurrentWeek && !day.isRest;
            const tappable = isCurrentWeek && i !== TODAY_INDEX;
            return (
              <div
                key={day.day}
                className={`flex items-center gap-4 rounded-xl px-4 py-3.5 ${tappable ? 'cursor-pointer' : ''}`}
                style={{
                  backgroundColor: isToday ? '#2a2a2a' : '#1a1a1a',
                  border: isToday ? `1px solid ${withAlpha(accent, 0.25)}` : '1px solid #2a2a2a',
                  opacity: !isCurrentWeek && day.isRest ? 0.45 : 1,
                }}
                onClick={() => {
                  tappable ? setAssignIndex(i) : undefined;
                }}>
                <div className="w-10 text-center">
                  <p
                    className="text-xs font-800 tracking-wider"
                    style={{ color: isToday ? accent : isDone ? withAlpha(accent, 0.4) : '#555' }}>
                    {day.short}
                  </p>
                  <p
                    className="text-lg font-900"
                    style={{ color: isToday ? '#fff' : isDone ? '#888' : '#333' }}>
                    {dayNumbers[i]}
                  </p>
                </div>
                <div className="w-px self-stretch" style={{ backgroundColor: '#2a2a2a' }} />
                {day.isRest ? (
                  <div className="flex items-center gap-3 flex-1">
                    <IconCouch />
                    <p className="font-700" style={{ color: tappable ? '#555' : '#333' }}>
                      Repos
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-800 text-sm truncate"
                      style={{ color: isToday ? '#fff' : isDone ? '#ccc' : '#888' }}>
                      {day.circuit}
                    </p>
                    <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                      {day.exercises} exercices
                    </p>
                  </div>
                )}
                {isToday && (
                  <span
                    className="text-xs font-800 px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: withAlpha(accent, 0.12), color: accent }}>
                    En cours
                  </span>
                )}
                {isDone && (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: withAlpha(accent, 0.12) }}>
                    <svg
                      fill="none"
                      height="12"
                      stroke={accent}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      width="12">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                {tappable && (
                  <span style={{ color: '#333', flexShrink: 0 }}>
                    <IconChevronRight />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {assignIndex !== null && (
        <DayAssignSheet
          circuits={circuits}
          day={currentWeekDays[assignIndex]}
          dayIndex={assignIndex}
          onAssign={(d) => {
            onUpdateDay(assignIndex, d);
            setAssignIndex(null);
          }}
          onClose={() => {
            setAssignIndex(null);
          }}
        />
      )}
    </div>
  );
}
