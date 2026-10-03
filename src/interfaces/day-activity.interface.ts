import type { ActivityCategory, FlowKind, TrainingKind } from '../enums';

export interface DayActivity {
  id: string;
  category: ActivityCategory;
  name: string;
  color: string;
  circuitId?: string;
  exercises?: number;
  trainingKind?: TrainingKind;
  distanceKm?: number;
  durationMin?: number;
  isInterval?: boolean;
  flowKind?: FlowKind;
}

export interface DayProgram {
  day: string;
  short: string;
  isRest: boolean;
  activities: DayActivity[];
}
