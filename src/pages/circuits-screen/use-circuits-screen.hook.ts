import { useNavigate } from 'react-router';

import { resolveRoutePath } from '../../config';
import { useApp } from '../../contexts';
import type { CircuitsScreenProps } from './circuits-screen.component';

export function useCircuitsScreen(): CircuitsScreenProps {
  const navigate = useNavigate();
  const { circuits, exercises } = useApp();

  return {
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
