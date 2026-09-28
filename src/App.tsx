import { useEffect, useRef, useState } from 'react';

import {
  IconBack,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCouch,
  IconDumbbell,
  IconFlash,
  IconGear,
  IconHome,
  IconPause,
  IconPlay,
  IconPlus,
  IconSkip,
} from './assets/icons';
import { ACCENT_PALETTE, AccentColor, CARD_COLORS } from './enums';
import {
  circuitDurationMin,
  computeGlobalStats,
  computeHealthStats,
  getNextSession,
  withAlpha,
} from './helpers';
import type { Circuit, DayProgram, Exercise, UserProfile } from './interfaces';
import {
  DAY_DATES,
  DAY_LABELS,
  defaultProfile,
  initialCircuits,
  initialExercises,
  WEEK_HISTORY,
} from './mocks';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'home' | 'weekly' | 'circuits' | 'create-circuit' | 'timer' | 'profile';

// ─── Constants ────────────────────────────────────────────────────────────────

const BODY_PARTS = ['Épaules', 'Dos', 'Jambes', 'Abdos', 'Bras', 'Poitrine', 'Fessiers', 'Cardio'];

const TAG_COLORS: Record<string, AccentColor> = {
  Épaules: AccentColor.CORAL,
  Dos: AccentColor.TEAL,
  Jambes: AccentColor.YELLOW,
  Abdos: AccentColor.SALMON,
  Bras: AccentColor.SAGE,
  Poitrine: AccentColor.SEAFOAM,
  Fessiers: AccentColor.BLUSH,
  Cardio: AccentColor.LIME,
};

const CIRCUIT_MUSCLES: Record<string, string[]> = {
  'Force Upper': ['Épaules', 'Dos', 'Bras', 'Poitrine'],
  'Force Lower': ['Jambes', 'Fessiers'],
  'Cardio HIIT': ['Cardio', 'Jambes'],
  'Full Body': ['Épaules', 'Dos', 'Jambes', 'Abdos', 'Bras', 'Poitrine', 'Fessiers', 'Cardio'],
  'Push Day': ['Épaules', 'Poitrine', 'Bras'],
  'Pull Day': ['Dos', 'Bras'],
  'Leg Day': ['Jambes', 'Fessiers'],
  Mobilité: ['Dos', 'Épaules', 'Jambes'],
};

const TODAY_INDEX = 0;

// ─── Shared Components ────────────────────────────────────────────────────────

const Tag = ({ label }: { label: string }) => (
  <span
    className="text-xs font-bold px-2.5 py-1 rounded-full"
    style={{
      backgroundColor: TAG_COLORS[label] + '30',
      color: TAG_COLORS[label],
      border: `1px solid ${TAG_COLORS[label]}50`,
    }}>
    {label}
  </span>
);

