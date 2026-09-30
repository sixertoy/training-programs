import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { TODAY_INDEX } from '../../constants/program.constants';
import type { Circuit, DayProgram, Exercise, UserProfile } from '../../interfaces';
import { defaultProfile, initialCircuits, initialExercises, WEEK_HISTORY } from '../../mocks';
import { AppContext, type AppContextValue } from './app.context';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [exercises] = useState<Exercise[]>(initialExercises);
  const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits);
  const [currentWeekDays, setCurrentWeekDays] = useState<DayProgram[]>(WEEK_HISTORY[0].days);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', profile.accentColor);
  }, [profile.accentColor]);

  const saveCircuit = useCallback((circuit: Circuit) => {
    setCircuits((prev) => {
      const exists = prev.some((entry) => entry.id === circuit.id);
      return exists
        ? prev.map((entry) => (entry.id === circuit.id ? circuit : entry))
        : [circuit, ...prev];
    });
  }, []);

  const updateDay = useCallback((index: number, day: DayProgram) => {
    setCurrentWeekDays((prev) => prev.map((entry, idx) => (idx === index ? day : entry)));
  }, []);

  const todayCircuit = currentWeekDays[TODAY_INDEX].circuitId
    ? circuits.find((circuit) => circuit.id === currentWeekDays[TODAY_INDEX].circuitId)
    : undefined;

  const value = useMemo<AppContextValue>(
    () => ({
      accent: profile.accentColor,
      circuits,
      currentWeekDays,
      exercises,
      profile,
      saveCircuit,
      saveProfile: setProfile,
      todayCircuit,
      updateDay,
    }),
    [circuits, currentWeekDays, exercises, profile, saveCircuit, todayCircuit, updateDay],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
