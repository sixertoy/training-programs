import type { ExerciceTypeEnum } from '../enums';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciceTypeEnum;
  description: string;
}
