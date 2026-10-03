import { ActivityCategory, FlowKind, TrainingKind } from '../enums';
import type { DayProgram } from '../interfaces';
import { dayWithActivities, DEFAULT_ACTIVITY_COLORS, restDay, trainingDay } from '../utils';

export interface WeekData {
  isoWeek: number;
  year: number;
  days: DayProgram[];
  stats: { sessions: number; totalMin: number; volume: string };
}

export const WEEK_HISTORY: WeekData[] = [
  {
    days: [
      trainingDay('Lundi', 'LUN', {
        circuitId: 'c1',
        color: '#FF6B35',
        exercises: 3,
        name: 'Force Upper',
      }),
      dayWithActivities('Mardi', 'MAR', [
        {
          category: ActivityCategory.TRAINING,
          circuitId: 'c2',
          color: '#C62A47',
          exercises: 3,
          id: 'training-mar-c2',
          name: 'Cardio HIIT',
          trainingKind: TrainingKind.CIRCUIT,
        },
        {
          category: ActivityCategory.RUNNING,
          color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.RUNNING],
          distanceKm: 5,
          durationMin: 28,
          id: 'running-mar-1',
          isInterval: true,
          name: 'Fractionné 5 km',
        },
      ]),
      restDay('Mercredi', 'MER'),
      trainingDay('Jeudi', 'JEU', {
        circuitId: 'c1',
        color: '#FF6B35',
        exercises: 3,
        name: 'Force Upper',
      }),
      dayWithActivities('Vendredi', 'VEN', [
        {
          category: ActivityCategory.TRAINING,
          circuitId: 'c3',
          color: '#1A936F',
          exercises: 6,
          id: 'training-ven-c3',
          name: 'Full Body',
          trainingKind: TrainingKind.CIRCUIT,
        },
        {
          category: ActivityCategory.FLOW,
          color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.FLOW],
          durationMin: 20,
          flowKind: FlowKind.YOGA,
          id: 'flow-ven-1',
          name: 'Yoga recovery',
        },
      ]),
      {
        activities: [
          {
            category: ActivityCategory.RUNNING,
            color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.RUNNING],
            distanceKm: 8,
            durationMin: 45,
            id: 'running-sam-1',
            isInterval: false,
            name: 'Sortie longue',
          },
        ],
        day: 'Samedi',
        isRest: false,
        short: 'SAM',
      },
      restDay('Dimanche', 'DIM'),
    ],
    isoWeek: 37,
    stats: { sessions: 5, totalMin: 220, volume: '12 400 kg' },
    year: 2026,
  },
  {
    days: [
      trainingDay('Lundi', 'LUN', {
        color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.TRAINING],
        exercises: 5,
        name: 'Push Day',
      }),
      restDay('Mardi', 'MAR'),
      trainingDay('Mercredi', 'MER', {
        color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.TRAINING],
        exercises: 5,
        name: 'Pull Day',
      }),
      restDay('Jeudi', 'JEU'),
      trainingDay('Vendredi', 'VEN', {
        color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.TRAINING],
        exercises: 6,
        name: 'Leg Day',
      }),
      trainingDay('Samedi', 'SAM', {
        color: '#C62A47',
        exercises: 4,
        name: 'Cardio HIIT',
      }),
      restDay('Dimanche', 'DIM'),
    ],
    isoWeek: 36,
    stats: { sessions: 4, totalMin: 162, volume: '10 800 kg' },
    year: 2026,
  },
  {
    days: [
      restDay('Lundi', 'LUN'),
      trainingDay('Mardi', 'MAR', {
        color: '#FF6B35',
        exercises: 5,
        name: 'Force Upper',
      }),
      trainingDay('Mercredi', 'MER', {
        color: '#C62A47',
        exercises: 6,
        name: 'Cardio HIIT',
      }),
      restDay('Jeudi', 'JEU'),
      trainingDay('Vendredi', 'VEN', {
        color: '#1A936F',
        exercises: 7,
        name: 'Full Body',
      }),
      restDay('Samedi', 'SAM'),
      dayWithActivities('Dimanche', 'DIM', [
        {
          category: ActivityCategory.FLOW,
          color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.FLOW],
          durationMin: 30,
          flowKind: FlowKind.STRETCHING,
          id: 'flow-dim-1',
          name: 'Mobilité',
        },
      ]),
    ],
    isoWeek: 35,
    stats: { sessions: 4, totalMin: 195, volume: '11 200 kg' },
    year: 2026,
  },
  {
    days: [
      trainingDay('Lundi', 'LUN', {
        color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.TRAINING],
        exercises: 5,
        name: 'Push Day',
      }),
      trainingDay('Mardi', 'MAR', {
        color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.TRAINING],
        exercises: 5,
        name: 'Pull Day',
      }),
      restDay('Mercredi', 'MER'),
      trainingDay('Jeudi', 'JEU', {
        color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.TRAINING],
        exercises: 6,
        name: 'Leg Day',
      }),
      restDay('Vendredi', 'VEN'),
      trainingDay('Samedi', 'SAM', {
        color: '#1A936F',
        exercises: 7,
        name: 'Full Body',
      }),
      restDay('Dimanche', 'DIM'),
    ],
    isoWeek: 34,
    stats: { sessions: 4, totalMin: 210, volume: '13 600 kg' },
    year: 2026,
  },
  {
    days: [
      trainingDay('Lundi', 'LUN', {
        color: '#C62A47',
        exercises: 6,
        name: 'Cardio HIIT',
      }),
      restDay('Mardi', 'MAR'),
      trainingDay('Mercredi', 'MER', {
        color: '#FF6B35',
        exercises: 5,
        name: 'Force Upper',
      }),
      restDay('Jeudi', 'JEU'),
      trainingDay('Vendredi', 'VEN', {
        color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.TRAINING],
        exercises: 4,
        name: 'Force Lower',
      }),
      dayWithActivities('Samedi', 'SAM', [
        {
          category: ActivityCategory.FLOW,
          color: DEFAULT_ACTIVITY_COLORS[ActivityCategory.FLOW],
          durationMin: 25,
          flowKind: FlowKind.STRENGTHENING,
          id: 'flow-sam-1',
          name: 'Mobilité',
        },
      ]),
      restDay('Dimanche', 'DIM'),
    ],
    isoWeek: 33,
    stats: { sessions: 4, totalMin: 148, volume: '9 500 kg' },
    year: 2026,
  },
];
