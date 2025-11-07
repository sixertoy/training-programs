import type { ExerciseTypeEnum } from '../enums';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseTypeEnum;
  description: string;
}
