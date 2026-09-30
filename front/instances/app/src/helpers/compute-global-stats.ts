import type { GlobalStats } from '../interfaces/global-stats.interface';
import type { StatsWeek } from '../interfaces/stats-week.interface';

export function computeGlobalStats(
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
