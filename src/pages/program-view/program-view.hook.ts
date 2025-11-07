import { useCallback, useEffect, useState } from 'react';

import { useProgram } from '../../contexts/program';

type TimerState = 'idle' | 'exercise' | 'rest' | 'finished';

interface TimerStatus {
  state: TimerState;
  currentSeries: number;
  currentExerciseIndex: number;
  remainingSeconds: number;
}

export const useProgramView = (programId: string, isRunning: boolean) => {
  const { getProgramById } = useProgram();
  const program = getProgramById(programId);

  const [timerStatus, setTimerStatus] = useState<TimerStatus>({
    currentExerciseIndex: 0,
    currentSeries: 1,
    remainingSeconds: 0,
    state: 'idle',
  });

  useEffect(() => {
    if (!isRunning || !program) {
      setTimerStatus({
        currentExerciseIndex: 0,
        currentSeries: 1,
        remainingSeconds: 0,
        state: 'idle',
      });
      return;
    }

    if (timerStatus.state === 'idle') {
      const firstExercise = program.exercises[0];
      const seconds =
        firstExercise.format === 'time' ? firstExercise.value : firstExercise.value * 3; // Estimation: 3 secondes par répétition
      setTimerStatus({
        currentExerciseIndex: 0,
        currentSeries: 1,
        remainingSeconds: seconds,
        state: 'exercise',
      });
    }
  }, [isRunning, program, timerStatus.state]);

  useEffect(() => {
    if (!isRunning || timerStatus.state === 'idle' || timerStatus.state === 'finished') {
      return;
    }

    if (timerStatus.remainingSeconds <= 0) {
      if (timerStatus.state === 'exercise') {
        // Passer au repos ou à l'exercice suivant
        if (
          timerStatus.currentExerciseIndex === program!.exercises.length - 1 &&
          timerStatus.currentSeries === program!.seriesCount
        ) {
          // Programme terminé
          setTimerStatus(prev => ({ ...prev, state: 'finished' }));
        } else if (timerStatus.currentExerciseIndex === program!.exercises.length - 1) {
          // Dernier exercice de la série, passer au repos puis série suivante
          setTimerStatus(prev => ({
            ...prev,
            remainingSeconds: program!.restTimeSeconds,
            state: 'rest',
          }));
        } else {
          // Passer à l'exercice suivant
          const nextExercise = program!.exercises[timerStatus.currentExerciseIndex + 1];
          const seconds =
            nextExercise.format === 'time' ? nextExercise.value : nextExercise.value * 3;
          setTimerStatus(prev => ({
            ...prev,
            currentExerciseIndex: prev.currentExerciseIndex + 1,
            remainingSeconds: seconds,
            state: 'exercise',
          }));
        }
      } else if (timerStatus.state === 'rest') {
        // Repos terminé, passer à la série suivante
        const firstExercise = program!.exercises[0];
        const seconds =
          firstExercise.format === 'time' ? firstExercise.value : firstExercise.value * 3;
        setTimerStatus(prev => ({
          ...prev,
          currentExerciseIndex: 0,
          currentSeries: prev.currentSeries + 1,
          remainingSeconds: seconds,
          state: 'exercise',
        }));
      }
      return;
    }

    const interval = setInterval(() => {
      setTimerStatus(prev => ({
        ...prev,
        remainingSeconds: prev.remainingSeconds - 1,
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, timerStatus, program]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getCurrentExercise = () => {
    if (!program || timerStatus.currentExerciseIndex >= program.exercises.length) {
      return null;
    }
    return program.exercises[timerStatus.currentExerciseIndex];
  };

  return {
    formatTime,
    getCurrentExercise,
    program,
    timerStatus,
  };
};
