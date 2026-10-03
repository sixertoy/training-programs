import type { ActivityCategory, FlowKind, TabataMode } from '../enums';

export interface BaseActivity<TCategory extends ActivityCategory, TMeta> {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly category: TCategory;
  readonly meta: TMeta;
}

export interface FlowMeta {
  readonly flowKind: FlowKind;
  readonly durationMin?: number;
}

export interface RunningMeta {
  readonly isInterval: boolean;
  readonly distanceKm?: number;
  readonly durationMin?: number;
}

export interface TrainingMeta {
  readonly tabataMode: TabataMode;
  readonly circuitId?: string;
  readonly exercises?: number;
}

export type FlowActivity = BaseActivity<ActivityCategory.FLOW, FlowMeta>;

export type RunningActivity = BaseActivity<ActivityCategory.RUNNING, RunningMeta>;

export type TrainingActivity = BaseActivity<ActivityCategory.TRAINING, TrainingMeta>;

export type DayActivity = FlowActivity | RunningActivity | TrainingActivity;

export interface DayProgram {
  readonly day: string;
  readonly short: string;
  readonly isRest: boolean;
  readonly activities: readonly DayActivity[];
}
