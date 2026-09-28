export interface DayProgram {
  day: string;
  short: string;
  isRest: boolean;
  circuit?: string;
  circuitId?: string;
  exercises?: number;
}
