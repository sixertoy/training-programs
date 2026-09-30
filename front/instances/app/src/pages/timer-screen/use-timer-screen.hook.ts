import { useApp } from '../../contexts';
import { useGoBack } from '../../hooks';
import type { TimerScreenProps } from './timer-screen.component';

export function useTimerScreen(): TimerScreenProps {
  const goBack = useGoBack();
  const { accent, exercises, todayCircuit } = useApp();

  return {
    accent,
    circuit: todayCircuit,
    exercises,
    onBack: goBack,
  };
}
