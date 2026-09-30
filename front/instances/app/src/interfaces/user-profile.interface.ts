import type { Gender } from '../types/gender.type';

export interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  accentColor: string;
}
