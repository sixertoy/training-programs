import { useNavigate } from 'react-router';

import { useApp } from '../../contexts';
import type { TimerScreenProps } from './timer-screen.component';

export function useTimerScreen(): TimerScreenProps {
  const navigate = useNavigate();
  const { accent, exercises, todayCircuit } = useApp();

  return {
    accent,
    circuit: todayCircuit,
    exercises,
    onBack: () => {
      void navigate(-1);
    },
  };
}
