import { TimerScreen } from './timer-screen.component';
import { useTimerScreen } from './use-timer-screen.hook';

export function TimerScreenPage() {
  const props = useTimerScreen();
  return <TimerScreen {...props} />;
}
