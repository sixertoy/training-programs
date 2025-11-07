import type { Exercise } from './exercise.interface';

export type ExerciseFormat = 'reps' | 'time';

export interface ExerciseInProgram {
  exercise: Exercise;
  format: ExerciseFormat;
  value: number; // Nombre de répétitions ou secondes
}