function Stepper({
  value,
  onChange,
  unit,
  step = 5,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  unit: string;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90"
        style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}>
        −
      </button>
      <span className="font-900 text-base text-center" style={{ minWidth: 52 }}>
        {value}
        <span className="text-xs font-700 ml-1" style={{ color: '#555' }}>
          {unit}
        </span>
      </span>
      <button
        onClick={() => onChange(value + step)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90"
        style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}>
        +
      </button>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({
  onGoToTimer,
  onGoToWeekly,
  onGoToProfile,
  profile,
  currentWeekDays,
  accent,
}: {
  onGoToTimer: () => void;
  onGoToWeekly: () => void;
  onGoToProfile: () => void;
  profile: UserProfile;
  currentWeekDays: DayProgram[];
  accent: string;
}) {
  const { totalMin, totalSessions, totalExerciseReps, bodyPartCount, maxCount } =
    computeGlobalStats(WEEK_HISTORY, BODY_PARTS, CIRCUIT_MUSCLES);
  const nextSession = getNextSession(currentWeekDays, TODAY_INDEX);
  const sparkData = WEEK_HISTORY.slice()
    .reverse()
    .map((w) => w.stats.totalMin);
  const sparkMax = Math.max(...sparkData);
  const sortedParts = [...BODY_PARTS].sort((a, b) => bodyPartCount[b] - bodyPartCount[a]);
  const totalHours = Math.floor(totalMin / 60);
  const totalMinsRem = totalMin % 60;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-800 tracking-widest uppercase" style={{ color: accent }}>
            Lundi · 16 sept. 2026
          </p>
          <h1 className="text-3xl font-900 mt-1">Bonjour,</h1>
          <p className="text-3xl font-900" style={{ color: accent }}>
            {profile.firstName || 'Athlète'} 👊
          </p>
        </div>
        <button
          onClick={onGoToProfile}
          className="w-10 h-10 rounded-full flex items-center justify-center mt-2 transition-all active:scale-90"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
          <IconGear />
        </button>
      </div>

      {nextSession && (
        <div className="mx-5 mb-5">
          <p
            className="text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: '#555' }}>
            Prochaine séance
          </p>
          <div
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
              border: `1px solid ${withAlpha(accent, 0.18)}`,
            }}>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-900 tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: withAlpha(accent, 0.13), color: accent }}>
                  {nextSession.day}
                </span>
                <span className="text-xs font-700" style={{ color: '#555' }}>
                  demain
                </span>
              </div>
              <p className="text-xl font-900">{nextSession.circuit}</p>
              <p className="text-sm font-600 mt-1" style={{ color: '#666' }}>
                {nextSession.exercises} exercices
              </p>
            </div>
            <button
              onClick={onGoToTimer}
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95"
              style={{ backgroundColor: accent }}>
              <span style={{ color: '#0d0d0d', marginLeft: 2 }}>
                <IconPlay />
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="px-5 mb-5">
        <p className="text-xs font-800 tracking-widest uppercase mb-2.5" style={{ color: '#555' }}>
          Statistiques globales
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { value: `${totalHours}h${totalMinsRem > 0 ? totalMinsRem : ''}`, label: 'Entraîné' },
            { value: `${totalSessions}`, label: 'Séances' },
            { value: `${totalExerciseReps}`, label: 'Exercices' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 flex flex-col items-center text-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-2xl font-900 leading-tight" style={{ color: accent }}>
                {s.value}
              </p>
              <p className="text-xs font-700 mt-1" style={{ color: '#555' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-800 tracking-widest uppercase" style={{ color: '#555' }}>
            Volume / semaine
          </p>
          <p className="text-xs font-700" style={{ color: accent }}>
            5 sem.
          </p>
        </div>
        <div className="flex items-end gap-1.5 h-14">
          {sparkData.map((val, i) => (
            <div key={i} className="flex-1">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${Math.round((val / sparkMax) * 100)}%`,
                  backgroundColor: i === sparkData.length - 1 ? accent : withAlpha(accent, 0.2),
                  minHeight: 4,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2">
          {['S33', 'S34', 'S35', 'S36', 'S37'].map((s, i) => (
            <p
              key={s}
              className="flex-1 text-center text-xs font-700"
              style={{ color: i === 4 ? accent : '#333' }}>
              {s}
            </p>
          ))}
        </div>
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <p className="text-xs font-800 tracking-widest uppercase mb-4" style={{ color: '#555' }}>
          Parties du corps travaillées
        </p>
        <div className="space-y-3">
          {sortedParts.map((part) => {
            const count = bodyPartCount[part];
            const pct = (count / maxCount) * 100;
            return (
              <div key={part}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-800" style={{ color: count > 0 ? '#ccc' : '#444' }}>
                    {part}
                  </span>
                  <span
                    className="text-xs font-900"
                    style={{ color: count > 0 ? TAG_COLORS[part] : '#333' }}>
                    {count > 0 ? `${count}×` : '—'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: '#2a2a2a' }}>
                  {count > 0 && (
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: TAG_COLORS[part] }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onGoToWeekly}
        className="mx-5 mb-8 rounded-2xl py-3.5 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
        Voir le programme complet →
      </button>
    </div>
  );
}

// ─── Weekly Screen ────────────────────────────────────────────────────────────

function DayAssignSheet({
  dayIndex,
  day,
  circuits,
  onAssign,
  onCreateCircuit,
  onClose,
  accent,
}: {
  dayIndex: number;
  day: DayProgram;
  circuits: Circuit[];
  onAssign: (d: DayProgram) => void;
  onCreateCircuit: () => void;
  onClose: () => void;
  accent: string;
}) {
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
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900"
            style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
            ×
          </button>
        </div>

        <button
          onClick={() =>
            onAssign({
              ...day,
              isRest: true,
              circuit: undefined,
              circuitId: undefined,
              exercises: undefined,
            })
          }
          className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 mb-3 transition-all active:opacity-70"
          style={{
            backgroundColor: day.isRest ? '#2a2a2a' : '#1a1a1a',
            border: day.isRest ? `1px solid ${withAlpha(accent, 0.3)}` : '1px solid #2a2a2a',
          }}>
          <IconCouch />
          <span className="font-800 flex-1 text-left">Repos</span>
          {day.isRest && (
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accent }}>
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round">
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
                onClick={() =>
                  onAssign({
                    ...day,
                    isRest: false,
                    circuit: c.name,
                    circuitId: c.id,
                    exercises: c.exerciseIds.length,
                  })
                }
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all active:opacity-70"
                style={{
                  backgroundColor: selected ? withAlpha(c.color, 0.1) : '#1a1a1a',
                  border: selected ? `1px solid ${withAlpha(c.color, 0.4)}` : '1px solid #2a2a2a',
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
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onCreateCircuit}
          className="w-full mt-3 rounded-2xl py-3 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            backgroundColor: '#1a1a1a',
            border: `1px dashed ${withAlpha(accent, 0.3)}`,
            color: accent,
          }}>
          <IconPlus /> Nouveau circuit
        </button>
      </div>
    </div>
  );
}

function WeeklyScreen({
  onStartTimer,
  circuits,
  currentWeekDays,
  onUpdateDay,
  onCreateCircuit,
  accent,
}: {
  onStartTimer: () => void;
  circuits: Circuit[];
  currentWeekDays: DayProgram[];
  onUpdateDay: (i: number, d: DayProgram) => void;
  onCreateCircuit: () => void;
  accent: string;
}) {
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
            onClick={() => setWeekOffset((o) => Math.min(o + 1, WEEK_HISTORY.length - 1))}
            disabled={weekOffset >= WEEK_HISTORY.length - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              backgroundColor: weekOffset >= WEEK_HISTORY.length - 1 ? '#111' : '#2a2a2a',
              color: weekOffset >= WEEK_HISTORY.length - 1 ? '#333' : '#aaa',
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
            onClick={() => setWeekOffset((o) => Math.max(o - 1, 0))}
            disabled={weekOffset === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              backgroundColor: weekOffset === 0 ? '#111' : '#2a2a2a',
              color: weekOffset === 0 ? '#333' : '#aaa',
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
              <button
                onClick={onStartTimer}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: '#0d0d0d' }}>
                <span style={{ color: accent, marginLeft: 3 }}>
                  <IconPlay />
                </span>
              </button>
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
                onClick={() => (tappable ? setAssignIndex(i) : undefined)}
                className={`flex items-center gap-4 rounded-xl px-4 py-3.5 ${tappable ? 'cursor-pointer' : ''}`}
                style={{
                  backgroundColor: isToday ? '#2a2a2a' : '#1a1a1a',
                  border: isToday ? `1px solid ${withAlpha(accent, 0.25)}` : '1px solid #2a2a2a',
                  opacity: !isCurrentWeek && day.isRest ? 0.45 : 1,
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
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accent}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round">
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
          dayIndex={assignIndex}
          day={currentWeekDays[assignIndex]}
          circuits={circuits}
          onAssign={(d) => {
            onUpdateDay(assignIndex, d);
            setAssignIndex(null);
          }}
          onCreateCircuit={() => {
            setAssignIndex(null);
            onCreateCircuit();
          }}
          onClose={() => setAssignIndex(null)}
          accent={accent}
        />
      )}
    </div>
  );
}

// ─── Circuits Screen ──────────────────────────────────────────────────────────

function CircuitsScreen({
  circuits,
  exercises,
  onCreateNew,
  onEdit,
  accent,
}: {
  circuits: Circuit[];
  exercises: Exercise[];
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  accent: string;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-900">Mes Circuits</h1>
          <p className="text-sm mt-0.5" style={{ color: '#888' }}>
            {circuits.length} circuit{circuits.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: accent, color: '#0d0d0d' }}>
          <IconPlus />
        </button>
      </div>

      <div className="px-5 space-y-3 pb-6">
        {circuits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-5xl">💪</p>
            <p className="font-800 text-center" style={{ color: '#555' }}>
              Aucun circuit encore
            </p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3.5 rounded-2xl font-900"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}>
              Créer mon premier circuit
            </button>
          </div>
        )}
        {circuits.map((c) => {
          const exs = exercises.filter((e) => c.exerciseIds.includes(e.id));
          return (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="h-1.5 w-full" style={{ backgroundColor: c.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-900 text-base">{c.name}</h3>
                    <p className="text-xs font-700 mt-1" style={{ color: '#555' }}>
                      {c.cycles} cycles · {c.rounds} rounds · ~{circuitDurationMin(c)} min
                    </p>
                  </div>
                  <button
                    onClick={() => onEdit(c.id)}
                    className="text-xs font-800 px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
                    style={{ backgroundColor: withAlpha(c.color, 0.12), color: c.color }}>
                    Éditer
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  {[
                    `⚡ ${c.exerciseTime}s travail`,
                    `💤 ${c.restBetweenExercises}s repos`,
                    `🔄 ${c.restBetweenCycles}s inter-cycle`,
                    `🏁 ${c.prepTime}s prép.`,
                  ].map((b) => (
                    <span
                      key={b}
                      className="text-xs font-700 px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#2a2a2a', color: '#666' }}>
                      {b}
                    </span>
                  ))}
                </div>

                {exs.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {exs.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                        style={{ backgroundColor: withAlpha(e.color, 0.12) }}>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                        <span className="text-xs font-800" style={{ color: e.color }}>
                          {e.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Create Circuit Screen ────────────────────────────────────────────────────

function CreateCircuitScreen({
  onBack,
  onSave,
  exercises,
  initial,
  accent,
}: {
  onBack: () => void;
  onSave: (c: Circuit) => void;
  exercises: Exercise[];
  initial?: Circuit;
  accent: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? CARD_COLORS[0]);
  const [prepTime, setPrepTime] = useState(initial?.prepTime ?? 10);
  const [exerciseTime, setExerciseTime] = useState(initial?.exerciseTime ?? 45);
  const [restBetweenExercises, setRestBetweenExercises] = useState(
    initial?.restBetweenExercises ?? 15,
  );
  const [rounds, setRounds] = useState(initial?.rounds ?? 4);
  const [cycles, setCycles] = useState(initial?.cycles ?? 3);
  const [restBetweenCycles, setRestBetweenCycles] = useState(initial?.restBetweenCycles ?? 60);
  const [recoveryTime, setRecoveryTime] = useState(initial?.recoveryTime ?? 90);
  const [exerciseIds, setExerciseIds] = useState<string[]>(initial?.exerciseIds ?? []);
  const [showPicker, setShowPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  const durationMin = circuitDurationMin({
    cycles,
    exerciseTime,
    prepTime,
    recoveryTime,
    restBetweenCycles,
    restBetweenExercises,
    rounds,
  });
  const selectedExercises = exerciseIds
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];

  const handleSave = () => {
    if (!name.trim()) return;
    setSaved(true);
    setTimeout(() => {
      onSave({
        id: initial?.id ?? Date.now().toString(),
        name: name.trim(),
        color,
        prepTime,
        exerciseTime,
        restBetweenExercises,
        rounds,
        cycles,
        restBetweenCycles,
        recoveryTime,
        exerciseIds,
      });
      onBack();
    }, 600);
  };

  const moveExercise = (i: number, dir: -1 | 1) => {
    const ids = [...exerciseIds];
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setExerciseIds(ids);
  };

  const timingRows = [
    { label: 'Préparation', value: prepTime, onChange: setPrepTime, unit: 'sec', step: 5 },
    {
      label: "Temps d'exercice",
      value: exerciseTime,
      onChange: setExerciseTime,
      unit: 'sec',
      step: 5,
    },
    {
      label: 'Repos entre exercices',
      value: restBetweenExercises,
      onChange: setRestBetweenExercises,
      unit: 'sec',
      step: 5,
    },
    { label: 'Rounds / cycle', value: rounds, onChange: setRounds, unit: '×', step: 1, min: 1 },
    { label: 'Nombre de cycles', value: cycles, onChange: setCycles, unit: '×', step: 1, min: 1 },
    {
      label: 'Repos entre cycles',
      value: restBetweenCycles,
      onChange: setRestBetweenCycles,
      unit: 'sec',
      step: 15,
    },
    {
      label: 'Récupération finale',
      value: recoveryTime,
      onChange: setRecoveryTime,
      unit: 'sec',
      step: 15,
    },
  ];

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-5 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5' }}>
            <IconBack />
          </button>
          <h1 className="text-2xl font-900">
            {initial ? 'Éditer le circuit' : 'Créer un Circuit'}
          </h1>
        </div>

        <div className="px-5 space-y-5 pb-8">
          {/* Name */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Nom du circuit
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Force Upper Body"
              className="w-full rounded-xl px-4 py-3.5 font-700 text-base outline-none"
              style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5', border: '1px solid #2a2a2a' }}
              onFocus={(e) => (e.target.style.borderColor = withAlpha(accent, 0.4))}
              onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
            />
          </div>

          {/* Color */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Couleur
            </label>
            <div className="flex gap-2.5">
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-lg transition-all active:scale-90"
                  style={{
                    backgroundColor: c,
                    border: color === c ? '2.5px solid #fff' : '2.5px solid transparent',
                    transform: color === c ? 'scale(1.18)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timing */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Paramètres de timing
            </label>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              {timingRows.map((row, idx) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom: idx < timingRows.length - 1 ? '1px solid #2a2a2a' : 'none',
                  }}>
                  <p className="text-sm font-700" style={{ color: '#aaa' }}>
                    {row.label}
                  </p>
                  <Stepper
                    value={row.value}
                    onChange={row.onChange}
                    unit={row.unit}
                    step={row.step}
                    min={row.min ?? 0}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs font-700 mt-2 text-right" style={{ color: '#555' }}>
              Durée estimée : ~{durationMin} min
            </p>
          </div>

          {/* Exercises */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Exercices ({exerciseIds.length})
            </label>
            {selectedExercises.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedExercises.map((e, i) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-900 text-sm shrink-0"
                      style={{ backgroundColor: withAlpha(e.color, 0.15), color: e.color }}>
                      {i + 1}
                    </div>
                    <p className="font-800 text-sm flex-1 min-w-0 truncate">{e.name}</p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => moveExercise(i, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-900"
                        style={{ backgroundColor: '#2a2a2a', color: i > 0 ? '#888' : '#333' }}>
                        ↑
                      </button>
                      <button
                        onClick={() => moveExercise(i, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-900"
                        style={{
                          backgroundColor: '#2a2a2a',
                          color: i < exerciseIds.length - 1 ? '#888' : '#333',
                        }}>
                        ↓
                      </button>
                      <button
                        onClick={() => setExerciseIds(exerciseIds.filter((id) => id !== e.id))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-900 leading-none"
                        style={{ backgroundColor: '#2a2a2a', color: '#FF6B6B' }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowPicker(true)}
              className="w-full rounded-xl py-3 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px dashed ${withAlpha(accent, 0.3)}`,
                color: accent,
              }}>
              <IconPlus /> Ajouter des exercices
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!name.trim() || saved}
            className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              backgroundColor: saved ? '#8bcf00' : name.trim() ? accent : '#2a2a2a',
              color: name.trim() ? '#0d0d0d' : '#555',
            }}>
            {saved
              ? '✓ Circuit enregistré !'
              : initial
                ? 'Enregistrer les modifications'
                : 'Créer le circuit'}
          </button>
        </div>
      </div>

      {/* Exercise Picker */}
      {showPicker && (
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{ backgroundColor: '#00000090', zIndex: 50 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPicker(false);
          }}>
          <div
            className="rounded-t-3xl px-5 pt-5 pb-6 flex flex-col"
            style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '72%' }}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="font-900 text-lg">Choisir des exercices</p>
              <button
                onClick={() => setShowPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none"
                style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
                ×
              </button>
            </div>
            <div className="overflow-y-auto space-y-2">
              {exercises.map((e) => {
                const selected = exerciseIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() =>
                      setExerciseIds(
                        selected ? exerciseIds.filter((id) => id !== e.id) : [...exerciseIds, e.id],
                      )
                    }
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all"
                    style={{
                      backgroundColor: selected ? withAlpha(e.color, 0.1) : '#1a1a1a',
                      border: `1px solid ${selected ? withAlpha(e.color, 0.4) : '#2a2a2a'}`,
                    }}>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-900 shrink-0"
                      style={{ backgroundColor: withAlpha(e.color, 0.15), color: e.color }}>
                      {e.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-800 text-sm">{e.name}</p>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {e.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs font-700"
                            style={{ color: TAG_COLORS[t] }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: e.color }}>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowPicker(false)}
              className="mt-4 w-full rounded-2xl py-3.5 font-900 shrink-0"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}>
              Confirmer ({exerciseIds.length} exercice{exerciseIds.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Timer Screen ─────────────────────────────────────────────────────────────

function TimerScreen({
  onBack,
  circuit,
  exercises,
  accent,
}: {
  onBack: () => void;
  circuit?: Circuit;
  exercises: Exercise[];
  accent: string;
}) {
  const WORK_TIME = circuit?.exerciseTime ?? 45;
  const REST_TIME = circuit?.restBetweenExercises ?? 15;
  const TOTAL_ROUNDS = circuit?.rounds ?? 4;
  const TOTAL_CYCLES = circuit?.cycles ?? 6;

  const exerciseNames = circuit
    ? circuit.exerciseIds.map((id) => exercises.find((e) => e.id === id)?.name ?? 'Exercice')
    : ['Burpees', 'Tractions', 'Squat sauté', 'Gainage planche', 'Fentes marchées'];

  const [seconds, setSeconds] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [round, setRound] = useState(1);
  const [cycle, setCycle] = useState(1);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exerciseIndex = (cycle - 1) % Math.max(1, exerciseNames.length);

  useEffect(() => {
    if (isRunning && !done) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (isWork) {
              setIsWork(false);
              return REST_TIME;
            } else {
              if (cycle >= TOTAL_CYCLES && round >= TOTAL_ROUNDS) {
                setIsRunning(false);
                setDone(true);
                return 0;
              } else if (cycle >= TOTAL_CYCLES) {
                setRound((r) => r + 1);
                setCycle(1);
              } else {
                setCycle((c) => c + 1);
              }
              setIsWork(true);
              return WORK_TIME;
            }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isWork, cycle, round, done, WORK_TIME, REST_TIME, TOTAL_ROUNDS, TOTAL_CYCLES]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const progress = seconds / (isWork ? WORK_TIME : REST_TIME);
  const circumference = 2 * Math.PI * 88;

  const handleReset = () => {
    setSeconds(WORK_TIME);
    setIsRunning(false);
    setIsWork(true);
    setRound(1);
    setCycle(1);
    setDone(false);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)' }}>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a' }}>
          <IconBack />
        </button>
        <div className="text-center">
          <p className="font-900 text-sm" style={{ color: accent }}>
            {circuit?.name ?? 'Séance'}
          </p>
          <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
            Circuit du jour
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-800 px-3 py-2 rounded-full"
          style={{ backgroundColor: '#1a1a1a', color: '#888' }}>
          Reset
        </button>
      </div>

      <div className="px-5 flex gap-3 mb-6">
        {[
          { label: 'Rounds', value: round, total: TOTAL_ROUNDS, color: accent },
          { label: 'Cycles', value: cycle, total: TOTAL_CYCLES, color: '#fff' },
        ].map((bar) => (
          <div
            key={bar.label}
            className="flex-1 rounded-xl p-3 text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p
              className="text-xs font-800 tracking-widest uppercase mb-1"
              style={{ color: '#555' }}>
              {bar.label}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-900" style={{ color: bar.color }}>
                {bar.value}
              </span>
              <span className="text-sm font-700" style={{ color: '#444' }}>
                / {bar.total}
              </span>
            </div>
            <div className="flex gap-1 justify-center mt-2">
              {Array.from({ length: bar.total }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ backgroundColor: i < bar.value ? bar.color : '#2a2a2a' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mb-2">
        <span
          className="text-xs font-900 tracking-widest uppercase px-4 py-1.5 rounded-full"
          style={{
            backgroundColor: isWork ? withAlpha(accent, 0.12) : '#FF6B3520',
            color: isWork ? accent : '#FF6B35',
          }}>
          {done ? 'Terminé !' : isWork ? 'Travail' : 'Repos'}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <svg width="210" height="210" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="105" cy="105" r="88" fill="none" stroke="#2a2a2a" strokeWidth="8" />
            <circle
              cx="105"
              cy="105"
              r="88"
              fill="none"
              stroke={isWork ? accent : '#FF6B35'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${circumference * progress} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.5s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-900 leading-none"
              style={{ fontSize: 54, color: done ? accent : '#fff' }}>
              {done ? '✓' : `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`}
            </span>
            {!done && (
              <span className="text-sm font-700 mt-1" style={{ color: '#555' }}>
                {isWork ? 'secondes' : 'récupération'}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 text-center px-8">
          <p className="text-xs font-800 tracking-widest uppercase mb-1" style={{ color: '#555' }}>
            Exercice actuel
          </p>
          <p className="text-xl font-900">
            {done ? 'Circuit complété !' : exerciseNames[exerciseIndex]}
          </p>
          {!done && exerciseNames.length > 1 && (
            <p className="text-sm font-600 mt-1" style={{ color: '#555' }}>
              Suivant : {exerciseNames[(exerciseIndex + 1) % exerciseNames.length]}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-10 flex items-center justify-center gap-6">
        <button
          onClick={() => {
            setCycle((c) => Math.max(1, c - 1));
            setSeconds(WORK_TIME);
            setIsWork(true);
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
          <span style={{ transform: 'scaleX(-1)' }}>
            <IconSkip />
          </span>
        </button>
        <button
          onClick={() => (done ? handleReset() : setIsRunning((r) => !r))}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          style={{ backgroundColor: accent, color: '#0d0d0d' }}>
          {done ? (
            <span className="text-2xl font-900">↺</span>
          ) : isRunning ? (
            <IconPause />
          ) : (
            <span style={{ marginLeft: 4 }}>
              <IconPlay />
            </span>
          )}
        </button>
        <button
          onClick={() => {
            if (cycle < TOTAL_CYCLES) setCycle((c) => c + 1);
            else if (round < TOTAL_ROUNDS) {
              setRound((r) => r + 1);
              setCycle(1);
            }
            setSeconds(WORK_TIME);
            setIsWork(true);
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
          <IconSkip />
        </button>
      </div>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

function ProfileScreen({
  profile,
  onSave,
  onBack,
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState(profile);
  const health = computeHealthStats(draft);
  const update = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-5 flex items-center gap-4">
        <button
          onClick={() => {
            onSave(draft);
            onBack();
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5' }}>
          <IconBack />
        </button>
        <h1 className="text-2xl font-900">Mon Profil</h1>
      </div>

      <div className="px-5 space-y-5 pb-8">
        {/* Identity */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Identité
          </label>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <input
              type="text"
              value={draft.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              placeholder="Prénom"
              className="w-full px-4 py-3.5 font-700 text-base outline-none"
              style={{
                backgroundColor: 'transparent',
                color: '#f5f5f5',
                borderBottom: '1px solid #2a2a2a',
              }}
            />
            <input
              type="text"
              value={draft.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder="Nom"
              className="w-full px-4 py-3.5 font-700 text-base outline-none"
              style={{ backgroundColor: 'transparent', color: '#f5f5f5' }}
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Genre
          </label>
          <div className="flex gap-3">
            {(['homme', 'femme'] as const).map((g) => (
              <button
                key={g}
                onClick={() => update('gender', g)}
                className="flex-1 py-3.5 rounded-xl font-800 capitalize transition-all active:scale-95"
                style={{
                  backgroundColor: draft.gender === g ? draft.accentColor : '#1a1a1a',
                  color: draft.gender === g ? '#0d0d0d' : '#666',
                  border: draft.gender === g ? 'none' : '1px solid #2a2a2a',
                }}>
                {g === 'homme' ? 'Homme' : 'Femme'}
              </button>
            ))}
          </div>
        </div>

        {/* Physical data */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Données physiques
          </label>
          <div
            className="rounded-2xl overflow-hidden px-4"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {[
              {
                label: 'Âge',
                value: draft.age,
                key: 'age' as const,
                unit: 'ans',
                step: 1,
                min: 10,
              },
              {
                label: 'Taille',
                value: draft.heightCm,
                key: 'heightCm' as const,
                unit: 'cm',
                step: 1,
                min: 100,
              },
              {
                label: 'Poids',
                value: draft.weightKg,
                key: 'weightKg' as const,
                unit: 'kg',
                step: 1,
                min: 30,
              },
            ].map((row, idx) => (
              <div
                key={row.key}
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: idx < 2 ? '1px solid #2a2a2a' : 'none' }}>
                <p className="text-sm font-700" style={{ color: '#aaa' }}>
                  {row.label}
                </p>
                <Stepper
                  value={row.value}
                  onChange={(v) => update(row.key, v)}
                  unit={row.unit}
                  step={row.step}
                  min={row.min}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Calculated health stats */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Données de santé
          </label>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {/* IMC */}
            <div className="p-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
              <p
                className="text-xs font-800 tracking-widest uppercase mb-3"
                style={{ color: '#555' }}>
                IMC
              </p>
              <div className="flex items-end justify-between mb-3">
                <span className="text-5xl font-900 leading-none">{health.bmi}</span>
                <span
                  className="text-sm font-800 px-3 py-1.5 rounded-full mb-1"
                  style={{ backgroundColor: health.bmiColor + '25', color: health.bmiColor }}>
                  {health.bmiCategory}
                </span>
              </div>
              {/* Gradient gauge with cursor */}
              <div
                className="relative h-2.5 rounded-full overflow-visible"
                style={{
                  background:
                    'linear-gradient(90deg, #4ECDC4 0%, #60D394 20%, #cbff47 35%, #FFD93D 55%, #FF9A3C 72%, #FF4757 100%)',
                }}>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md"
                  style={{
                    left: `clamp(0%, calc(${Math.min(100, Math.max(0, ((health.bmi - 16) / (40 - 16)) * 100))}% - 7px), calc(100% - 7px))`,
                    border: `2.5px solid ${health.bmiColor}`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {['16', '18.5', '25', '30', '40'].map((v) => (
                  <span key={v} className="text-xs font-700" style={{ color: '#444' }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
            {[
              { label: 'FC max estimée', value: `${health.fcMax} bpm`, sub: '220 − âge' },
              {
                label: 'Métabolisme de base',
                value: `${health.bmr} kcal/j`,
                sub: 'Harris-Benedict',
              },
              {
                label: 'Poids idéal',
                value: `${health.idealWeight} kg`,
                sub: 'Formule de Lorentz',
              },
            ].map((s, idx) => (
              <div
                key={s.label}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: idx < 2 ? '1px solid #2a2a2a' : 'none' }}>
                <div>
                  <p className="font-800 text-sm">{s.label}</p>
                  <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                    {s.sub}
                  </p>
                </div>
                <p className="font-900 text-base" style={{ color: draft.accentColor }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Couleur d'accent
          </label>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => update('accentColor', c)}
                className="w-10 h-10 rounded-xl transition-all active:scale-90"
                style={{
                  backgroundColor: c,
                  border: draft.accentColor === c ? '3px solid #fff' : '3px solid transparent',
                  transform: draft.accentColor === c ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            onSave(draft);
            onBack();
          }}
          className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95"
          style={{ backgroundColor: draft.accentColor, color: '#0d0d0d' }}>
          Enregistrer le profil
        </button>
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

function BottomNav({
  screen,
  onNavigate,
  accent,
}: {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  accent: string;
}) {
  const items: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Accueil', icon: <IconHome /> },
    { id: 'weekly', label: 'Programme', icon: <IconCalendar /> },
    { id: 'circuits', label: 'Circuits', icon: <IconDumbbell /> },
    { id: 'timer', label: 'Séance', icon: <IconFlash /> },
  ];
  return (
    <div
      className="flex items-center justify-around px-2 py-3 shrink-0"
      style={{ backgroundColor: '#111', borderTop: '1px solid #1f1f1f' }}>
      {items.map((item) => {
        const active = screen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-1 flex-1 py-1 transition-all">
            <span style={{ color: active ? accent : '#444' }}>{item.icon}</span>
            <span className="text-xs font-800" style={{ color: active ? accent : '#444' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [prevScreen, setPrevScreen] = useState<Screen>('home');
  const [exercises] = useState<Exercise[]>(initialExercises);
  const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits);
  const [currentWeekDays, setCurrentWeekDays] = useState<DayProgram[]>(WEEK_HISTORY[0].days);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', profile.accentColor);
  }, [profile.accentColor]);

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const handleBack = () => setScreen(prevScreen === screen ? 'home' : prevScreen);

  const goToCreateCircuit = (id?: string) => {
    setEditingCircuitId(id ?? null);
    navigate('create-circuit');
  };

  const handleSaveCircuit = (c: Circuit) => {
    setCircuits((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      return exists ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
    });
  };

  const todayCircuit = currentWeekDays[TODAY_INDEX].circuitId
    ? circuits.find((c) => c.id === currentWeekDays[TODAY_INDEX].circuitId)
    : undefined;

  const editingCircuit = editingCircuitId
    ? circuits.find((c) => c.id === editingCircuitId)
    : undefined;
  const accent = profile.accentColor;
  const noNav = screen === 'create-circuit' || screen === 'profile';

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ backgroundColor: '#050505' }}>
      <div
        className="flex flex-col overflow-hidden relative"
        style={{
          width: 'min(100vw, 390px)',
          height: 'min(100vh, 844px)',
          backgroundColor: '#0d0d0d',
          boxShadow: '0 0 80px #00000080',
        }}>
        <div className="flex-1 overflow-hidden relative">
          {screen === 'home' && (
            <HomeScreen
              onGoToTimer={() => navigate('timer')}
              onGoToWeekly={() => navigate('weekly')}
              onGoToProfile={() => navigate('profile')}
              profile={profile}
              currentWeekDays={currentWeekDays}
              accent={accent}
            />
          )}
          {screen === 'weekly' && (
            <WeeklyScreen
              onStartTimer={() => navigate('timer')}
              circuits={circuits}
              currentWeekDays={currentWeekDays}
              onUpdateDay={(i, d) =>
                setCurrentWeekDays((prev) => prev.map((day, idx) => (idx === i ? d : day)))
              }
              onCreateCircuit={() => goToCreateCircuit()}
              accent={accent}
            />
          )}
          {screen === 'circuits' && (
            <CircuitsScreen
              circuits={circuits}
              exercises={exercises}
              onCreateNew={() => goToCreateCircuit()}
              onEdit={(id) => goToCreateCircuit(id)}
              accent={accent}
            />
          )}
          {screen === 'create-circuit' && (
            <CreateCircuitScreen
              onBack={handleBack}
              onSave={handleSaveCircuit}
              exercises={exercises}
              initial={editingCircuit}
              accent={accent}
            />
          )}
          {screen === 'timer' && (
            <TimerScreen
              onBack={handleBack}
              circuit={todayCircuit}
              exercises={exercises}
              accent={accent}
            />
          )}
          {screen === 'profile' && (
            <ProfileScreen profile={profile} onSave={setProfile} onBack={handleBack} />
          )}
        </div>
        {!noNav && <BottomNav screen={screen} onNavigate={navigate} accent={accent} />}
      </div>
    </div>
  );
}
