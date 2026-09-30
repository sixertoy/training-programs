import { AccentColor } from '../enums';
import type { UserProfile } from '../interfaces/user-profile.interface';

export const defaultProfile: UserProfile = {
  accentColor: AccentColor.LIME,
  age: 28,
  firstName: 'Alexandre',
  gender: 'homme',
  heightCm: 178,
  lastName: '',
  weightKg: 75,
};
