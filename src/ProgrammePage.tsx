import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  getISOWeek,
  getISOWeekYear,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';

import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCouch,
  IconPlay,
  IconPlus,
  IconWeek,
} from './assets/icons';
import { ViewMode } from './enums';

interface DayProgram {
  day: string;
  short: string;
  isRest: boolean;
  circuit?: string;
  circuitId?: string;
  exercises?: number;
}

interface Circuit {
  id: string;
  name: string;
  color: string;
  prepTime: number;
  exerciseTime: number;
  restBetweenExercises: number;
  rounds: number;
  cycles: number;
  restBetweenCycles: number;
  recoveryTime: number;
  exerciseIds: string[];
}

interface CircuitTiming {
  prepTime: number;
  exerciseTime: number;
  restBetweenExercises: number;
  rounds: number;
  cycles: number;
  restBetweenCycles: number;
  recoveryTime: number;
}

interface WeekData {
  isoWeek: number;
  year: number;
  days: DayProgram[];
  stats: { sessions: number; totalMin: number; volume: string };
}

function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + alpha;
}

function circuitDurationMin(circuit: CircuitTiming): number {
  return Math.max(
    1,
    Math.round(
      (circuit.prepTime +
        circuit.cycles *
          (circuit.rounds * (circuit.exerciseTime + circuit.restBetweenExercises) +
            circuit.restBetweenCycles) +
        circuit.recoveryTime) /
        60,
    ),
  );
}

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

function getTodayIndex(date: Date = new Date()): number {
  return (getDay(date) + 6) % 7;
}

function getWeekStart(weekOffset: number, from: Date = new Date()): Date {
  return startOfWeek(addWeeks(from, -weekOffset), WEEK_START_OPTIONS);
}

function weekOffsetFromDate(date: Date, from: Date = new Date()): number {
  return differenceInCalendarWeeks(
    startOfWeek(from, WEEK_START_OPTIONS),
    startOfWeek(date, WEEK_START_OPTIONS),
    WEEK_START_OPTIONS,
  );
}

function monthOffsetFromDate(date: Date, from: Date = new Date()): number {
  return differenceInCalendarMonths(startOfMonth(from), startOfMonth(date));
}

function formatWeekLabel(weekStart: Date): string {
  return `Semaine ${getISOWeek(weekStart)} · ${getISOWeekYear(weekStart)}`;
}

function formatDateRange(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, WEEK_START_OPTIONS);
  const sameMonth =
    format(weekStart, 'MMM', { locale: fr }) === format(weekEnd, 'MMM', { locale: fr });
  if (sameMonth) {
    return `${format(weekStart, 'dd', { locale: fr })} – ${format(weekEnd, 'dd MMM', { locale: fr })}`;
  }
  return `${format(weekStart, 'dd MMM', { locale: fr })} – ${format(weekEnd, 'dd MMM', { locale: fr })}`;
}

function getWeekDayNumbers(weekStart: Date): string[] {
  return eachDayOfInterval({
    end: endOfWeek(weekStart, WEEK_START_OPTIONS),
    start: weekStart,
  }).map((day) => format(day, 'dd'));
}

function findHistoryWeek(weekStart: Date, history: WeekData[]): WeekData | undefined {
  const isoWeek = getISOWeek(weekStart);
  const year = getISOWeekYear(weekStart);
  return history.find((week) => week.isoWeek === isoWeek && week.year === year);
}

function getWeekKey(weekStart: Date): string {
  return `${getISOWeekYear(weekStart)}-W${getISOWeek(weekStart)}`;
}

function resolveWeekDays(
  weekStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
): DayProgram[] {
  const key = getWeekKey(weekStart);
  if (weekPrograms[key]) return weekPrograms[key];
  return findHistoryWeek(weekStart, WEEK_HISTORY)?.days ?? WEEK_HISTORY[0].days;
}

function isPastCalendarDay(dayDate: Date, now: Date = new Date()): boolean {
  return isBefore(startOfDay(dayDate), startOfDay(now));
}

