import type { ExerciseInProgram } from './exercise-in-program.interface';

export interface Program {
  id: string;
  name: string;
  seriesCount: number;
  restTimeSeconds: number;
  exercises: ExerciseInProgram[];
  createdAt: string;
}
