import { ActivityCategory, FlowKind, TrainingKind } from '../enums';
import type { DayActivity, DayProgram } from '../interfaces';

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  [ActivityCategory.FLOW]: 'Flow',
  [ActivityCategory.RUNNING]: 'Running',
  [ActivityCategory.TRAINING]: 'Training',
};

export const FLOW_KIND_LABELS: Record<FlowKind, string> = {
  [FlowKind.STRETCHING]: 'Étirements',
  [FlowKind.STRENGTHENING]: 'Renforcement',
  [FlowKind.YOGA]: 'Yoga',
};

export const DEFAULT_ACTIVITY_COLORS: Record<ActivityCategory, string> = {
  [ActivityCategory.FLOW]: '#A8E6CF',
  [ActivityCategory.RUNNING]: '#74C0FC',
  [ActivityCategory.TRAINING]: '#FF6B35',
};

interface CircuitLike {
  id: string;
  name: string;
  color: string;
  exerciseIds: string[];
  prepTime: number;
  exerciseTime: number;
  restBetweenExercises: number;
  rounds: number;
  cycles: number;
  restBetweenCycles: number;
  recoveryTime: number;
}

export function circuitDurationMin(circuit: CircuitLike): number {
  const restAfterExercises = Math.max(0, circuit.rounds - 1) * circuit.restBetweenExercises;
  const workPerCycle = circuit.rounds * circuit.exerciseTime + restAfterExercises;
  const interCycleRests = Math.max(0, circuit.cycles - 1) * circuit.restBetweenCycles;
  return Math.max(
    1,
    Math.round(
      (circuit.prepTime + circuit.cycles * workPerCycle + interCycleRests + circuit.recoveryTime) /
        60,
    ),
  );
}

export function createTrainingActivity(
  circuit: CircuitLike,
  trainingKind: TrainingKind = TrainingKind.CIRCUIT,
): DayActivity {
  return {
    category: ActivityCategory.TRAINING,
    circuitId: circuit.id,
    color: circuit.color,
    exercises: circuit.exerciseIds.length,
    id: `training-${circuit.id}-${Date.now()}`,
    name: circuit.name,
    trainingKind,
  };
}

export function createRunningActivity(input: {
  name: string;
  color?: string;
  distanceKm?: number;
  durationMin?: number;
  isInterval: boolean;
}): DayActivity {
  return {
    category: ActivityCategory.RUNNING,
    color: input.color ?? DEFAULT_ACTIVITY_COLORS[ActivityCategory.RUNNING],
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    id: `running-${Date.now()}`,
    isInterval: input.isInterval,
    name: input.name,
  };
}

export function createFlowActivity(input: {
  name: string;
  flowKind: FlowKind;
  durationMin?: number;
  color?: string;
}): DayActivity {
  return {
    category: ActivityCategory.FLOW,
    color: input.color ?? DEFAULT_ACTIVITY_COLORS[ActivityCategory.FLOW],
    durationMin: input.durationMin,
    flowKind: input.flowKind,
    id: `flow-${Date.now()}`,
    name: input.name,
  };
}

export function restDay(day: string, short: string): DayProgram {
  return { activities: [], day, isRest: true, short };
}

export function trainingDay(
  day: string,
  short: string,
  activity: Omit<DayActivity, 'category' | 'id'> & { id?: string },
): DayProgram {
  return {
    activities: [
      {
        ...activity,
        category: ActivityCategory.TRAINING,
        id: activity.id ?? `training-${short}-${activity.name}`,
        trainingKind: activity.trainingKind ?? TrainingKind.CIRCUIT,
      },
    ],
    day,
    isRest: false,
    short,
  };
}

export function dayWithActivities(
  day: string,
  short: string,
  activities: DayActivity[],
): DayProgram {
  return {
    activities,
    day,
    isRest: activities.length === 0,
    short,
  };
}

export function dayExerciseCount(day: DayProgram): number {
  return day.activities.reduce((sum, activity) => sum + (activity.exercises ?? 0), 0);
}

export function dayDurationMin(day: DayProgram, circuits: CircuitLike[]): number {
  return day.activities.reduce((sum, activity) => {
    if (activity.category === ActivityCategory.TRAINING && activity.circuitId) {
      const circuit = circuits.find((c) => c.id === activity.circuitId);
      return sum + (circuit ? circuitDurationMin(circuit) : (activity.durationMin ?? 0));
    }
    return sum + (activity.durationMin ?? 0);
  }, 0);
}

export function dayPrimaryLabel(day: DayProgram): string {
  if (day.isRest || day.activities.length === 0) return 'Repos';
  if (day.activities.length === 1) return day.activities[0].name;
  return `${day.activities[0].name} +${day.activities.length - 1}`;
}

export function daySummaryLabel(day: DayProgram): string {
  if (day.isRest || day.activities.length === 0) return 'Repos';
  if (day.activities.length === 1) {
    const activity = day.activities[0];
    if (activity.category === ActivityCategory.TRAINING) {
      return `${activity.exercises ?? 0} exercices`;
    }
    if (activity.category === ActivityCategory.RUNNING) {
      const parts: string[] = [];
      if (activity.distanceKm !== undefined) parts.push(`${activity.distanceKm} km`);
      if (activity.durationMin !== undefined) parts.push(`${activity.durationMin} min`);
      if (activity.isInterval) parts.push('Fractionné');
      return parts.join(' · ') || 'Running';
    }
    const kind = activity.flowKind ? FLOW_KIND_LABELS[activity.flowKind] : 'Flow';
    return activity.durationMin !== undefined ? `${kind} · ${activity.durationMin} min` : kind;
  }
  return `${day.activities.length} activités`;
}

export function firstTrainingCircuitId(day: DayProgram): string | undefined {
  return day.activities.find(
    (activity) =>
      activity.category === ActivityCategory.TRAINING && activity.circuitId !== undefined,
  )?.circuitId;
}

export function activityMetaLabel(activity: DayActivity, circuits: CircuitLike[]): string {
  if (activity.category === ActivityCategory.TRAINING) {
    const circuit = activity.circuitId
      ? circuits.find((c) => c.id === activity.circuitId)
      : undefined;
    if (circuit) {
      return `${circuit.exerciseIds.length} exo · ${circuit.rounds} rounds · ${circuit.cycles} cycles · ~${circuitDurationMin(circuit)} min`;
    }
    return `${activity.exercises ?? 0} exercices`;
  }
  if (activity.category === ActivityCategory.RUNNING) {
    const parts: string[] = [];
    if (activity.distanceKm !== undefined) parts.push(`${activity.distanceKm} km`);
    if (activity.durationMin !== undefined) parts.push(`${activity.durationMin} min`);
    if (activity.isInterval) parts.push('Fractionné');
    return parts.join(' · ') || 'Course';
  }
  const kind = activity.flowKind ? FLOW_KIND_LABELS[activity.flowKind] : 'Flow';
  return activity.durationMin !== undefined ? `${kind} · ${activity.durationMin} min` : kind;
}

export function isSameDayProgram(a: DayProgram, b: DayProgram): boolean {
  if (a.isRest && b.isRest) return true;
  if (a.isRest || b.isRest) return false;
  if (a.activities.length !== b.activities.length) return false;
  return a.activities.every((activity, index) => {
    const other = b.activities[index];
    return (
      activity.category === other.category &&
      activity.name === other.name &&
      activity.circuitId === other.circuitId &&
      activity.flowKind === other.flowKind &&
      activity.isInterval === other.isInterval &&
      activity.distanceKm === other.distanceKm &&
      activity.durationMin === other.durationMin
    );
  });
}

export function circuitMuscleKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}
