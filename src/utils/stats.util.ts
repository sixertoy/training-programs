import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  getISOWeek,
  getISOWeekYear,
  isBefore,
  isSameDay,
  setISOWeek,
  setISOWeekYear,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';

import type { WeekData } from '../data/week-history';
import { ActivityCategory } from '../enums';
import type { DayActivity, DayProgram } from '../interfaces';
import {
  ACTIVITY_CATEGORY_LABELS,
  circuitDurationMin,
  dayDurationMin,
  DEFAULT_ACTIVITY_COLORS,
} from './activity.util';

export interface DatedDay {
  date: Date;
  program: DayProgram;
}

export interface CircuitLike {
  id: string;
  name: string;
  color: string;
  exerciseIds: string[];
  prepTime: number;
  exerciseTime: number;
  restBetweenExercises: number;
  rounds: number;
  cycles: number;
  restBetweenCycles: number;
  recoveryTime: number;
}

export type StreakAlertLevel = 'safe' | 'warning' | 'danger' | 'lost';

export interface StreakAlert {
  level: StreakAlertLevel;
  message: string;
  graceUsed: number;
  graceLeft: number;
}

export const MET_BY_CATEGORY: Record<ActivityCategory, number> = {
  [ActivityCategory.FLOW]: 3,
  [ActivityCategory.RUNNING]: 8,
  [ActivityCategory.TRAINING]: 5,
};

function getWeekKey(weekStart: Date): string {
  return `${getISOWeekYear(weekStart)}-W${getISOWeek(weekStart)}`;
}

export function dateFromIsoWeek(year: number, isoWeek: number, dayIndex: number): Date {
  let cursor = new Date(year, 5, 15);
  cursor = setISOWeekYear(cursor, year);
  cursor = setISOWeek(cursor, isoWeek);
  return addDays(startOfISOWeek(cursor), dayIndex);
}

export function isValidStreakDay(program: DayProgram): boolean {
  return program.isRest || program.activities.length > 0;
}

export function flattenDatedDays(
  weekHistory: WeekData[],
  weekPrograms: Record<string, DayProgram[]>,
): DatedDay[] {
  const byKey = new Map<string, DayProgram[]>();

  for (const week of weekHistory) {
    const weekStart = dateFromIsoWeek(week.year, week.isoWeek, 0);
    byKey.set(getWeekKey(weekStart), week.days);
  }

  for (const [key, days] of Object.entries(weekPrograms)) {
    byKey.set(key, days);
  }

  const dated: DatedDay[] = [];
  for (const [key, days] of byKey.entries()) {
    const match = /^(\d{4})-W(\d+)$/.exec(key);
    if (!match) {
      // skip malformed keys
    } else {
      const year = Number(match[1]);
      const isoWeek = Number(match[2]);
      days.forEach((program, dayIndex) => {
        dated.push({
          date: startOfDay(dateFromIsoWeek(year, isoWeek, dayIndex)),
          program,
        });
      });
    }
  }

  return dated.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function findProgramOnDate(datedDays: DatedDay[], date: Date): DayProgram | undefined {
  const target = startOfDay(date);
  return datedDays.find((entry) => isSameDay(entry.date, target))?.program;
}

export function computeStreakDays(
  datedDays: DatedDay[],
  today: Date,
  graceDays: number,
): { streak: number; graceUsed: number } {
  if (datedDays.length === 0) return { graceUsed: 0, streak: 0 };

  const earliest = datedDays[0].date;
  let streak = 0;
  let graceUsed = 0;
  let cursor = startOfDay(today);
  let done = false;

  while (!done && !isBefore(cursor, earliest)) {
    const program = findProgramOnDate(datedDays, cursor);
    const valid = program ? isValidStreakDay(program) : false;

    if (valid) {
      streak += 1;
      cursor = subDays(cursor, 1);
    } else if (graceUsed < graceDays) {
      graceUsed += 1;
      streak += 1;
      cursor = subDays(cursor, 1);
    } else {
      done = true;
    }
  }

  return { graceUsed, streak };
}

export function computeStreakWeeks(datedDays: DatedDay[], today: Date, graceDays: number): number {
  if (datedDays.length === 0) return 0;

  let weeks = 0;
  let cursorWeekStart = startOfISOWeek(today);
  const earliest = startOfISOWeek(datedDays[0].date);
  let done = false;

  while (!done && !isBefore(cursorWeekStart, earliest)) {
    const weekEnd = addDays(cursorWeekStart, 6);
    const rangeEnd = isBefore(today, weekEnd) ? startOfDay(today) : weekEnd;
    const daysInWeek = eachDayOfInterval({ end: rangeEnd, start: cursorWeekStart });

    let graceUsed = 0;
    let weekOk = true;
    for (const day of daysInWeek) {
      const program = findProgramOnDate(datedDays, day);
      const valid = program ? isValidStreakDay(program) : false;
      if (!valid) {
        if (graceUsed < graceDays) {
          graceUsed += 1;
        } else {
          weekOk = false;
        }
      }
    }

    if (weekOk) {
      weeks += 1;
      cursorWeekStart = subDays(cursorWeekStart, 7);
    } else {
      done = true;
    }
  }

  return weeks;
}

export function computeStreakAlert(
  datedDays: DatedDay[],
  today: Date,
  graceDays: number,
  dayStreak: number,
): StreakAlert {
  const { graceUsed } = computeStreakDays(datedDays, today, graceDays);
  const graceLeft = Math.max(0, graceDays - graceUsed);
  const todayProgram = findProgramOnDate(datedDays, today);
  const todayValid = todayProgram ? isValidStreakDay(todayProgram) : false;

  if (dayStreak === 0) {
    const recentlyActive = datedDays.some(
      (entry) => differenceInCalendarDays(today, entry.date) <= 7,
    );
    if (recentlyActive && !todayValid) {
      return {
        graceLeft: 0,
        graceUsed,
        level: 'lost',
        message: 'Série perdue — reprends aujourd’hui pour en démarrer une nouvelle',
      };
    }
  }

  if (!todayValid && dayStreak > 0 && graceLeft <= 1) {
    return {
      graceLeft,
      graceUsed,
      level: 'danger',
      message: 'Plus que quelques heures pour sauver ta série',
    };
  }

  if (!todayValid && dayStreak > 0 && graceUsed > 0 && graceLeft > 1) {
    return {
      graceLeft,
      graceUsed,
      level: 'warning',
      message: `Ta série de ${dayStreak} jours est en danger`,
    };
  }

  return {
    graceLeft,
    graceUsed,
    level: 'safe',
    message: '',
  };
}

export function computePersonalBestMonth(datedDays: DatedDay[], circuits: CircuitLike[]) {
  const totals = new Map<string, number>();

  for (const entry of datedDays) {
    if (entry.program.isRest) {
      // skip rest
    } else {
      const key = format(entry.date, 'yyyy-MM');
      totals.set(key, (totals.get(key) ?? 0) + dayDurationMin(entry.program, circuits));
    }
  }

  let bestKey = '';
  let bestMin = 0;
  for (const [key, minutes] of totals.entries()) {
    if (minutes > bestMin) {
      bestKey = key;
      bestMin = minutes;
    }
  }

  if (!bestKey || bestMin <= 0) {
    return { label: '—', totalMin: 0 };
  }

  const [year, month] = bestKey.split('-').map(Number);
  const label = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: fr });
  return {
    label: label.charAt(0).toUpperCase() + label.slice(1),
    totalMin: bestMin,
  };
}

