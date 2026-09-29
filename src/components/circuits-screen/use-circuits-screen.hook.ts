import { useNavigate } from 'react-router';

import { resolveRoutePath } from '../../config';
import { useApp } from '../../contexts';
import type { CircuitsScreenProps } from './circuits-screen.component';

export function useCircuitsScreen(): CircuitsScreenProps {
  const navigate = useNavigate();
  const { accent, circuits, exercises } = useApp();

  return {
    accent,
    circuits,
    exercises,
    onCreateNew: () => {
      void navigate(resolveRoutePath('create-circuit'));
    },
    onEdit: (id) => {
      void navigate(resolveRoutePath('edit-circuit', { circuitId: id }));
    },
  };
}
