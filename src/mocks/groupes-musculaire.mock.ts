import { AccentColor } from '../enums';
import type { MuscleGroup } from '../interfaces/muscle-group.interface';
import muscleGroupsData from './groupes-musculaire.json';

function toAccentColor(key: string): AccentColor {
  if (Object.hasOwn(AccentColor, key)) {
    return AccentColor[key as keyof typeof AccentColor];
  }
  return AccentColor.LIME;
}

export const MUSCLE_GROUPS: MuscleGroup[] = muscleGroupsData.map((group) => ({
  color: toAccentColor(group.color),
  id: group.id,
  key: group.key,
  name: group.name,
}));

export function findMuscleGroup(id: string): MuscleGroup | undefined {
  return MUSCLE_GROUPS.find((group) => group.id === id);
}

export function muscleGroupColor(name: string): string | undefined {
  return MUSCLE_GROUPS.find((group) => group.name === name)?.color;
}
