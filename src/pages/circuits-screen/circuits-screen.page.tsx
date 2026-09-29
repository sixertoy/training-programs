import { CircuitsScreen } from './circuits-screen.component';
import { useCircuitsScreen } from './use-circuits-screen.hook';

export function CircuitsScreenPage() {
  const props = useCircuitsScreen();
  return <CircuitsScreen {...props} />;
}
