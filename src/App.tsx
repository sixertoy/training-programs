import { addWeeks, format, getDay, getISOWeek, getISOWeekYear, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';

import {
  IconBack,
  IconFlash,
  IconGear,
  IconPause,
  IconPlay,
  IconPlus,
  IconRotateCcw,
  IconUser,
} from './assets/icons';
import AccentColorPicker from './AccentColorPicker';
import BottomNav from './BottomNav';
import freeTabataDefaults from './config/tabata-free.json';
import ProgrammePage from './ProgrammePage';
import { Gender, Screen, TabataMode, TimerPhase } from './enums';

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
function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + alpha;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').slice(0, 6);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  if (s === 0) {
    const v = l * 255;
    return rgbToHex(v, v, v);
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return rgbToHex(
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  );
}

function shiftAccentLightness(hex: string, amount = 0.28): string {
  const { h, s, l } = hexToHsl(hex);
  const nextL = clamp01(l > 0.5 ? l - amount : l + amount);
  return hslToHex(h, s, nextL);
}

/** Même famille que l’accent : décalage de teinte + luminosité (comme la préparation). */
function shiftAccentHue(hex: string, hueDeg: number, lightnessAmount = 0.28): string {
  const { h, s, l } = hexToHsl(hex);
  const nextH = ((((h * 360 + hueDeg) % 360) + 360) % 360) / 360;
  const nextL = clamp01(l > 0.5 ? l - lightnessAmount : l + lightnessAmount);
  return hslToHex(nextH, s, nextL);
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

function getBmiColor(bmi: number, accentColor: string): string {
  if (bmi < 18.5) return '#4ECDC4';
  if (bmi < 25) return accentColor;
  if (bmi < 30) return '#FFE66D';
  return '#FF6B6B';
}

function computeHealthStats(profile: HealthStatsInput & { accentColor: string }): HealthStats {
  const heightM = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightM * heightM);
  const bmr =
    profile.gender === Gender.MALE
      ? Math.round(
          88.362 + 13.397 * profile.weightKg + 4.799 * profile.heightCm - 5.677 * profile.age,
        )
      : Math.round(
          447.593 + 9.247 * profile.weightKg + 3.098 * profile.heightCm - 4.33 * profile.age,
        );
  const idealWeight = Math.round(
    profile.gender === Gender.MALE
      ? profile.heightCm - 100 - (profile.heightCm - 150) / 4
      : profile.heightCm - 100 - (profile.heightCm - 150) / 2.5,
  );

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBmiCategory(bmi),
    bmiColor: getBmiColor(bmi, profile.accentColor),
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
  const restAfterExercises = Math.max(0, circuit.rounds - 1) * circuit.restBetweenExercises;
  const workPerCycle = circuit.rounds * circuit.exerciseTime + restAfterExercises;
  const interCycleRests = Math.max(0, circuit.cycles - 1) * circuit.restBetweenCycles;
  return Math.max(
    1,
    Math.round(
      (circuit.prepTime + circuit.cycles * workPerCycle + interCycleRests + circuit.recoveryTime) /
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
  gender: Gender.MALE,
  heightCm: 178,
  lastName: '',
  weightKg: 75,
};
const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

function getTodayIndex(date: Date = new Date()): number {
  return (getDay(date) + 6) % 7;
}

function getWeekStart(weekOffset: number, from: Date = new Date()): Date {
  return startOfWeek(addWeeks(from, -weekOffset), WEEK_START_OPTIONS);
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
    description: 'Explosive full-body move chaining squat, push-up and vertical jump.',
    id: '1',
    name: 'Burpees',
    tags: ['cardio', 'legs', 'chest'],
  },
  {
    description: 'Vertical pull from a bar; back and biceps.',
    id: '2',
    name: 'Pull-ups',
    tags: ['back', 'arms'],
  },
  {
    description: 'Deep squat with an explosive jump upward.',
    id: '3',
    name: 'Jump squat',
    tags: ['legs', 'glutes', 'cardio'],
  },
  {
    description: 'Vertical press with dumbbells or barbell from the shoulders.',
    id: '4',
    name: 'Military press',
    tags: ['shoulders', 'arms'],
  },
  {
    description: 'Hold a rigid body position; deep core strengthening.',
    id: '5',
    name: 'Plank',
    tags: ['abs'],
  },
  {
    description: 'Forward step with rear knee drop; unilateral leg work.',
    id: '6',
    name: 'Walking lunges',
    tags: ['legs', 'glutes'],
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

const FREE_TABATA_DEFAULTS: CircuitTiming = freeTabataDefaults;

function createFreeTabataCircuit(accent: string): Circuit {
  return {
    ...FREE_TABATA_DEFAULTS,
    color: accent,
    exerciseIds: [],
    id: `free-${Date.now()}`,
    name: 'Tabata libre',
  };
}

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

function humanizeKey(key: string): string {
  if (!key) return key;
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
}

function exerciseColor(exercise: Exercise): string {
  return TAG_COLORS[exercise.tags[0]] ?? '#888';
}

// ─── Shared Components ────────────────────────────────────────────────────────

const Tag = ({ label }: { label: string }) => (
  <span
    className="text-xs font-bold px-2.5 py-1 rounded-full"
    style={{
      backgroundColor: `${TAG_COLORS[label]}30`,
      border: `1px solid ${TAG_COLORS[label]}50`,
      color: TAG_COLORS[label],
    }}>
    {humanizeKey(label)}
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
  onGoToFreeTabata,
  onGoToProfile,
  onGoToTimer,
  onGoToWeekly,
  profile,
}: {
  onGoToFreeTabata: () => void;
  onGoToTimer: () => void;
  onGoToWeekly: () => void;
  onGoToProfile: () => void;
  profile: UserProfile;
  currentWeekDays: DayProgram[];
  accent: string;
}) {
  const { bodyPartCount, maxCount, totalExerciseReps, totalMin, totalSessions } =
    computeGlobalStats(WEEK_HISTORY, BODY_PARTS, CIRCUIT_MUSCLES);
  const todayIndex = getTodayIndex();
  const nextSession = getNextSession(currentWeekDays, todayIndex);
  const sparkData = WEEK_HISTORY.slice()
    .reverse()
    .map((w) => w.stats.totalMin);
  const sparkMax = Math.max(...sparkData);
  const sortedParts = [...BODY_PARTS].sort((a, b) => bodyPartCount[b] - bodyPartCount[a]);
  const totalHours = Math.floor(totalMin / 60);
  const totalMinsRem = totalMin % 60;
  const todayLabel = format(new Date(), 'EEEE · dd MMM yyyy', { locale: fr });
  const todayHeading = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);
  const todayProgram = currentWeekDays[todayIndex];

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
          <IconUser />
        </button>
      </div>

      {todayProgram && (
        <div
          className="mx-5 mb-5 rounded-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)` }}>
          <div className="p-5 flex items-center justify-between">
            <button className="text-left flex-1 min-w-0" onClick={onGoToWeekly}>
              <p
                className="text-xs font-800 tracking-widest uppercase"
                style={{ color: '#0d0d0d90' }}>
                Aujourd'hui · {DAY_LABELS[todayIndex]}
              </p>
              <h2 className="text-2xl font-900 mt-1" style={{ color: '#0d0d0d' }}>
                {todayProgram.isRest ? 'Repos' : todayProgram.circuit}
              </h2>
              <p className="text-sm font-700 mt-1" style={{ color: '#0d0d0d80' }}>
                {todayProgram.isRest
                  ? 'Modifier'
                  : `${todayProgram.exercises} exercices · Modifier`}
              </p>
            </button>
            {!todayProgram.isRest && (
              <button
                aria-label="Lancer le tabata"
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                style={{ backgroundColor: '#0d0d0d' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onGoToTimer();
                }}>
                <span style={{ color: accent, marginLeft: 3 }}>
                  <IconPlay />
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      <button
        aria-label="Lancer un Tabata libre"
        className="mx-5 mb-5 rounded-2xl py-3.5 font-900 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ backgroundColor: accent, color: '#0d0d0d' }}
        onClick={onGoToFreeTabata}>
        <IconFlash />
        Lancer un Tabata libre
      </button>

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
                    {humanizeKey(part)}
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
                    {exs.map((e) => {
                      const color = exerciseColor(e);
                      return (
                        <div
                          key={e.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                          style={{ backgroundColor: withAlpha(color, 0.12) }}>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-800" style={{ color }}>
                            {e.name}
                          </span>
                        </div>
                      );
                    })}
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
  const [color, setColor] = useState(initial?.color ?? AccentColor.ORANGE);
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
            <AccentColorPicker value={color} onChange={setColor} />
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
            <p className="text-xs font-600 mt-2.5 leading-relaxed" style={{ color: '#666' }}>
              Le repos après le dernier round d&apos;un cycle est ignoré : il est inclus dans le
              repos entre cycles (ou la récupération finale pour le dernier cycle).
            </p>
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
                {selectedExercises.map((e, i) => {
                  const color = exerciseColor(e);
                  return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-900 text-sm shrink-0"
                      style={{ backgroundColor: withAlpha(color, 0.15), color }}>
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
                  );
                })}
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
                const color = exerciseColor(e);
                return (
                  <button
                    key={e.id}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all"
                    style={{
                      backgroundColor: selected ? withAlpha(color, 0.1) : '#1a1a1a',
                      border: `1px solid ${selected ? withAlpha(color, 0.4) : '#2a2a2a'}`,
                    }}
                    onClick={() => {
                      setExerciseIds(
                        selected ? exerciseIds.filter((id) => id !== e.id) : [...exerciseIds, e.id],
                      );
                    }}>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-900 shrink-0"
                      style={{ backgroundColor: withAlpha(color, 0.15), color }}>
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
                            {humanizeKey(t)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: color }}>
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

// ─── Tabata Screen ────────────────────────────────────────────────────────────

type TimerStep = {
  cycle: number;
  round: number;
  phase: TimerPhase;
  seconds: number;
  done: boolean;
};

type TimerDurations = {
  prepTime: number;
  workTime: number;
  restTime: number;
  interCycleRest: number;
  recoveryTime: number;
};

function getExerciseIndex(round: number, exerciseCount: number): number {
  return (round - 1) % Math.max(1, exerciseCount);
}

function phaseDuration(phase: TimerPhase, durations: TimerDurations): number {
  if (phase === TimerPhase.PREP) return durations.prepTime;
  if (phase === TimerPhase.WORK) return durations.workTime;
  if (phase === TimerPhase.REST) return durations.restTime;
  if (phase === TimerPhase.RECOVERY) return durations.recoveryTime;
  return durations.interCycleRest;
}

function advanceTimerStep(
  state: TimerStep,
  totalRounds: number,
  totalCycles: number,
  durations: TimerDurations,
): TimerStep {
  if (state.done) return state;

  const { workTime, restTime, interCycleRest, recoveryTime } = durations;

  if (state.phase === TimerPhase.PREP) {
    return { ...state, cycle: 1, phase: TimerPhase.WORK, round: 1, seconds: workTime };
  }

  if (state.phase === TimerPhase.WORK) {
    const isLastRound = state.round >= totalRounds;
    const isLastCycle = state.cycle >= totalCycles;

    // Repos après le dernier round ignoré : absorbé par le repos inter-cycle / la récupération.
    if (isLastRound) {
      if (!isLastCycle) {
        return { ...state, phase: TimerPhase.INTER_CYCLE_REST, seconds: interCycleRest };
      }
      if (recoveryTime > 0) {
        return { ...state, phase: TimerPhase.RECOVERY, seconds: recoveryTime };
      }
      return { ...state, done: true, seconds: 0 };
    }

    return { ...state, phase: TimerPhase.REST, seconds: restTime };
  }

  if (state.phase === TimerPhase.REST) {
    return {
      ...state,
      round: state.round + 1,
      phase: TimerPhase.WORK,
      seconds: workTime,
    };
  }

  if (state.phase === TimerPhase.RECOVERY) {
    return { ...state, done: true, seconds: 0 };
  }

  return {
    ...state,
    cycle: state.cycle + 1,
    round: 1,
    phase: TimerPhase.WORK,
    seconds: workTime,
  };
}

function TabataScreen({
  accent,
  circuit: circuitProp,
  exercises,
  mode,
  onClose,
}: {
  onClose: () => void;
  circuit: Circuit;
  exercises: Exercise[];
  accent: string;
  mode: TabataMode;
}) {
  const isFree = mode === TabataMode.FREE;
  const [localCircuit, setLocalCircuit] = useState<Circuit>(circuitProp);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [draft, setDraft] = useState<Circuit>(circuitProp);

  const PREP_TIME = localCircuit.prepTime;
  const WORK_TIME = localCircuit.exerciseTime;
  const REST_TIME = localCircuit.restBetweenExercises;
  const INTER_CYCLE_REST = localCircuit.restBetweenCycles;
  const RECOVERY_TIME = localCircuit.recoveryTime;
  const TOTAL_ROUNDS = localCircuit.rounds;
  const TOTAL_CYCLES = localCircuit.cycles;
  const durations: TimerDurations = {
    interCycleRest: INTER_CYCLE_REST,
    prepTime: PREP_TIME,
    recoveryTime: RECOVERY_TIME,
    restTime: REST_TIME,
    workTime: WORK_TIME,
  };
  const initialPhase: TimerPhase = PREP_TIME > 0 ? TimerPhase.PREP : TimerPhase.WORK;
  const initialSeconds = PREP_TIME > 0 ? PREP_TIME : WORK_TIME;

  const exerciseNames =
    localCircuit.exerciseIds.length > 0
      ? localCircuit.exerciseIds.map((id) => exercises.find((e) => e.id === id)?.name ?? 'Exercice')
      : ['Exercice'];

  const [cycle, setCycle] = useState(1);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<TimerPhase>(initialPhase);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const exerciseIndex = getExerciseIndex(round, exerciseNames.length);
  const phaseMax = phaseDuration(phase, durations);
  const isRestPhase =
    phase === TimerPhase.REST ||
    phase === TimerPhase.INTER_CYCLE_REST ||
    phase === TimerPhase.RECOVERY;
  const phaseColor =
    phase === TimerPhase.WORK
      ? accent
      : phase === TimerPhase.PREP
        ? shiftAccentLightness(accent)
        : phase === TimerPhase.RECOVERY
          ? shiftAccentHue(accent, -50)
          : shiftAccentHue(accent, 40);

  const resetTimer = (circuit: Circuit = localCircuit) => {
    const prep = circuit.prepTime;
    const work = circuit.exerciseTime;
    const startPhase: TimerPhase = prep > 0 ? TimerPhase.PREP : TimerPhase.WORK;
    setCycle(1);
    setRound(1);
    setPhase(startPhase);
    setSeconds(prep > 0 ? prep : work);
    setIsRunning(false);
    setDone(false);
    setElapsedSec(0);
    startedAtRef.current = null;
  };

  useEffect(() => {
    if (isRunning && !done) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            const next = advanceTimerStep(
              { cycle, round, phase, seconds: s, done },
              TOTAL_ROUNDS,
              TOTAL_CYCLES,
              durations,
            );
            setCycle(next.cycle);
            setRound(next.round);
            setPhase(next.phase);
            setDone(next.done);
            if (next.done) {
              setIsRunning(false);
              if (startedAtRef.current !== null) {
                setElapsedSec(Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)));
              }
            }
            return next.seconds;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    isRunning,
    phase,
    cycle,
    round,
    done,
    PREP_TIME,
    WORK_TIME,
    REST_TIME,
    INTER_CYCLE_REST,
    RECOVERY_TIME,
    TOTAL_ROUNDS,
    TOTAL_CYCLES,
  ]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDuration = (totalSec: number) =>
    `${pad(Math.floor(totalSec / 60))}:${pad(totalSec % 60)}`;
  const TIMER_R = 108;
  const TIMER_SIZE = 250;
  const TIMER_CX = TIMER_SIZE / 2;
  const progress = phaseMax > 0 ? seconds / phaseMax : 0;
  const circumference = 2 * Math.PI * TIMER_R;

  const handleReset = () => {
    resetTimer();
  };

  const handleResetConfig = () => {
    const resetCircuit: Circuit = {
      ...localCircuit,
      ...FREE_TABATA_DEFAULTS,
      exerciseIds: [],
    };
    setDraft(resetCircuit);
    setLocalCircuit(resetCircuit);
    setShowPicker(false);
    resetTimer(resetCircuit);
  };

  const handlePlayPause = () => {
    if (done) return;
    setIsRunning((running) => {
      if (!running && startedAtRef.current === null) {
        startedAtRef.current = Date.now();
      }
      return !running;
    });
  };

  const phaseLabel =
    phase === TimerPhase.PREP
      ? 'Préparation'
      : phase === TimerPhase.WORK
        ? 'Travail'
        : phase === TimerPhase.REST
          ? 'Repos'
          : phase === TimerPhase.RECOVERY
            ? 'Récupération'
            : 'Repos inter-cycle';

  const openSheet = () => {
    setDraft(localCircuit);
    setShowPicker(false);
    setSheetOpen(true);
  };

  const applyDraft = () => {
    setLocalCircuit(draft);
    setSheetOpen(false);
    setShowPicker(false);
    resetTimer(draft);
  };

  const draftDurationMin = circuitDurationMin(draft);
  const draftExercises = draft.exerciseIds
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];

  const nextExerciseName =
    phase === TimerPhase.PREP
      ? exerciseNames[0]
      : phase === TimerPhase.WORK
        ? exerciseNames[(exerciseIndex + 1) % exerciseNames.length]
        : exerciseNames[
            getExerciseIndex(round < TOTAL_ROUNDS ? round + 1 : 1, exerciseNames.length)
          ];

  const infoContext =
    phase === TimerPhase.PREP
      ? 'Préparation'
      : phase === TimerPhase.RECOVERY
        ? 'Fin de séance'
        : phase === TimerPhase.INTER_CYCLE_REST
          ? 'Entre cycles'
          : phase === TimerPhase.REST
            ? 'Repos'
            : 'Exercice actuel';

  const infoMain =
    phase === TimerPhase.PREP
      ? 'Préparez-vous'
      : isRestPhase
        ? 'Repos'
        : exerciseNames[exerciseIndex];

  const showNext =
    (phase === TimerPhase.PREP ||
      phase === TimerPhase.WORK ||
      phase === TimerPhase.REST ||
      phase === TimerPhase.INTER_CYCLE_REST) &&
    exerciseNames.length > 0;

  const timingRows: {
    key: keyof CircuitTiming;
    label: string;
    min?: number;
    step: number;
    unit: string;
  }[] = [
    { key: 'prepTime', label: 'Préparation', step: 5, unit: 'sec' },
    { key: 'exerciseTime', label: "Temps d'exercice", step: 5, unit: 'sec' },
    { key: 'restBetweenExercises', label: 'Repos entre exercices', step: 5, unit: 'sec' },
    { key: 'rounds', label: 'Rounds / cycle', min: 1, step: 1, unit: '×' },
    { key: 'cycles', label: 'Nombre de cycles', min: 1, step: 1, unit: '×' },
    { key: 'restBetweenCycles', label: 'Repos entre cycles', step: 15, unit: 'sec' },
    { key: 'recoveryTime', label: 'Récupération finale', step: 15, unit: 'sec' },
  ];

  const sheet = sheetOpen && (
    <div
      className="absolute inset-0 flex flex-col justify-end"
      style={{ backgroundColor: '#00000090', zIndex: 50 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSheetOpen(false);
      }}>
      <div
        className="rounded-t-3xl px-5 pt-5 pb-6 flex flex-col"
        style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '78%' }}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <p className="font-900 text-lg">Configuration</p>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none"
            style={{ backgroundColor: '#2a2a2a', color: '#888' }}
            onClick={() => {
              setSheetOpen(false);
            }}>
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-4 pr-0.5">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {timingRows.map((row, idx) => (
              <div
                key={row.key}
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
                  value={draft[row.key]}
                  onChange={(v) => {
                    setDraft((d) => ({ ...d, [row.key]: v }));
                  }}
                />
              </div>
            ))}
          </div>

          <p className="text-xs font-600 leading-relaxed" style={{ color: '#666' }}>
            Le repos après le dernier round d&apos;un cycle est ignoré : il est inclus dans le repos
            entre cycles (ou la récupération finale pour le dernier cycle).
          </p>

          <p className="text-xs font-700 text-right" style={{ color: '#555' }}>
            Durée estimée : ~{draftDurationMin} min
          </p>

          <div>
            <p
              className="text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Exercices ({draft.exerciseIds.length})
            </p>
            {draftExercises.length === 0 ? (
              <p className="text-sm font-600" style={{ color: '#555' }}>
                Aucun exercice sélectionné
              </p>
            ) : (
              <div className="space-y-2">
                {draftExercises.map((e, i) => {
                  const color = exerciseColor(e);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-900 text-sm shrink-0"
                        style={{ backgroundColor: withAlpha(color, 0.15), color }}>
                        {i + 1}
                      </div>
                      <p className="font-800 text-sm flex-1 min-w-0 truncate">{e.name}</p>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-900 leading-none"
                        style={{ backgroundColor: '#2a2a2a', color: '#FF6B6B' }}
                        onClick={() => {
                          setDraft((d) => ({
                            ...d,
                            exerciseIds: d.exerciseIds.filter((id) => id !== e.id),
                          }));
                        }}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              className="w-full rounded-xl py-3 mt-3 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
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
        </div>

        <div className="shrink-0 mt-4 flex items-center gap-2">
          <button
            className="flex-1 rounded-2xl py-4 font-900 text-sm transition-all active:scale-95"
            style={{ backgroundColor: accent, color: '#0d0d0d' }}
            onClick={applyDraft}>
            Appliquer
          </button>
          {isFree && (
            <button
              aria-label="Reset"
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95"
              style={{ backgroundColor: '#1a1a1a', color: '#888' }}
              onClick={handleResetConfig}>
              <IconRotateCcw />
            </button>
          )}
        </div>
      </div>

      {showPicker && (
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{ backgroundColor: '#000000a0', zIndex: 60 }}
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
                const selected = draft.exerciseIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                    style={{
                      backgroundColor: selected ? withAlpha(accent, 0.12) : '#1a1a1a',
                      border: `1px solid ${selected ? withAlpha(accent, 0.35) : '#2a2a2a'}`,
                    }}
                    onClick={() => {
                      setDraft((d) => ({
                        ...d,
                        exerciseIds: selected
                          ? d.exerciseIds.filter((id) => id !== e.id)
                          : [...d.exerciseIds, e.id],
                      }));
                    }}>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: exerciseColor(e) }}
                    />
                    <span className="font-800 text-sm flex-1">{e.name}</span>
                    <span
                      className="text-xs font-900"
                      style={{ color: selected ? accent : '#444' }}>
                      {selected ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (done) {
    return (
      <div
        className="flex flex-col h-full relative"
        style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)' }}>
        <div className="px-5 pt-8 pb-4 text-center">
          <p className="font-900 text-sm" style={{ color: accent }}>
            {localCircuit.name}
          </p>
          <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
            Tabata terminé
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div
            className="rounded-2xl p-5 mb-4 text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p className="text-4xl font-900 mb-2" style={{ color: accent }}>
              ✓
            </p>
            <p className="text-xl font-900">Circuit complété</p>
            <p className="text-sm font-600 mt-2" style={{ color: '#888' }}>
              Durée {formatDuration(elapsedSec)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-2xl font-900" style={{ color: accent }}>
                {TOTAL_CYCLES}
              </p>
              <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
                Cycles
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-2xl font-900" style={{ color: '#fff' }}>
                {TOTAL_ROUNDS}
              </p>
              <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
                Rounds / cycle
              </p>
            </div>
          </div>

          <p
            className="text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: '#555' }}>
            Exercices
          </p>
          <div className="space-y-2 mb-6">
            {exerciseNames.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="rounded-xl px-4 py-3 font-800 text-sm"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                {name}
              </div>
            ))}
          </div>

          {isFree ? (
            <button
              className="w-full rounded-2xl py-4 font-900 text-sm transition-all active:scale-95"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={handleReset}>
              Recommencer
            </button>
          ) : (
            <button
              className="w-full rounded-2xl py-4 font-900 text-sm transition-all active:scale-95"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={onClose}>
              Fermer
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)' }}>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between gap-2">
        {isFree ? (
          <div className="w-10 shrink-0" />
        ) : (
          <button
            aria-label="Fermer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl leading-none font-900 shrink-0"
            style={{ backgroundColor: '#1a1a1a', color: '#888' }}
            onClick={onClose}>
            ×
          </button>
        )}
        <div className="text-center flex-1 min-w-0">
          <p className="font-900 text-sm truncate" style={{ color: accent }}>
            {localCircuit.name}
          </p>
          <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
            Tabata
          </p>
        </div>
        {isFree ? (
          <button
            aria-label="Configuration"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1a1a1a', color: '#888' }}
            onClick={openSheet}>
            <IconGear />
          </button>
        ) : (
          <div className="w-10 shrink-0" />
        )}
      </div>

      <div className="px-5 flex gap-3 mb-4">
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

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="relative">
          <svg height={TIMER_SIZE} style={{ transform: 'rotate(-90deg)' }} width={TIMER_SIZE}>
            <circle
              cx={TIMER_CX}
              cy={TIMER_CX}
              fill="none"
              r={TIMER_R}
              stroke="#2a2a2a"
              strokeWidth="8"
            />
            <circle
              cx={TIMER_CX}
              cy={TIMER_CX}
              fill="none"
              r={TIMER_R}
              stroke={phaseColor}
              strokeDasharray={`${circumference * progress} ${circumference}`}
              strokeLinecap="round"
              strokeWidth="8"
              style={{ transition: 'stroke-dasharray 0.5s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-900 leading-none" style={{ color: '#fff', fontSize: 64 }}>
              {`${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`}
            </span>
            <span
              className="text-xs font-900 tracking-widest uppercase px-4 py-1.5 rounded-full mt-3"
              style={{
                backgroundColor: withAlpha(phaseColor, 0.12),
                color: phaseColor,
              }}>
              {phaseLabel}
            </span>
          </div>
        </div>

        <div className="mt-8 w-full text-center px-5 py-5">
          <p className="text-xs font-800 tracking-widest uppercase mb-2" style={{ color: '#666' }}>
            {infoContext}
          </p>
          <p className="text-2xl font-900 leading-tight">{infoMain}</p>
          {showNext && (
            <p className="text-base font-700 mt-3" style={{ color: '#888' }}>
              {phase === TimerPhase.PREP ? 'Premier' : 'Suivant'} : {nextExerciseName}
            </p>
          )}
        </div>
      </div>

      <div className={`px-5 flex items-center justify-center ${isFree ? 'pb-4' : 'pb-10'}`}>
        <button
          aria-label={isRunning ? 'Pause' : 'Lecture'}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          style={{
            backgroundColor: phaseColor,
            color: '#0d0d0d',
            transition: 'background-color 0.3s ease, transform 0.15s ease',
          }}
          onClick={handlePlayPause}>
          {isRunning ? (
            <IconPause />
          ) : (
            <span style={{ marginLeft: 4 }}>
              <IconPlay />
            </span>
          )}
        </button>
      </div>

      {sheet}
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
            {([Gender.MALE, Gender.FEMALE] as const).map((g) => (
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
                {g === Gender.MALE ? 'Homme' : 'Femme'}
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
          <AccentColorPicker
            value={draft.accentColor}
            onChange={(c) => {
              update('accentColor', c);
            }}
          />
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

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [prevScreen, setPrevScreen] = useState<Screen>(Screen.HOME);
  const [exercises] = useState<Exercise[]>(initialExercises);
  const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits);
  const [weekPrograms, setWeekPrograms] = useState<Record<string, DayProgram[]>>(() => {
    const currentStart = getWeekStart(0);
    return { [getWeekKey(currentStart)]: WEEK_HISTORY[0].days };
  });
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);
  const [sessionCircuit, setSessionCircuit] = useState<Circuit | undefined>();
  const [tabataMode, setTabataMode] = useState<TabataMode>(TabataMode.FREE);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', profile.accentColor);
  }, [profile.accentColor]);

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const handleBack = () => {
    setScreen(prevScreen === screen ? Screen.HOME : prevScreen);
  };

  const openFreeTabata = () => {
    setTabataMode(TabataMode.FREE);
    setSessionCircuit(createFreeTabataCircuit(profile.accentColor));
    navigate(Screen.TABATA);
  };

  const startSession = (circuit?: Circuit) => {
    if (!circuit) return;
    setTabataMode(TabataMode.PLANNED);
    setSessionCircuit(circuit);
    navigate(Screen.TABATA);
  };

  const goToCreateCircuit = (id?: string) => {
    setEditingCircuitId(id ?? null);
    navigate(Screen.CREATE_CIRCUIT);
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
  const todayIndex = getTodayIndex();

  const todayCircuit = currentWeekDays[todayIndex]?.circuitId
    ? circuits.find((c) => c.id === currentWeekDays[todayIndex].circuitId)
    : undefined;

  const editingCircuit = editingCircuitId
    ? circuits.find((c) => c.id === editingCircuitId)
    : undefined;
  const accent = profile.accentColor;
  const noNav =
    screen === Screen.CREATE_CIRCUIT ||
    screen === Screen.PROFILE ||
    (screen === Screen.TABATA && tabataMode === TabataMode.PLANNED);

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
          {screen === Screen.HOME && (
            <HomeScreen
              accent={accent}
              currentWeekDays={currentWeekDays}
              profile={profile}
              onGoToFreeTabata={openFreeTabata}
              onGoToProfile={() => {
                navigate(Screen.PROFILE);
              }}
              onGoToTimer={() => {
                startSession(todayCircuit);
              }}
              onGoToWeekly={() => {
                navigate(Screen.WEEKLY);
              }}
            />
          )}
          {screen === Screen.WEEKLY && (
            <ProgrammePage
              accent={accent}
              circuits={circuits}
              weekPrograms={weekPrograms}
              onCreateCircuit={() => {
                goToCreateCircuit();
              }}
              onStartSession={(circuitId) => {
                startSession(circuits.find((c) => c.id === circuitId));
              }}
              onUpdateDay={handleUpdateDay}
            />
          )}
          {screen === Screen.CIRCUITS && (
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
          {screen === Screen.CREATE_CIRCUIT && (
            <CreateCircuitScreen
              accent={accent}
              exercises={exercises}
              initial={editingCircuit}
              onBack={handleBack}
              onSave={handleSaveCircuit}
            />
          )}
          {screen === Screen.TABATA && sessionCircuit && (
            <TabataScreen
              key={sessionCircuit.id}
              accent={accent}
              circuit={sessionCircuit}
              exercises={exercises}
              mode={tabataMode}
              onClose={handleBack}
            />
          )}
          {screen === Screen.PROFILE && (
            <ProfileScreen profile={profile} onBack={handleBack} onSave={setProfile} />
          )}
        </div>
        {!noNav && (
          <BottomNav
            accent={accent}
            screen={screen}
            onNavigate={(s) => {
              if (s === Screen.TABATA) {
                openFreeTabata();
                return;
              }
              navigate(s);
            }}
          />
        )}
      </div>
    </div>
  );
}
