import type { NextSession } from '../interfaces/next-session.interface';
import type { NextSessionDay } from '../interfaces/next-session-day.interface';

const DAY_SHORTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function getNextSession(days: NextSessionDay[], todayIndex: number): NextSession | null {
  for (let i = todayIndex + 1; i < days.length; i += 1) {
    const day = days[i];
    if (!day.isRest && day.circuit !== undefined && day.exercises !== undefined) {
      return {
        circuit: day.circuit,
        circuitId: day.circuitId,
        day: DAY_SHORTS[i] ?? '',
        exercises: day.exercises,
      };
    }
  }
  return null;
}