function isSameAssignment(a: DayProgram, b: DayProgram): boolean {
  if (a.isRest && b.isRest) return true;
  if (a.isRest || b.isRest) return false;
  return a.circuitId === b.circuitId;
}

const DAY_LETTER_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getMonthStart(monthOffset: number, from: Date = new Date()): Date {
  return startOfMonth(addMonths(from, -monthOffset));
}

function getMonthGridDays(monthStart: Date): Date[] {
  const gridStart = startOfWeek(monthStart, WEEK_START_OPTIONS);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function getDayProgram(date: Date, weekPrograms: Record<string, DayProgram[]>): DayProgram {
  const weekStart = startOfWeek(date, WEEK_START_OPTIONS);
  const days = resolveWeekDays(weekStart, weekPrograms);
  return days[getTodayIndex(date)];
}

function formatMonthLabel(monthStart: Date): string {
  const label = format(monthStart, 'MMMM yyyy', { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function computePeriodStats(
  days: Date[],
  weekPrograms: Record<string, DayProgram[]>,
  circuits: Circuit[],
): { sessions: number; totalMin: number; exercises: number } {
  let sessions = 0;
  let totalMin = 0;
  let exercises = 0;
  for (const date of days) {
    const day = getDayProgram(date, weekPrograms);
    if (day.isRest) continue;
    sessions += 1;
    exercises += day.exercises ?? 0;
    const circuit = day.circuitId ? circuits.find((c) => c.id === day.circuitId) : undefined;
    if (circuit) totalMin += circuitDurationMin(circuit);
  }
  return { exercises, sessions, totalMin };
}

function computeWeekStats(
  weekStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
  circuits: Circuit[],
): { sessions: number; totalMin: number; exercises: number } {
  return computePeriodStats(
    eachDayOfInterval({
      end: endOfWeek(weekStart, WEEK_START_OPTIONS),
      start: weekStart,
    }),
    weekPrograms,
    circuits,
  );
}

function computeMonthStats(
  monthStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
  circuits: Circuit[],
): { sessions: number; totalMin: number; exercises: number } {
  return computePeriodStats(
    eachDayOfInterval({
      end: endOfMonth(monthStart),
      start: monthStart,
    }),
    weekPrograms,
    circuits,
  );
}

const WEEK_HISTORY: WeekData[] = [
  {
    days: [
      {
        circuit: 'Force Upper',
        circuitId: 'c1',
        day: 'Lundi',
        exercises: 3,
        isRest: false,
        short: 'LUN',
      },
      {
        circuit: 'Cardio HIIT',
        circuitId: 'c2',
        day: 'Mardi',
        exercises: 3,
        isRest: false,
        short: 'MAR',
      },
      { day: 'Mercredi', isRest: true, short: 'MER' },
      {
        circuit: 'Force Upper',
        circuitId: 'c1',
        day: 'Jeudi',
        exercises: 3,
        isRest: false,
        short: 'JEU',
      },
      {
        circuit: 'Full Body',
        circuitId: 'c3',
        day: 'Vendredi',
        exercises: 6,
        isRest: false,
        short: 'VEN',
      },
      { day: 'Samedi', isRest: true, short: 'SAM' },
      { day: 'Dimanche', isRest: true, short: 'DIM' },
    ],
    isoWeek: 37,
    stats: { sessions: 4, totalMin: 187, volume: '12 400 kg' },
    year: 2026,
  },
  {
    days: [
      { circuit: 'Push Day', day: 'Lundi', exercises: 5, isRest: false, short: 'LUN' },
      { day: 'Mardi', isRest: true, short: 'MAR' },
      { circuit: 'Pull Day', day: 'Mercredi', exercises: 5, isRest: false, short: 'MER' },
      { day: 'Jeudi', isRest: true, short: 'JEU' },
      { circuit: 'Leg Day', day: 'Vendredi', exercises: 6, isRest: false, short: 'VEN' },
      { circuit: 'Cardio HIIT', day: 'Samedi', exercises: 4, isRest: false, short: 'SAM' },
      { day: 'Dimanche', isRest: true, short: 'DIM' },
    ],
    isoWeek: 36,
    stats: { sessions: 4, totalMin: 162, volume: '10 800 kg' },
    year: 2026,
  },
  {
    days: [
      { day: 'Lundi', isRest: true, short: 'LUN' },
      { circuit: 'Force Upper', day: 'Mardi', exercises: 5, isRest: false, short: 'MAR' },
      { circuit: 'Cardio HIIT', day: 'Mercredi', exercises: 6, isRest: false, short: 'MER' },
      { day: 'Jeudi', isRest: true, short: 'JEU' },
      { circuit: 'Full Body', day: 'Vendredi', exercises: 7, isRest: false, short: 'VEN' },
      { day: 'Samedi', isRest: true, short: 'SAM' },
      { circuit: 'Mobilité', day: 'Dimanche', exercises: 3, isRest: false, short: 'DIM' },
    ],
    isoWeek: 35,
    stats: { sessions: 4, totalMin: 195, volume: '11 200 kg' },
    year: 2026,
  },
  {
    days: [
      { circuit: 'Push Day', day: 'Lundi', exercises: 5, isRest: false, short: 'LUN' },
      { circuit: 'Pull Day', day: 'Mardi', exercises: 5, isRest: false, short: 'MAR' },
      { day: 'Mercredi', isRest: true, short: 'MER' },
      { circuit: 'Leg Day', day: 'Jeudi', exercises: 6, isRest: false, short: 'JEU' },
      { day: 'Vendredi', isRest: true, short: 'VEN' },
      { circuit: 'Full Body', day: 'Samedi', exercises: 7, isRest: false, short: 'SAM' },
      { day: 'Dimanche', isRest: true, short: 'DIM' },
    ],
    isoWeek: 34,
    stats: { sessions: 4, totalMin: 210, volume: '13 600 kg' },
    year: 2026,
  },
  {
    days: [
      { circuit: 'Cardio HIIT', day: 'Lundi', exercises: 6, isRest: false, short: 'LUN' },
      { day: 'Mardi', isRest: true, short: 'MAR' },
      { circuit: 'Force Upper', day: 'Mercredi', exercises: 5, isRest: false, short: 'MER' },
      { day: 'Jeudi', isRest: true, short: 'JEU' },
      { circuit: 'Force Lower', day: 'Vendredi', exercises: 4, isRest: false, short: 'VEN' },
      { circuit: 'Mobilité', day: 'Samedi', exercises: 3, isRest: false, short: 'SAM' },
      { day: 'Dimanche', isRest: true, short: 'DIM' },
    ],
    isoWeek: 33,
    stats: { sessions: 4, totalMin: 148, volume: '9 500 kg' },
    year: 2026,
  },
];

function PeriodStatsRow({
  accent,
  stats,
}: {
  accent: string;
  stats: { sessions: number; totalMin: number; exercises: number };
}) {
  return (
    <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
      {[
        { label: 'Séances', value: `${stats.sessions}` },
        { label: 'Minutes', value: `${stats.totalMin}` },
        { label: 'Exos', value: `${stats.exercises}` },
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
  );
}

function DayAssignSheet({
  accent,
  circuits,
  day,
  dayDate,
  dayIndex,
  onAssign,
  onClose,
  onCreateCircuit,
  requiresConfirmation,
}: {
  dayIndex: number;
  dayDate: Date;
  day: DayProgram;
  circuits: Circuit[];
  onAssign: (d: DayProgram) => void;
  onCreateCircuit: () => void;
  onClose: () => void;
  accent: string;
  requiresConfirmation: boolean;
}) {
  const [pendingAssign, setPendingAssign] = useState<DayProgram | null>(null);

  const requestAssign = (next: DayProgram) => {
    if (isSameAssignment(day, next)) {
      onClose();
      return;
    }
    if (requiresConfirmation) {
      setPendingAssign(next);
      return;
    }
    onAssign(next);
  };

  const pendingLabel = pendingAssign
    ? pendingAssign.isRest
      ? 'Repos'
      : (pendingAssign.circuit ?? 'Circuit')
    : '';

  return (
    <div
      className="absolute inset-0 flex flex-col justify-end"
      style={{ backgroundColor: '#00000085', zIndex: 50 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pendingAssign) onClose();
      }}>
      <div
        className="rounded-t-3xl px-5 pt-5 pb-8"
        style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '75%' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-900 text-lg">{DAY_LABELS[dayIndex]}</p>
            <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
              {format(dayDate, 'dd MMM yyyy', { locale: fr })}
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
            requestAssign({
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
                  requestAssign({
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

      {pendingAssign && (
        <div
          className="absolute inset-0 flex items-center justify-center px-6"
          style={{ backgroundColor: '#000000a0', zIndex: 60 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingAssign(null);
          }}>
          <div
            className="w-full rounded-2xl p-5"
            style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="font-900 text-lg mb-2">Confirmer la modification</p>
            <p className="text-sm font-600 mb-5" style={{ color: '#888' }}>
              Tu modifies un jour passé ({format(dayDate, 'EEEE dd MMM yyyy', { locale: fr })}) vers
              « {pendingLabel} ». Continuer ?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-2xl py-3.5 font-800 text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
                onClick={() => {
                  setPendingAssign(null);
                }}>
                Annuler
              </button>
              <button
                className="flex-1 rounded-2xl py-3.5 font-800 text-sm transition-all active:scale-95"
                style={{ backgroundColor: accent, color: '#0d0d0d' }}
                onClick={() => {
                  onAssign(pendingAssign);
                }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgrammePage({
  accent,
  circuits,
  onCreateCircuit,
  onStartSession,
  onUpdateDay,
  weekPrograms,
}: {
  circuits: Circuit[];
  weekPrograms: Record<string, DayProgram[]>;
  onUpdateDay: (weekStart: Date, dayIndex: number, day: DayProgram) => void;
  onCreateCircuit: () => void;
  onStartSession: (circuitId: string) => void;
  accent: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MONTH);
  const [weekOffset, setWeekOffset] = useState(0);
  const [assignIndex, setAssignIndex] = useState<number | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const isCurrentWeek = weekOffset === 0;
  const isCurrentPeriod = weekOffset === 0 && monthOffset === 0;
  const weekStart = getWeekStart(weekOffset);
  const weekDays = resolveWeekDays(weekStart, weekPrograms);
  const weekStats = computeWeekStats(weekStart, weekPrograms, circuits);
  const weekLabel = formatWeekLabel(weekStart);
  const weekDateRange = formatDateRange(weekStart);
  const dayNumbers = getWeekDayNumbers(weekStart);
  const assignDayDate = assignIndex !== null ? addDays(weekStart, assignIndex) : null;

  const monthStart = getMonthStart(monthOffset);
  const monthGridDays = getMonthGridDays(monthStart);
  const monthStats = computeMonthStats(monthStart, weekPrograms, circuits);
  const today = new Date();
  const todayInMonth = isSameMonth(today, monthStart);
  const headerDayName = format(today, 'EEEE', { locale: fr });
  const headerDateTitle = format(today, 'd MMMM yyyy', { locale: fr });
  const todayIndex = getTodayIndex(today);
  const todayProgram = resolveWeekDays(getWeekStart(0), weekPrograms)[todayIndex];
  const todayCircuitId = todayProgram?.circuitId;
  const canStartToday =
    todayProgram !== undefined && !todayProgram.isRest && todayCircuitId !== undefined;

  const goToWeekOffset = (nextOffset: number) => {
    setWeekOffset(nextOffset);
    setMonthOffset(monthOffsetFromDate(getWeekStart(nextOffset)));
  };

  const goToMonthOffset = (nextOffset: number) => {
    const nextMonthStart = getMonthStart(nextOffset);
    setMonthOffset(nextOffset);
    if (!isSameMonth(weekStart, nextMonthStart)) {
      const anchor = isSameMonth(today, nextMonthStart) ? today : nextMonthStart;
      setWeekOffset(weekOffsetFromDate(anchor));
    }
  };

  const goToToday = () => {
    setWeekOffset(0);
    setMonthOffset(0);
  };

  const openWeekFromDate = (date: Date) => {
    goToWeekOffset(weekOffsetFromDate(date));
    setViewMode(ViewMode.WEEK);
  };

  const viewToggle = (
    <div
      className="inline-flex rounded-xl p-1 shrink-0"
      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
      {(
        [
          { id: ViewMode.WEEK, label: 'Semaine', icon: <IconWeek /> },
          { id: ViewMode.MONTH, label: 'Mois', icon: <IconCalendar /> },
        ] as const
      ).map((tab) => {
        const active = viewMode === tab.id;
        return (
          <button
            key={tab.id}
            aria-label={tab.label}
            className="min-w-11 min-h-11 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor: active ? accent : 'transparent',
              color: active ? '#0d0d0d' : '#888',
            }}
            onClick={() => {
              setViewMode(tab.id);
            }}>
            {tab.icon}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-3xl font-900">Programme</h1>
          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="min-w-0">
              <p
                className="text-sm font-800 tracking-wide capitalize leading-tight"
                style={{ color: accent }}>
                {headerDayName}
              </p>
              <p className="text-2xl font-900 capitalize leading-tight mt-0.5">{headerDateTitle}</p>
            </div>
            {viewToggle}
          </div>
        </div>

        {canStartToday && todayProgram && todayCircuitId ? (
          <div
            className="mx-5 mb-4 rounded-2xl overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)` }}>
            <div className="p-5 flex items-center justify-between">
              <div className="text-left flex-1 min-w-0">
                <p
                  className="text-xs font-800 tracking-widest uppercase"
                  style={{ color: '#0d0d0d90' }}>
                  Aujourd&apos;hui · {DAY_LABELS[todayIndex]}
                </p>
                <h2 className="text-2xl font-900 mt-1" style={{ color: '#0d0d0d' }}>
                  {todayProgram.circuit}
                </h2>
                <p className="text-sm font-700 mt-1" style={{ color: '#0d0d0d80' }}>
                  {todayProgram.exercises} exercices
                </p>
              </div>
              <button
                aria-label="Lancer la séance"
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                style={{ backgroundColor: '#0d0d0d' }}
                onClick={() => {
                  onStartSession(todayCircuitId);
                }}>
                <span style={{ color: accent, marginLeft: 3 }}>
                  <IconPlay />
                </span>
              </button>
            </div>
          </div>
        ) : null}

        {viewMode === ViewMode.WEEK && (
          <>
            <div
              className="mx-5 mb-4 flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <button
                aria-label="Semaine précédente"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToWeekOffset(weekOffset + 1);
                }}>
                <IconChevronLeft />
              </button>
              <div className="text-center flex-1 px-2">
                <p
                  className="font-900 text-sm"
                  style={{ color: isCurrentWeek ? accent : '#f5f5f5' }}>
                  {weekLabel}
                </p>
                <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                  {weekDateRange}
                </p>
                <button
                  aria-label="Aujourd'hui"
                  className="mt-1.5 text-xs font-800 px-2.5 py-1 rounded-full transition-all active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: '#2a2a2a', color: accent }}
                  disabled={isCurrentPeriod}
                  onClick={goToToday}>
                  Aujourd'hui
                </button>
              </div>
              <button
                aria-label="Semaine suivante"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToWeekOffset(weekOffset - 1);
                }}>
                <IconChevronRight />
              </button>
            </div>

            <PeriodStatsRow accent={accent} stats={weekStats} />

            <div className="px-5 space-y-2.5 pb-6">
              {weekDays.map((day, i) => {
                const dayDate = addDays(weekStart, i);
                const isToday = isSameDay(dayDate, new Date());
                const isPastDay = isPastCalendarDay(dayDate);
                const isDone = isPastDay && !day.isRest;
                return (
                  <div
                    key={day.day}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 cursor-pointer"
                    style={{
                      backgroundColor: isToday ? '#2a2a2a' : '#1a1a1a',
                      border: isToday
                        ? `1px solid ${withAlpha(accent, 0.25)}`
                        : '1px solid #2a2a2a',
                      opacity: isPastDay && day.isRest ? 0.45 : 1,
                    }}
                    onClick={() => {
                      setAssignIndex(i);
                    }}>
                    <div className="w-10 text-center">
                      <p
                        className="text-xs font-800 tracking-wider"
                        style={{
                          color: isToday ? accent : isDone ? withAlpha(accent, 0.4) : '#555',
                        }}>
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
                        <p className="font-700" style={{ color: '#555' }}>
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
                    <span style={{ color: '#333', flexShrink: 0 }}>
                      <IconChevronRight />
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewMode === ViewMode.MONTH && (
          <>
            <div className="mx-5 mb-4 flex items-center justify-between">
              <button
                aria-label="Mois précédent"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToMonthOffset(monthOffset + 1);
                }}>
                <IconChevronLeft />
              </button>
              <div className="text-center flex-1 px-2">
                <p className="font-900 text-sm" style={{ color: '#f5f5f5' }}>
                  {formatMonthLabel(monthStart)}
                </p>
                <button
                  aria-label="Aujourd'hui"
                  className="mt-1.5 text-xs font-800 px-2.5 py-1 rounded-full transition-all active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: '#2a2a2a', color: accent }}
                  disabled={isCurrentPeriod}
                  onClick={goToToday}>
                  Aujourd'hui
                </button>
              </div>
              <button
                aria-label="Mois suivant"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToMonthOffset(monthOffset - 1);
                }}>
                <IconChevronRight />
              </button>
            </div>

            <PeriodStatsRow accent={accent} stats={monthStats} />

            <div className="px-5 mb-6">
              <div className="grid gap-1" style={{ gridTemplateColumns: '28px repeat(7, 1fr)' }}>
                <div />
                {DAY_LETTER_HEADERS.map((letter, i) => (
                  <div
                    key={`${letter}-${i}`}
                    className="text-center text-xs font-800 py-1"
                    style={{ color: '#555' }}>
                    {letter}
                  </div>
                ))}
                {Array.from({ length: 6 }, (_, weekRow) => {
                  const rowStart = monthGridDays[weekRow * 7];
                  const weekNumber = getISOWeek(rowStart);
                  return (
                    <div key={`week-row-${weekRow}`} className="contents">
                      <div className="flex items-center justify-center">
                        <span
                          className="text-[10px] font-800 px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: '#2a2a2a', color: '#555' }}>
                          {weekNumber}
                        </span>
                      </div>
                      {monthGridDays.slice(weekRow * 7, weekRow * 7 + 7).map((date) => {
                        const inMonth = isSameMonth(date, monthStart);
                        const isTodayCell = isSameDay(date, today);
                        const isSelected = isTodayCell && todayInMonth;
                        const program = getDayProgram(date, weekPrograms);
                        const circuitColor = program.circuitId
                          ? circuits.find((c) => c.id === program.circuitId)?.color
                          : undefined;
                        return (
                          <button
                            key={date.toISOString()}
                            className="flex flex-col items-center justify-center py-1.5 gap-0.5"
                            onClick={() => {
                              openWeekFromDate(date);
                            }}>
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-800"
                              style={{
                                backgroundColor: isSelected ? accent : 'transparent',
                                color: isSelected ? '#0d0d0d' : inMonth ? '#ccc' : '#333',
                              }}>
                              {format(date, 'dd')}
                            </span>
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  !program.isRest && circuitColor && inMonth
                                    ? circuitColor
                                    : 'transparent',
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {viewMode === ViewMode.WEEK && assignIndex !== null && assignDayDate && (
        <DayAssignSheet
          accent={accent}
          circuits={circuits}
          day={weekDays[assignIndex]}
          dayDate={assignDayDate}
          dayIndex={assignIndex}
          requiresConfirmation={isPastCalendarDay(assignDayDate)}
          onAssign={(d) => {
            onUpdateDay(weekStart, assignIndex, d);
            setAssignIndex(null);
          }}
          onClose={() => {
            setAssignIndex(null);
          }}
          onCreateCircuit={() => {
            setAssignIndex(null);
            onCreateCircuit();
          }}
        />
      )}
    </div>
  );
}
