import { useApp } from '../../contexts';
import type { WeeklyScreenProps } from './weekly-screen.component';

export function useWeeklyScreen(): WeeklyScreenProps {
  const { accent, circuits, currentWeekDays, updateDay } = useApp();

  return {
    accent,
    circuits,
    currentWeekDays,
    onUpdateDay: updateDay,
  };
}
