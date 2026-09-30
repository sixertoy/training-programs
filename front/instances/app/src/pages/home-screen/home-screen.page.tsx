import { HomeScreen } from './home-screen.component';
import { useHomeScreen } from './use-home-screen.hook';

export function HomeScreenPage() {
  const props = useHomeScreen();
  return <HomeScreen {...props} />;
}
