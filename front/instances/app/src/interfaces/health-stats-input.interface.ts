import type { Gender } from '../types/gender.type';

export interface HealthStatsInput {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
}
