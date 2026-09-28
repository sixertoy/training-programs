import type { DayProgram } from './day-program.interface';

export interface WeekData {
  label: string;
  dateRange: string;
  days: DayProgram[];
  stats: { sessions: number; totalMin: number; volume: string };
}