function activityDurationMin(activity: DayActivity, circuits: CircuitLike[]): number {
  if (activity.category === ActivityCategory.TRAINING && activity.circuitId) {
    const circuit = circuits.find((c) => c.id === activity.circuitId);
    if (circuit) return circuitDurationMin(circuit);
  }
  return activity.durationMin ?? 0;
}

export function computeCaloriesBurned(
  datedDays: DatedDay[],
  weightKg: number,
  circuits: CircuitLike[],
): number {
  let kcal = 0;
  for (const entry of datedDays) {
    for (const activity of entry.program.activities) {
      const hours = activityDurationMin(activity, circuits) / 60;
      kcal += MET_BY_CATEGORY[activity.category] * weightKg * hours;
    }
  }
  return Math.round(kcal);
}

export function computeMonthlyVolume(
  datedDays: DatedDay[],
  circuits: CircuitLike[],
  months = 6,
  today: Date = new Date(),
): { key: string; label: string; totalMin: number }[] {
  const start = startOfMonth(subMonths(today, months - 1));
  const result: { key: string; label: string; totalMin: number }[] = [];

  for (let i = 0; i < months; i += 1) {
    const monthDate = addMonths(start, i);
    const key = format(monthDate, 'yyyy-MM');
    const label = format(monthDate, 'MMM', { locale: fr });
    result.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1), totalMin: 0 });
  }

  for (const entry of datedDays) {
    if (!isBefore(entry.date, start)) {
      const key = format(entry.date, 'yyyy-MM');
      const bucket = result.find((item) => item.key === key);
      if (bucket) {
        bucket.totalMin += dayDurationMin(entry.program, circuits);
      }
    }
  }

  return result;
}

export function computeCategoryTotals(datedDays: DatedDay[]): Record<ActivityCategory, number> {
  const totals: Record<ActivityCategory, number> = {
    [ActivityCategory.FLOW]: 0,
    [ActivityCategory.RUNNING]: 0,
    [ActivityCategory.TRAINING]: 0,
  };

  for (const entry of datedDays) {
    for (const activity of entry.program.activities) {
      totals[activity.category] += 1;
    }
  }

  return totals;
}

export function computeCategoryRatioLast30Days(
  datedDays: DatedDay[],
  today: Date = new Date(),
): { category: ActivityCategory; label: string; value: number; color: string }[] {
  const from = startOfDay(subDays(today, 29));
  const counts: Record<ActivityCategory, number> = {
    [ActivityCategory.FLOW]: 0,
    [ActivityCategory.RUNNING]: 0,
    [ActivityCategory.TRAINING]: 0,
  };

  for (const entry of datedDays) {
    if (!isBefore(entry.date, from)) {
      for (const activity of entry.program.activities) {
        counts[activity.category] += 1;
      }
    }
  }

  return (Object.keys(counts) as ActivityCategory[]).map((category) => ({
    category,
    color: DEFAULT_ACTIVITY_COLORS[category],
    label: ACTIVITY_CATEGORY_LABELS[category],
    value: counts[category],
  }));
}

export function computeRecoveryIndex(
  datedDays: DatedDay[],
  today: Date = new Date(),
): { needsRecovery: boolean; hardDays: number } {
  let hardDays = 0;
  let cursor = startOfDay(today);

  for (let i = 0; i < 14; i += 1) {
    const program = findProgramOnDate(datedDays, cursor);
    cursor = subDays(cursor, 1);

    if (!program || program.isRest || program.activities.length === 0) {
      if (hardDays > 0) break;
    } else {
      const hasFlow = program.activities.some((a) => a.category === ActivityCategory.FLOW);
      const hasHard = program.activities.some(
        (a) => a.category === ActivityCategory.TRAINING || a.category === ActivityCategory.RUNNING,
      );

      if (hasFlow) break;
      if (hasHard) {
        hardDays += 1;
      } else if (hardDays > 0) {
        break;
      }
    }
  }

  return { hardDays, needsRecovery: hardDays >= 4 };
}
