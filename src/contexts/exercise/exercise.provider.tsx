import React, { createContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import type { Exercise } from '../../interfaces';

interface ExerciseContextValue {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
}

export const ExerciseContext = createContext<ExerciseContextValue | undefined>(undefined);

interface ExerciseProviderProps {
  children: React.ReactNode;
}

export const ExerciseProvider = ({ children }: ExerciseProviderProps) => {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('training-programs-exercises', []);

  const addExercise = useCallback(
    (exercise: Omit<Exercise, 'id'>) => {
      const newExercise: Exercise = {
        ...exercise,
        id: uuidv4(),
      };
      setExercises(prev => [...prev, newExercise]);
    },
    [setExercises],
  );

  const updateExercise = useCallback(
    (id: string, exercise: Omit<Exercise, 'id'>) => {
      setExercises(prev => prev.map(ex => (ex.id === id ? { ...exercise, id } : ex)));
    },
    [setExercises],
  );

  const deleteExercise = useCallback(
    (id: string) => {
      setExercises(prev => prev.filter(ex => ex.id !== id));
    },
    [setExercises],
  );

  const getExerciseById = useCallback(
    (id: string) => {
      return exercises.find(ex => ex.id === id);
    },
    [exercises],
  );

  const value = useMemo(
    () => ({
      addExercise,
      deleteExercise,
      exercises,
      getExerciseById,
      updateExercise,
    }),
    [exercises, addExercise, updateExercise, deleteExercise, getExerciseById],
  );

  return <ExerciseContext.Provider value={value}>{children}</ExerciseContext.Provider>;
};

ExerciseProvider.displayName = 'ExerciseProvider';
