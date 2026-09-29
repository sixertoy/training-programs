import { useWeeklyScreen } from './use-weekly-screen.hook';
import { WeeklyScreen } from './weekly-screen.component';

export function WeeklyScreenPage() {
  const props = useWeeklyScreen();
  return <WeeklyScreen {...props} />;
}
