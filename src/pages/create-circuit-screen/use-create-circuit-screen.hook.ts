import { useParams } from 'react-router';

import { useApp } from '../../contexts';
import { useGoBack } from '../../hooks';
import type { CreateCircuitScreenProps } from './create-circuit-screen.component';

export function useCreateCircuitScreen(): CreateCircuitScreenProps {
  const goBack = useGoBack();
  const { circuitId } = useParams();
  const { accent, circuits, exercises, saveCircuit } = useApp();

  const initial = circuitId ? circuits.find((circuit) => circuit.id === circuitId) : undefined;

  return {
    accent,
    exercises,
    initial,
    onBack: goBack,
    onSave: (circuit) => {
      saveCircuit(circuit);
    },
  };
}
