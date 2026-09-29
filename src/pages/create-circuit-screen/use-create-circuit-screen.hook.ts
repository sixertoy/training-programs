import { useNavigate, useParams } from 'react-router';

import { useApp } from '../../contexts';
import type { CreateCircuitScreenProps } from './create-circuit-screen.component';

export function useCreateCircuitScreen(): CreateCircuitScreenProps {
  const navigate = useNavigate();
  const { circuitId } = useParams();
  const { accent, circuits, exercises, saveCircuit } = useApp();

  const initial = circuitId ? circuits.find((circuit) => circuit.id === circuitId) : undefined;

  return {
    accent,
    exercises,
    initial,
    onBack: () => {
      void navigate(-1);
    },
    onSave: (circuit) => {
      saveCircuit(circuit);
    },
  };
}
