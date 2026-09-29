import { createContext } from 'react';

import type { Circuit, DayProgram, Exercise, UserProfile } from '../../interfaces';

export interface AppContextValue {
  accent: string;
  circuits: Circuit[];
  currentWeekDays: DayProgram[];
  exercises: Exercise[];
  profile: UserProfile;
  saveCircuit: (circuit: Circuit) => void;
  saveProfile: (profile: UserProfile) => void;
  todayCircuit: Circuit | undefined;
  updateDay: (index: number, day: DayProgram) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
