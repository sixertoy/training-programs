import { ActivityCategory, FlowKind, TabataMode } from '../enums';
import { t } from '../i18n';
import type { DayActivity, DayProgram, TrainingMeta } from '../interfaces';

export function activityCategoryLabel(category: ActivityCategory): string {
  return t(`activity.category.${category}`);
}

export function flowKindLabel(kind: FlowKind): string {
  return t(`activity.flowKind.${kind}`);
}

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  get [ActivityCategory.FLOW]() {
    return activityCategoryLabel(ActivityCategory.FLOW);
  },
  get [ActivityCategory.RUNNING]() {
    return activityCategoryLabel(ActivityCategory.RUNNING);
  },
  get [ActivityCategory.TRAINING]() {
    return activityCategoryLabel(ActivityCategory.TRAINING);
  },
};

export const FLOW_KIND_LABELS: Record<FlowKind, string> = {
  get [FlowKind.STRETCHING]() {
    return flowKindLabel(FlowKind.STRETCHING);
  },
  get [FlowKind.STRENGTHENING]() {
    return flowKindLabel(FlowKind.STRENGTHENING);
  },
  get [FlowKind.YOGA]() {
    return flowKindLabel(FlowKind.YOGA);
  },
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

type TrainingActivity = Extract<DayActivity, { category: ActivityCategory.TRAINING }>;

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
  tabataMode: TabataMode = TabataMode.PLANNED,
): TrainingActivity {
  return {
    category: ActivityCategory.TRAINING,
    color: circuit.color,
    id: `training-${circuit.id}-${Date.now()}`,
    meta: {
      circuitId: circuit.id,
      exercises: circuit.exerciseIds.length,
      tabataMode,
    },
    name: circuit.name,
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
    id: `running-${Date.now()}`,
    meta: {
      distanceKm: input.distanceKm,
      durationMin: input.durationMin,
      isInterval: input.isInterval,
    },
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
    id: `flow-${Date.now()}`,
    meta: {
      durationMin: input.durationMin,
      flowKind: input.flowKind,
    },
    name: input.name,
  };
}

export function restDay(day: string, short: string): DayProgram {
  return { activities: [], day, isRest: true, short };
}

