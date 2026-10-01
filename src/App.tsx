import {
  addDays,
  addMonths,
  addWeeks,
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

enum CardColor {
  ORANGE = '#FF6B35',
  PURPLE = '#7B2D8B',
  GREEN = '#1A936F',
  CRIMSON = '#C62A47',
  BLUE = '#2E86AB',
  RED = '#E84855',
  SLATE = '#3D405B',
  AMBER = '#F18F01',
}

const CARD_COLORS: string[] = Object.values(CardColor);
enum AccentColor {
  LIME = '#CBFF47',
  ORANGE = '#FF6B35',
  TEAL = '#4ECDC4',
  CORAL = '#FF6B6B',
  VIOLET = '#A78BFA',
  AMBER = '#F18F01',
  MINT = '#60D394',
  SKY = '#74C0FC',
  YELLOW = '#FFE66D',
  SALMON = '#FF8B94',
  SAGE = '#A8E6CF',
  SEAFOAM = '#88D8B0',
  BLUSH = '#FF9A9E',
}

const ACCENT_PALETTE: string[] = Object.values(AccentColor);
function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + alpha;
}

const DAY_SHORTS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

function getNextSession(days: NextSessionDay[], todayIndex: number): NextSession | null {
  for (let i = todayIndex + 1; i < days.length; i += 1) {
    const day = days[i];
    if (!day.isRest && day.circuit !== undefined && day.exercises !== undefined) {
      return {
        circuit: day.circuit,
        circuitId: day.circuitId,
        day: DAY_SHORTS[i] ?? '',
        exercises: day.exercises,
      };
    }
  }
  return null;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Insuffisance pondérale';
  if (bmi < 25) return 'Poids normal';
  if (bmi < 30) return 'Surpoids';
  return 'Obésité';
}

function getBmiColor(bmi: number): string {
  if (bmi < 18.5) return '#4ECDC4';
  if (bmi < 25) return '#cbff47';
  if (bmi < 30) return '#FFE66D';
  return '#FF6B6B';
}

function computeHealthStats(profile: HealthStatsInput): HealthStats {
  const heightM = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightM * heightM);
  const bmr =
    profile.gender === 'homme'
      ? Math.round(
          88.362 + 13.397 * profile.weightKg + 4.799 * profile.heightCm - 5.677 * profile.age,
        )
      : Math.round(
          447.593 + 9.247 * profile.weightKg + 3.098 * profile.heightCm - 4.33 * profile.age,
        );
  const idealWeight = Math.round(
    profile.gender === 'homme'
      ? profile.heightCm - 100 - (profile.heightCm - 150) / 4
      : profile.heightCm - 100 - (profile.heightCm - 150) / 2.5,
  );

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBmiCategory(bmi),
    bmiColor: getBmiColor(bmi),
    bmr,
    fcMax: 220 - profile.age,
    idealWeight,
  };
}

function computeGlobalStats(
  weeks: StatsWeek[],
  bodyParts: readonly string[],
  circuitMuscles: Record<string, readonly string[]>,
): GlobalStats {
  const pastWeeks = weeks.slice(1);
  const totalMin = pastWeeks.reduce((sum, week) => sum + week.stats.totalMin, 0);
  const totalSessions = pastWeeks.reduce((sum, week) => sum + week.stats.sessions, 0);
  const totalExerciseReps = pastWeeks.reduce((sum, week) => {
    const weekReps = week.days.reduce((daySum, day) => {
      if (day.isRest || !day.exercises) return daySum;
      return daySum + day.exercises;
    }, 0);
    return sum + weekReps;
  }, 0);
  const bodyPartCount: Record<string, number> = {};

  for (const part of bodyParts) {
    bodyPartCount[part] = 0;
  }

  for (const week of pastWeeks) {
    for (const day of week.days) {
      if (!day.isRest && day.circuit) {
        for (const muscle of circuitMuscles[day.circuit] ?? []) {
          bodyPartCount[muscle] = (bodyPartCount[muscle] ?? 0) + 1;
        }
      }
    }
  }

  return {
    bodyPartCount,
    maxCount: Math.max(...Object.values(bodyPartCount), 1),
    totalExerciseReps,
    totalMin,
    totalSessions,
  };
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

interface WeekData {
  isoWeek: number;
  year: number;
  days: DayProgram[];
  stats: { sessions: number; totalMin: number; volume: string };
}

interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  accentColor: string;
}

