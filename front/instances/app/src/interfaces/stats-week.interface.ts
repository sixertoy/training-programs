import type { StatsDay } from './stats-day.interface';

export interface StatsWeek {
  days: StatsDay[];
  stats: { sessions: number; totalMin: number };
}
