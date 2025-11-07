import { useCallback, useState } from 'react';

import { useExercise } from '../../contexts/exercise';
import { useProgram } from '../../contexts/program';
import type { Exercise, ExerciseFormat, ExerciseInProgram } from '../../interfaces';

export const useCreateProgram = () => {
  const { exercises } = useExercise();
  const { addProgram } = useProgram();
  const [selectedExercises, setSelectedExercises] = useState<ExerciseInProgram[]>([]);

  const addExerciseToProgram = useCallback(
    (exercise: Exercise, format: ExerciseFormat, value: number) => {
      const exerciseInProgram: ExerciseInProgram = {
        exercise,
        format,
        value,
      };
      setSelectedExercises(prev => [...prev, exerciseInProgram]);
    },
    [],
  );

  const removeExerciseFromProgram = useCallback((index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateExerciseInProgram = useCallback(
    (index: number, format: ExerciseFormat, value: number) => {
      setSelectedExercises(prev =>
        prev.map((ex, i) => (i === index ? { ...ex, format, value } : ex)),
      );
    },
    [],
  );

  const saveProgram = useCallback(
    (name: string, seriesCount: number, restTimeSeconds: number) => {
      addProgram({
        exercises: selectedExercises,
        name,
        restTimeSeconds,
        seriesCount,
      });
      setSelectedExercises([]);
    },
    [selectedExercises, addProgram],
  );

  const reset = useCallback(() => {
    setSelectedExercises([]);
  }, []);

  return {
    addExerciseToProgram,
    exercises,
    removeExerciseFromProgram,
    reset,
    saveProgram,
    selectedExercises,
    updateExerciseInProgram,
  };
};
