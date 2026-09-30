import { useApp } from '../../contexts';
import type { CircuitsScreenProps } from './circuits-screen.component';

export function useCircuitsScreen(): CircuitsScreenProps {
  const { circuits, exercises } = useApp();

  return {
    circuits,
    exercises,
  };
}