interface StatsWeek {
  days: StatsDay[];
  stats: { sessions: number; totalMin: number };
}
interface StatsDay {
  isRest: boolean;
  circuit?: string;
  exercises?: number;
}
interface NextSession {
  circuit: string;
  circuitId?: string;
  day: string;
  exercises: number;
}
interface NextSessionDay {
  isRest: boolean;
  circuit?: string;
  circuitId?: string;
  exercises?: number;
}
interface HealthStats {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  fcMax: number;
  bmr: number;
  idealWeight: number;
}

interface HealthStatsInput {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
}
interface GlobalStats {
  bodyPartCount: Record<string, number>;
  maxCount: number;
  totalExerciseReps: number;
  totalMin: number;
  totalSessions: number;
}
interface Exercise {
  id: string;
  name: string;
  description: string;
  tags: string[];
  color: string;
}
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

const defaultProfile: UserProfile = {
  accentColor: '#cbff47',
  age: 28,
  firstName: 'Alexandre',
  gender: 'homme',
  heightCm: 178,
  lastName: '',
  weightKg: 75,
};
const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
type Gender = 'homme' | 'femme';

const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

function getTodayIndex(date: Date = new Date()): number {
  return (getDay(date) + 6) % 7;
}

function getWeekStart(weekOffset: number, from: Date = new Date()): Date {
  return startOfWeek(addWeeks(from, -weekOffset), WEEK_START_OPTIONS);
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

function buildEmptyWeekDays(): DayProgram[] {
  return DAY_LABELS.map((day, i) => ({
    day,
    isRest: true,
    short: DAY_SHORTS[i],
  }));
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
  return findHistoryWeek(weekStart, WEEK_HISTORY)?.days ?? buildEmptyWeekDays();
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

function computeMonthStats(
  monthStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
  circuits: Circuit[],
): { sessions: number; totalMin: number; exercises: number } {
  const daysInMonth = eachDayOfInterval({
    end: endOfMonth(monthStart),
    start: monthStart,
  });
  let sessions = 0;
  let totalMin = 0;
  let exercises = 0;
  for (const date of daysInMonth) {
    const day = getDayProgram(date, weekPrograms);
    if (day.isRest) continue;
    sessions += 1;
    exercises += day.exercises ?? 0;
    const circuit = day.circuitId ? circuits.find((c) => c.id === day.circuitId) : undefined;
    if (circuit) totalMin += circuitDurationMin(circuit);
  }
  return { exercises, sessions, totalMin };
}

const initialCircuits: Circuit[] = [
  {
    color: '#FF6B35',
    cycles: 3,
    exerciseIds: ['4', '2', '1'],
    exerciseTime: 45,
    id: 'c1',
    name: 'Force Upper',
    prepTime: 10,
    recoveryTime: 90,
    restBetweenCycles: 60,
    restBetweenExercises: 15,
    rounds: 4,
  },
  {
    color: '#C62A47',
    cycles: 4,
    exerciseIds: ['1', '3', '6'],
    exerciseTime: 30,
    id: 'c2',
    name: 'Cardio HIIT',
    prepTime: 5,
    recoveryTime: 120,
    restBetweenCycles: 45,
    restBetweenExercises: 10,
    rounds: 6,
  },
  {
    color: '#1A936F',
    cycles: 3,
    exerciseIds: ['1', '2', '3', '4', '5', '6'],
    exerciseTime: 40,
    id: 'c3',
    name: 'Full Body',
    prepTime: 15,
    recoveryTime: 90,
    restBetweenCycles: 60,
    restBetweenExercises: 20,
    rounds: 4,
  },
];

const initialExercises: Exercise[] = [
  {
    color: '#FF6B35',
    description: 'Exercice full-body explosif enchaînant squat, pompe et saut vertical.',
    id: '1',
    name: 'Burpees',
    tags: ['Cardio', 'Jambes', 'Poitrine'],
  },
  {
    color: '#7B2D8B',
    description: 'Tirage vertical en suspension à la barre, travail du dos et biceps.',
    id: '2',
    name: 'Tractions',
    tags: ['Dos', 'Bras'],
  },
  {
    color: '#1A936F',
    description: 'Descente en squat profond avec impulsion explosive vers le haut.',
    id: '3',
    name: 'Squat sauté',
    tags: ['Jambes', 'Fessiers', 'Cardio'],
  },
  {
    color: '#C62A47',
    description: 'Poussée verticale avec haltères ou barre depuis les épaules.',
    id: '4',
    name: 'Développé militaire',
    tags: ['Épaules', 'Bras'],
  },
  {
    color: '#2E86AB',
    description: 'Maintien du corps en position rigide, renforcement profond des abdos.',
    id: '5',
    name: 'Gainage planche',
    tags: ['Abdos'],
  },
  {
    color: '#F18F01',
    description: 'Pas en avant avec descente du genou arrière, travail unilatéral.',
    id: '6',
    name: 'Fentes marchées',
    tags: ['Jambes', 'Fessiers'],
  },
];

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

type Screen = 'home' | 'weekly' | 'circuits' | 'create-circuit' | 'timer' | 'profile';

// ─── Constants ────────────────────────────────────────────────────────────────

const BODY_PARTS = ['shoulders', 'back', 'legs', 'abs', 'arms', 'chest', 'glutes', 'cardio'];

const TAG_COLORS: Record<string, AccentColor> = {
  abs: AccentColor.SALMON,
  arms: AccentColor.SAGE,
  back: AccentColor.TEAL,
  cardio: AccentColor.LIME,
  chest: AccentColor.SEAFOAM,
  glutes: AccentColor.BLUSH,
  legs: AccentColor.YELLOW,
  shoulders: AccentColor.CORAL,
};

const CIRCUIT_MUSCLES: Record<string, string[]> = {
  cardio_hiit: ['cardio', 'legs'],
  force_lower: ['legs', 'glutes'],
  force_upper: ['shoulders', 'back', 'arms', 'chest'],
  full_body: ['shoulders', 'back', 'legs', 'abs', 'arms', 'chest', 'glutes', 'cardio'],
  leg_day: ['legs', 'glutes'],
  mobility: ['back', 'shoulders', 'legs'],
  pull_day: ['back', 'arms'],
  push_day: ['shoulders', 'chest', 'arms'],
};

const TODAY_INDEX = getTodayIndex();

// ─── Shared Components ────────────────────────────────────────────────────────

const Tag = ({ label }: { label: string }) => (
  <span
    className="text-xs font-bold px-2.5 py-1 rounded-full"
    style={{
      backgroundColor: `${TAG_COLORS[label]}30`,
      border: `1px solid ${TAG_COLORS[label]}50`,
      color: TAG_COLORS[label],
    }}>
    {label}
  </span>
);

function Stepper({
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
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900 transition-all active:scale-90"
        style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
        onClick={() => {
          onChange(Math.max(min, value - step));
        }}>
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
        onClick={() => {
          onChange(value + step);
        }}>
        +
      </button>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({
  accent,
  currentWeekDays,
  onGoToProfile,
  onGoToTimer,
  onGoToWeekly,
  profile,
}: {
  onGoToTimer: () => void;
  onGoToWeekly: () => void;
  onGoToProfile: () => void;
  profile: UserProfile;
  currentWeekDays: DayProgram[];
  accent: string;
}) {
  const { bodyPartCount, maxCount, totalExerciseReps, totalMin, totalSessions } =
    computeGlobalStats(WEEK_HISTORY, BODY_PARTS, CIRCUIT_MUSCLES);
  const nextSession = getNextSession(currentWeekDays, TODAY_INDEX);
  const sparkData = WEEK_HISTORY.slice()
    .reverse()
    .map((w) => w.stats.totalMin);
  const sparkMax = Math.max(...sparkData);
  const sortedParts = [...BODY_PARTS].sort((a, b) => bodyPartCount[b] - bodyPartCount[a]);
  const totalHours = Math.floor(totalMin / 60);
  const totalMinsRem = totalMin % 60;
  const todayLabel = format(new Date(), "EEEE · dd MMM yyyy", { locale: fr });
  const todayHeading = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-800 tracking-widest uppercase" style={{ color: accent }}>
            {todayHeading}
          </p>
          <h1 className="text-3xl font-900 mt-1">Bonjour,</h1>
          <p className="text-3xl font-900" style={{ color: accent }}>
            {profile.firstName || 'Athlète'} 👊
          </p>
        </div>
        <button
          aria-label="Profil"
          className="w-10 h-10 rounded-full flex items-center justify-center mt-2 transition-all active:scale-90"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
          onClick={onGoToProfile}>
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
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95"
              style={{ backgroundColor: accent }}
              onClick={onGoToTimer}>
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
            { label: 'Entraîné', value: `${totalHours}h${totalMinsRem > 0 ? totalMinsRem : ''}` },
            { label: 'Séances', value: `${totalSessions}` },
            { label: 'Exercices', value: `${totalExerciseReps}` },
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
          {sparkData.map((val, i) => {
            const key = `sparkData-${i}`;
            return (
              <div key={key} className="flex-1">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    backgroundColor: i === sparkData.length - 1 ? accent : withAlpha(accent, 0.2),
                    height: `${Math.round((val / sparkMax) * 100)}%`,
                    minHeight: 4,
                  }}
                />
              </div>
            );
          })}
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
                      style={{ backgroundColor: TAG_COLORS[part], width: `${pct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="mx-5 mb-8 rounded-2xl py-3.5 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
        onClick={onGoToWeekly}>
        Voir le programme complet →
      </button>
    </div>
  );
}

// ─── Weekly Screen ────────────────────────────────────────────────────────────

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
              Tu modifies un jour passé (
              {format(dayDate, 'EEEE dd MMM yyyy', { locale: fr })}
              ) vers « {pendingLabel} ». Continuer ?
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

function WeeklyScreen({
  accent,
  circuits,
  onCreateCircuit,
  onStartTimer,
  onUpdateDay,
  weekPrograms,
}: {
  onStartTimer: () => void;
  circuits: Circuit[];
  weekPrograms: Record<string, DayProgram[]>;
  onUpdateDay: (weekStart: Date, dayIndex: number, day: DayProgram) => void;
  onCreateCircuit: () => void;
  accent: string;
}) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [assignIndex, setAssignIndex] = useState<number | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthAssignDate, setMonthAssignDate] = useState<Date | null>(null);

  const isCurrentWeek = weekOffset === 0;
  const isPastWeek = weekOffset > 0;
  const weekStart = getWeekStart(weekOffset);
  const historyWeek = findHistoryWeek(weekStart, WEEK_HISTORY);
  const weekDays = resolveWeekDays(weekStart, weekPrograms);
  const weekStats = isPastWeek ? historyWeek?.stats : undefined;
  const weekLabel = formatWeekLabel(weekStart);
  const weekDateRange = formatDateRange(weekStart);
  const dayNumbers = getWeekDayNumbers(weekStart);
  const todayCard = weekDays[TODAY_INDEX];
  const assignDayDate = assignIndex !== null ? addDays(weekStart, assignIndex) : null;

  const monthStart = getMonthStart(monthOffset);
  const monthGridDays = getMonthGridDays(monthStart);
  const monthStats = computeMonthStats(monthStart, weekPrograms, circuits);
  const today = new Date();
  const todayInMonth = isSameMonth(today, monthStart);
  const todayProgram = getDayProgram(today, weekPrograms);
  const focusDate = monthAssignDate ?? (todayInMonth ? today : monthStart);
  const focusDayName = format(focusDate, 'EEEE', { locale: fr });
  const focusDayTitle = format(focusDate, 'd MMMM yyyy', { locale: fr });
  const monthAssignWeekStart =
    monthAssignDate !== null ? startOfWeek(monthAssignDate, WEEK_START_OPTIONS) : null;
  const monthAssignDayIndex = monthAssignDate !== null ? getTodayIndex(monthAssignDate) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-3xl font-900">Programme</h1>
          <div
            className="mt-3 flex rounded-xl p-1"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {(
              [
                { id: 'week' as const, label: 'Semaine' },
                { id: 'month' as const, label: 'Mois' },
              ] as const
            ).map((tab) => {
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  className="flex-1 rounded-lg py-2 text-sm font-800 transition-all"
                  style={{
                    backgroundColor: active ? accent : 'transparent',
                    color: active ? '#0d0d0d' : '#888',
                  }}
                  onClick={() => {
                    setViewMode(tab.id);
                  }}>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === 'week' && (
          <>
            <div
              className="mx-5 mb-4 flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <button
                aria-label="Semaine précédente"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  setWeekOffset((o) => o + 1);
                }}>
                <IconChevronLeft />
              </button>
              <div className="text-center">
                <p className="font-900 text-sm" style={{ color: isCurrentWeek ? accent : '#f5f5f5' }}>
                  {weekLabel}
                </p>
                <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                  {weekDateRange}
                </p>
              </div>
              <button
                aria-label="Semaine suivante"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  setWeekOffset((o) => o - 1);
                }}>
                <IconChevronRight />
              </button>
            </div>

            {weekStats && (
              <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Séances', value: `${weekStats.sessions}` },
                  { label: 'Minutes', value: `${weekStats.totalMin}` },
                  { label: 'Volume', value: weekStats.volume },
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

            {isCurrentWeek && todayCard && !todayCard.isRest && (
              <div
                className="mx-5 mb-5 rounded-2xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)` }}>
                <div className="p-5 flex items-center justify-between">
                  <button
                    className="text-left flex-1 min-w-0"
                    onClick={() => {
                      setAssignIndex(TODAY_INDEX);
                    }}>
                    <p
                      className="text-xs font-800 tracking-widest uppercase"
                      style={{ color: '#0d0d0d90' }}>
                      Aujourd'hui · {DAY_LABELS[TODAY_INDEX]}
                    </p>
                    <h2 className="text-2xl font-900 mt-1" style={{ color: '#0d0d0d' }}>
                      {todayCard.circuit}
                    </h2>
                    <p className="text-sm font-700 mt-1" style={{ color: '#0d0d0d80' }}>
                      {todayCard.exercises} exercices · Modifier
                    </p>
                  </button>
                  <button
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                    style={{ backgroundColor: '#0d0d0d' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTimer();
                    }}>
                    <span style={{ color: accent, marginLeft: 3 }}>
                      <IconPlay />
                    </span>
                  </button>
                </div>
              </div>
            )}

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
                      border: isToday ? `1px solid ${withAlpha(accent, 0.25)}` : '1px solid #2a2a2a',
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

        {viewMode === 'month' && (
          <>
            <div className="px-5 mb-4">
              <p
                className="text-sm font-800 tracking-wide capitalize"
                style={{ color: accent }}>
                {focusDayName}
              </p>
              <p className="text-2xl font-900 mt-0.5 capitalize">{focusDayTitle}</p>
            </div>

            <div className="mx-5 mb-4 flex items-center justify-between">
              <button
                aria-label="Mois précédent"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  setMonthOffset((o) => o + 1);
                  setMonthAssignDate(null);
                }}>
                <IconChevronLeft />
              </button>
              <p className="font-900 text-sm" style={{ color: '#f5f5f5' }}>
                {formatMonthLabel(monthStart)}
              </p>
              <button
                aria-label="Mois suivant"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  setMonthOffset((o) => o - 1);
                  setMonthAssignDate(null);
                }}>
                <IconChevronRight />
              </button>
            </div>

            <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Séances', value: `${monthStats.sessions}` },
                { label: 'Minutes', value: `${monthStats.totalMin}` },
                { label: 'Exos', value: `${monthStats.exercises}` },
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

            <div className="px-5 mb-4">
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
                        const isSelected =
                          monthAssignDate !== null
                            ? isSameDay(date, monthAssignDate)
                            : isTodayCell && todayInMonth;
                        const program = getDayProgram(date, weekPrograms);
                        const circuitColor = program.circuitId
                          ? circuits.find((c) => c.id === program.circuitId)?.color
                          : undefined;
                        return (
                          <button
                            key={date.toISOString()}
                            className="flex flex-col items-center justify-center py-1.5 gap-0.5"
                            onClick={() => {
                              setMonthAssignDate(date);
                            }}>
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-800"
                              style={{
                                backgroundColor: isSelected ? accent : 'transparent',
                                color: isSelected
                                  ? '#0d0d0d'
                                  : inMonth
                                    ? '#ccc'
                                    : '#333',
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

            {todayInMonth && !todayProgram.isRest && (
              <div
                className="mx-5 mb-6 rounded-2xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)` }}>
                <div className="p-5 flex items-center justify-between">
                  <button
                    className="text-left flex-1 min-w-0"
                    onClick={() => {
                      setMonthAssignDate(today);
                    }}>
                    <p
                      className="text-xs font-800 tracking-widest uppercase"
                      style={{ color: '#0d0d0d90' }}>
                      Aujourd'hui · {DAY_LABELS[TODAY_INDEX]}
                    </p>
                    <h2 className="text-2xl font-900 mt-1" style={{ color: '#0d0d0d' }}>
                      {todayProgram.circuit}
                    </h2>
                    <p className="text-sm font-700 mt-1" style={{ color: '#0d0d0d80' }}>
                      {todayProgram.exercises} exercices · Modifier
                    </p>
                  </button>
                  <button
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                    style={{ backgroundColor: '#0d0d0d' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTimer();
                    }}>
                    <span style={{ color: accent, marginLeft: 3 }}>
                      <IconPlay />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {viewMode === 'week' && assignIndex !== null && assignDayDate && (
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

      {viewMode === 'month' &&
        monthAssignDate &&
        monthAssignWeekStart &&
        monthAssignDayIndex !== null && (
          <DayAssignSheet
            accent={accent}
            circuits={circuits}
            day={getDayProgram(monthAssignDate, weekPrograms)}
            dayDate={monthAssignDate}
            dayIndex={monthAssignDayIndex}
            requiresConfirmation={isPastCalendarDay(monthAssignDate)}
            onAssign={(d) => {
              onUpdateDay(monthAssignWeekStart, monthAssignDayIndex, d);
              setMonthAssignDate(null);
            }}
            onClose={() => {
              setMonthAssignDate(null);
            }}
            onCreateCircuit={() => {
              setMonthAssignDate(null);
              onCreateCircuit();
            }}
          />
        )}
    </div>
  );
}

// ─── Circuits Screen ──────────────────────────────────────────────────────────

function CircuitsScreen({
  accent,
  circuits,
  exercises,
  onCreateNew,
  onEdit,
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
          aria-label="Créer un circuit"
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: accent, color: '#0d0d0d' }}
          onClick={onCreateNew}>
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
              className="px-6 py-3.5 rounded-2xl font-900"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={onCreateNew}>
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
                    className="text-xs font-800 px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
                    style={{ backgroundColor: withAlpha(c.color, 0.12), color: c.color }}
                    onClick={() => {
                      onEdit(c.id);
                    }}>
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
  accent,
  exercises,
  initial,
  onBack,
  onSave,
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
        color,
        cycles,
        exerciseIds,
        exerciseTime,
        id: initial?.id ?? Date.now().toString(),
        name: name.trim(),
        prepTime,
        recoveryTime,
        restBetweenCycles,
        restBetweenExercises,
        rounds,
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
    { label: 'Préparation', onChange: setPrepTime, step: 5, unit: 'sec', value: prepTime },
    {
      label: "Temps d'exercice",
      onChange: setExerciseTime,
      step: 5,
      unit: 'sec',
      value: exerciseTime,
    },
    {
      label: 'Repos entre exercices',
      onChange: setRestBetweenExercises,
      step: 5,
      unit: 'sec',
      value: restBetweenExercises,
    },
    { label: 'Rounds / cycle', min: 1, onChange: setRounds, step: 1, unit: '×', value: rounds },
    { label: 'Nombre de cycles', min: 1, onChange: setCycles, step: 1, unit: '×', value: cycles },
    {
      label: 'Repos entre cycles',
      onChange: setRestBetweenCycles,
      step: 15,
      unit: 'sec',
      value: restBetweenCycles,
    },
    {
      label: 'Récupération finale',
      onChange: setRecoveryTime,
      step: 15,
      unit: 'sec',
      value: recoveryTime,
    },
  ];

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-5 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
            onClick={onBack}>
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
              className="w-full rounded-xl px-4 py-3.5 font-700 text-base outline-none"
              placeholder="Ex: Force Upper Body"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f5f5f5' }}
              type="text"
              value={name}
              onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
              onChange={(e) => {
                setName(e.target.value);
              }}
              onFocus={(e) => (e.target.style.borderColor = withAlpha(accent, 0.4))}
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
                  className="w-8 h-8 rounded-lg transition-all active:scale-90"
                  style={{
                    backgroundColor: c,
                    border: color === c ? '2.5px solid #fff' : '2.5px solid transparent',
                    transform: color === c ? 'scale(1.18)' : 'scale(1)',
                  }}
                  onClick={() => {
                    setColor(c);
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
                    min={row.min ?? 0}
                    step={row.step}
                    unit={row.unit}
                    value={row.value}
                    onChange={row.onChange}
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
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-900"
                        style={{ backgroundColor: '#2a2a2a', color: i > 0 ? '#888' : '#333' }}
                        onClick={() => {
                          moveExercise(i, -1);
                        }}>
                        ↑
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-900"
                        style={{
                          backgroundColor: '#2a2a2a',
                          color: i < exerciseIds.length - 1 ? '#888' : '#333',
                        }}
                        onClick={() => {
                          moveExercise(i, 1);
                        }}>
                        ↓
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-900 leading-none"
                        style={{ backgroundColor: '#2a2a2a', color: '#FF6B6B' }}
                        onClick={() => {
                          setExerciseIds(exerciseIds.filter((id) => id !== e.id));
                        }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              className="w-full rounded-xl py-3 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px dashed ${withAlpha(accent, 0.3)}`,
                color: accent,
              }}
              onClick={() => {
                setShowPicker(true);
              }}>
              <IconPlus /> Ajouter des exercices
            </button>
          </div>

          {/* Save */}
          <button
            className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            disabled={!name.trim() || saved}
            style={{
              backgroundColor: saved ? '#8bcf00' : name.trim() ? accent : '#2a2a2a',
              color: name.trim() ? '#0d0d0d' : '#555',
            }}
            onClick={handleSave}>
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none"
                style={{ backgroundColor: '#2a2a2a', color: '#888' }}
                onClick={() => {
                  setShowPicker(false);
                }}>
                ×
              </button>
            </div>
            <div className="overflow-y-auto space-y-2">
              {exercises.map((e) => {
                const selected = exerciseIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all"
                    style={{
                      backgroundColor: selected ? withAlpha(e.color, 0.1) : '#1a1a1a',
                      border: `1px solid ${selected ? withAlpha(e.color, 0.4) : '#2a2a2a'}`,
                    }}
                    onClick={() => {
                      setExerciseIds(
                        selected ? exerciseIds.filter((id) => id !== e.id) : [...exerciseIds, e.id],
                      );
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
              className="mt-4 w-full rounded-2xl py-3.5 font-900 shrink-0"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={() => {
                setShowPicker(false);
              }}>
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
  accent,
  circuit,
  exercises,
  onBack,
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
            }
            if (cycle >= TOTAL_CYCLES && round >= TOTAL_ROUNDS) {
              setIsRunning(false);
              setDone(true);
              return 0;
            }
            if (cycle >= TOTAL_CYCLES) {
              setRound((r) => r + 1);
              setCycle(1);
            } else {
              setCycle((c) => c + 1);
            }
            setIsWork(true);
            return WORK_TIME;
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
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a' }}
          onClick={onBack}>
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
          className="text-xs font-800 px-3 py-2 rounded-full"
          style={{ backgroundColor: '#1a1a1a', color: '#888' }}
          onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="px-5 flex gap-3 mb-6">
        {[
          { color: accent, label: 'Rounds', total: TOTAL_ROUNDS, value: round },
          { color: '#fff', label: 'Cycles', total: TOTAL_CYCLES, value: cycle },
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
          <svg height="210" style={{ transform: 'rotate(-90deg)' }} width="210">
            <circle cx="105" cy="105" fill="none" r="88" stroke="#2a2a2a" strokeWidth="8" />
            <circle
              cx="105"
              cy="105"
              fill="none"
              r="88"
              stroke={isWork ? accent : '#FF6B35'}
              strokeDasharray={`${circumference * progress} ${circumference}`}
              strokeLinecap="round"
              strokeWidth="8"
              style={{ transition: 'stroke-dasharray 0.5s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-900 leading-none"
              style={{ color: done ? accent : '#fff', fontSize: 54 }}>
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
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
          onClick={() => {
            setCycle((c) => Math.max(1, c - 1));
            setSeconds(WORK_TIME);
            setIsWork(true);
          }}>
          <span style={{ transform: 'scaleX(-1)' }}>
            <IconSkip />
          </span>
        </button>
        <button
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          style={{ backgroundColor: accent, color: '#0d0d0d' }}
          onClick={() => {
            done ? handleReset() : setIsRunning((r) => !r);
          }}>
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
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
          onClick={() => {
            if (cycle < TOTAL_CYCLES) setCycle((c) => c + 1);
            else if (round < TOTAL_ROUNDS) {
              setRound((r) => r + 1);
              setCycle(1);
            }
            setSeconds(WORK_TIME);
            setIsWork(true);
          }}>
          <IconSkip />
        </button>
      </div>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

function ProfileScreen({
  onBack,
  onSave,
  profile,
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState(profile);
  const health = computeHealthStats(draft);
  const update = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-5 flex items-center gap-4">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
          onClick={() => {
            onSave(draft);
            onBack();
          }}>
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
              className="w-full px-4 py-3.5 font-700 text-base outline-none"
              placeholder="Prénom"
              style={{
                backgroundColor: 'transparent',
                borderBottom: '1px solid #2a2a2a',
                color: '#f5f5f5',
              }}
              type="text"
              value={draft.firstName}
              onChange={(e) => {
                update('firstName', e.target.value);
              }}
            />
            <input
              className="w-full px-4 py-3.5 font-700 text-base outline-none"
              placeholder="Nom"
              style={{ backgroundColor: 'transparent', color: '#f5f5f5' }}
              type="text"
              value={draft.lastName}
              onChange={(e) => {
                update('lastName', e.target.value);
              }}
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
                className="flex-1 py-3.5 rounded-xl font-800 capitalize transition-all active:scale-95"
                style={{
                  backgroundColor: draft.gender === g ? draft.accentColor : '#1a1a1a',
                  border: draft.gender === g ? 'none' : '1px solid #2a2a2a',
                  color: draft.gender === g ? '#0d0d0d' : '#666',
                }}
                onClick={() => {
                  update('gender', g);
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
                key: 'age' as const,
                label: 'Âge',
                min: 10,
                step: 1,
                unit: 'ans',
                value: draft.age,
              },
              {
                key: 'heightCm' as const,
                label: 'Taille',
                min: 100,
                step: 1,
                unit: 'cm',
                value: draft.heightCm,
              },
              {
                key: 'weightKg' as const,
                label: 'Poids',
                min: 30,
                step: 1,
                unit: 'kg',
                value: draft.weightKg,
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
                  min={row.min}
                  step={row.step}
                  unit={row.unit}
                  value={row.value}
                  onChange={(v) => {
                    update(row.key, v);
                  }}
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
                  style={{ backgroundColor: `${health.bmiColor}25`, color: health.bmiColor }}>
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
                    border: `2.5px solid ${health.bmiColor}`,
                    left: `clamp(0%, calc(${Math.min(100, Math.max(0, ((health.bmi - 16) / (40 - 16)) * 100))}% - 7px), calc(100% - 7px))`,
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
              { label: 'FC max estimée', sub: '220 − âge', value: `${health.fcMax} bpm` },
              {
                label: 'Métabolisme de base',
                sub: 'Harris-Benedict',
                value: `${health.bmr} kcal/j`,
              },
              {
                label: 'Poids idéal',
                sub: 'Formule de Lorentz',
                value: `${health.idealWeight} kg`,
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
                className="w-10 h-10 rounded-xl transition-all active:scale-90"
                style={{
                  backgroundColor: c,
                  border: draft.accentColor === c ? '3px solid #fff' : '3px solid transparent',
                  transform: draft.accentColor === c ? 'scale(1.15)' : 'scale(1)',
                }}
                onClick={() => {
                  update('accentColor', c);
                }}
              />
            ))}
          </div>
        </div>

        <button
          className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95"
          style={{ backgroundColor: draft.accentColor, color: '#0d0d0d' }}
          onClick={() => {
            onSave(draft);
            onBack();
          }}>
          Enregistrer le profil
        </button>
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

function BottomNav({
  accent,
  onNavigate,
  screen,
}: {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  accent: string;
}) {
  const items: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { icon: <IconHome />, id: 'home', label: 'Accueil' },
    { icon: <IconCalendar />, id: 'weekly', label: 'Programme' },
    { icon: <IconDumbbell />, id: 'circuits', label: 'Circuits' },
    { icon: <IconFlash />, id: 'timer', label: 'Séance' },
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
            className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
            onClick={() => {
              onNavigate(item.id);
            }}>
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
  const [weekPrograms, setWeekPrograms] = useState<Record<string, DayProgram[]>>(() => {
    const currentStart = getWeekStart(0);
    return { [getWeekKey(currentStart)]: WEEK_HISTORY[0].days };
  });
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', profile.accentColor);
  }, [profile.accentColor]);

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const handleBack = () => {
    setScreen(prevScreen === screen ? 'home' : prevScreen);
  };

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

  const handleUpdateDay = (weekStart: Date, dayIndex: number, day: DayProgram) => {
    const key = getWeekKey(weekStart);
    setWeekPrograms((prev) => {
      const base = prev[key] ?? resolveWeekDays(weekStart, prev);
      return {
        ...prev,
        [key]: base.map((d, idx) => (idx === dayIndex ? day : d)),
      };
    });
  };

  const currentWeekDays = resolveWeekDays(getWeekStart(0), weekPrograms);

  const todayCircuit = currentWeekDays[TODAY_INDEX]?.circuitId
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
          backgroundColor: '#0d0d0d',
          boxShadow: '0 0 80px #00000080',
          height: 'min(100vh, 844px)',
          width: 'min(100vw, 390px)',
        }}>
        <div className="flex-1 overflow-hidden relative">
          {screen === 'home' && (
            <HomeScreen
              accent={accent}
              currentWeekDays={currentWeekDays}
              profile={profile}
              onGoToProfile={() => {
                navigate('profile');
              }}
              onGoToTimer={() => {
                navigate('timer');
              }}
              onGoToWeekly={() => {
                navigate('weekly');
              }}
            />
          )}
          {screen === 'weekly' && (
            <WeeklyScreen
              accent={accent}
              circuits={circuits}
              weekPrograms={weekPrograms}
              onCreateCircuit={() => {
                goToCreateCircuit();
              }}
              onStartTimer={() => {
                navigate('timer');
              }}
              onUpdateDay={handleUpdateDay}
            />
          )}
          {screen === 'circuits' && (
            <CircuitsScreen
              accent={accent}
              circuits={circuits}
              exercises={exercises}
              onCreateNew={() => {
                goToCreateCircuit();
              }}
              onEdit={(id) => {
                goToCreateCircuit(id);
              }}
            />
          )}
          {screen === 'create-circuit' && (
            <CreateCircuitScreen
              accent={accent}
              exercises={exercises}
              initial={editingCircuit}
              onBack={handleBack}
              onSave={handleSaveCircuit}
            />
          )}
          {screen === 'timer' && (
            <TimerScreen
              accent={accent}
              circuit={todayCircuit}
              exercises={exercises}
              onBack={handleBack}
            />
          )}
          {screen === 'profile' && (
            <ProfileScreen profile={profile} onBack={handleBack} onSave={setProfile} />
          )}
        </div>
        {!noNav && <BottomNav accent={accent} screen={screen} onNavigate={navigate} />}
      </div>
    </div>
  );
}
