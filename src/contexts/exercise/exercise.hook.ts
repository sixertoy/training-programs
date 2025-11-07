import { useContext } from 'react';

import { ExerciseContext } from './exercise.provider';

export const useExercise = () => {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExercise must be used within an ExerciseProvider');
  }
  return context;
};
