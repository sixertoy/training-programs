import { useNavigate } from 'react-router';

import { resolveRoutePath } from '../../config';
import { useApp } from '../../contexts';
import type { WeeklyScreenProps } from './weekly-screen.component';

export function useWeeklyScreen(): WeeklyScreenProps {
  const navigate = useNavigate();
  const { accent, circuits, currentWeekDays, updateDay } = useApp();

  return {
    accent,
    circuits,
    currentWeekDays,
    onCreateCircuit: () => {
      void navigate(resolveRoutePath('create-circuit'));
    },
    onStartTimer: () => {
      void navigate(resolveRoutePath('timer'));
    },
    onUpdateDay: updateDay,
  };
}
