import { CreateCircuitScreen } from './create-circuit-screen.component';
import { useCreateCircuitScreen } from './use-create-circuit-screen.hook';

export function CreateCircuitScreenPage() {
  const props = useCreateCircuitScreen();
  return <CreateCircuitScreen {...props} />;
}