export function trainingDay(
  day: string,
  short: string,
  activity: {
    id?: string;
    name: string;
    color: string;
    meta?: Partial<TrainingMeta>;
  },
): DayProgram {
  return {
    activities: [
      {
        category: ActivityCategory.TRAINING,
        color: activity.color,
        id: activity.id ?? `training-${short}-${activity.name}`,
        meta: {
          circuitId: activity.meta?.circuitId,
          exercises: activity.meta?.exercises,
          tabataMode: activity.meta?.tabataMode ?? TabataMode.PLANNED,
        },
        name: activity.name,
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
  return day.activities.reduce((sum, activity) => {
    if (activity.category !== ActivityCategory.TRAINING) return sum;
    return sum + (activity.meta.exercises ?? 0);
  }, 0);
}

export function dayDurationMin(day: DayProgram, circuits: CircuitLike[]): number {
  return day.activities.reduce((sum, activity) => {
    if (activity.category === ActivityCategory.TRAINING) {
      if (activity.meta.circuitId) {
        const circuit = circuits.find((c) => c.id === activity.meta.circuitId);
        return sum + (circuit ? circuitDurationMin(circuit) : 0);
      }
      return sum;
    }
    return sum + (activity.meta.durationMin ?? 0);
  }, 0);
}

export function dayPrimaryLabel(day: DayProgram): string {
  if (day.isRest || day.activities.length === 0) return t('activity.rest');
  if (day.activities.length === 1) return day.activities[0].name;
  return t('activity.andMore', {
    count: day.activities.length - 1,
    name: day.activities[0].name,
  });
}

export function daySummaryLabel(day: DayProgram): string {
  if (day.isRest || day.activities.length === 0) return t('activity.rest');
  if (day.activities.length === 1) {
    const activity = day.activities[0];
    if (activity.category === ActivityCategory.TRAINING) {
      return t('activity.exercises', { count: activity.meta.exercises ?? 0 });
    }
    if (activity.category === ActivityCategory.RUNNING) {
      const parts: string[] = [];
      if (activity.meta.distanceKm !== undefined) {
        parts.push(t('activity.distanceKm', { count: activity.meta.distanceKm }));
      }
      if (activity.meta.durationMin !== undefined) {
        parts.push(t('activity.durationMin', { count: activity.meta.durationMin }));
      }
      if (activity.meta.isInterval) parts.push(t('activity.interval'));
      return parts.join(' · ') || t('activity.running');
    }
    const kind = flowKindLabel(activity.meta.flowKind);
    return activity.meta.durationMin !== undefined
      ? t('activity.flowWithDuration', { duration: activity.meta.durationMin, kind })
      : kind;
  }
  return t('activity.activities', { count: day.activities.length });
}

export function firstTrainingActivity(day: DayProgram): TrainingActivity | undefined {
  return day.activities.find(
    (activity): activity is TrainingActivity => activity.category === ActivityCategory.TRAINING,
  );
}

export function firstTrainingCircuitId(day: DayProgram): string | undefined {
  return firstTrainingActivity(day)?.meta.circuitId;
}

export function activityMetaLabel(activity: DayActivity, circuits: CircuitLike[]): string {
  if (activity.category === ActivityCategory.TRAINING) {
    const circuit = activity.meta.circuitId
      ? circuits.find((c) => c.id === activity.meta.circuitId)
      : undefined;
    if (circuit) {
      return t('activity.meta.trainingCircuit', {
        cycles: circuit.cycles,
        duration: circuitDurationMin(circuit),
        exercises: circuit.exerciseIds.length,
        rounds: circuit.rounds,
      });
    }
    return t('activity.exercises', { count: activity.meta.exercises ?? 0 });
  }
  if (activity.category === ActivityCategory.RUNNING) {
    const parts: string[] = [];
    if (activity.meta.distanceKm !== undefined) {
      parts.push(t('activity.distanceKm', { count: activity.meta.distanceKm }));
    }
    if (activity.meta.durationMin !== undefined) {
      parts.push(t('activity.durationMin', { count: activity.meta.durationMin }));
    }
    if (activity.meta.isInterval) parts.push(t('activity.interval'));
    return parts.join(' · ') || t('activity.course');
  }
  const kind = flowKindLabel(activity.meta.flowKind);
  return activity.meta.durationMin !== undefined
    ? t('activity.flowWithDuration', { duration: activity.meta.durationMin, kind })
    : kind;
}

export function isSameDayProgram(a: DayProgram, b: DayProgram): boolean {
  if (a.isRest && b.isRest) return true;
  if (a.isRest || b.isRest) return false;
  if (a.activities.length !== b.activities.length) return false;
  return a.activities.every((activity, index) => {
    const other = b.activities[index];
    if (activity.category !== other.category || activity.name !== other.name) return false;
    if (
      activity.category === ActivityCategory.TRAINING &&
      other.category === ActivityCategory.TRAINING
    ) {
      return (
        activity.meta.circuitId === other.meta.circuitId &&
        activity.meta.tabataMode === other.meta.tabataMode
      );
    }
    if (
      activity.category === ActivityCategory.RUNNING &&
      other.category === ActivityCategory.RUNNING
    ) {
      return (
        activity.meta.isInterval === other.meta.isInterval &&
        activity.meta.distanceKm === other.meta.distanceKm &&
        activity.meta.durationMin === other.meta.durationMin
      );
    }
    if (activity.category === ActivityCategory.FLOW && other.category === ActivityCategory.FLOW) {
      return (
        activity.meta.flowKind === other.meta.flowKind &&
        activity.meta.durationMin === other.meta.durationMin
      );
    }
    return false;
  });
}

export function circuitMuscleKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}
