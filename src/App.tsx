import { addWeeks, getDay, getISOWeek, getISOWeekYear, startOfWeek } from 'date-fns';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { BottomNav } from './components/bottom-nav';
import { CircuitsPage } from './components/circuits-page';
import { CreateCircuitPage } from './components/create-circuit-page';
import { HomePage } from './components/home-page';
import { ProfilePage } from './components/profile-page';
import { ProgrammePage } from './components/programme-page';
import { TabataPage } from './components/tabata-page';
import freeTabataDefaults from './config/tabata-free.json';
import { SEED_CIRCUIT_IDS, SEED_EXERCISE_IDS } from './data/seed-ids';
import { WEEK_HISTORY } from './data/week-history';
import { Gender, Screen, TabataMode, ViewMode } from './enums';
import type { DayProgram } from './interfaces';
import { firstTrainingActivity } from './utils';

interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  accentColor: string;
  defaultProgrammeView: ViewMode;
  streakGraceDays: number;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

interface Circuit {
  id: string;
  name: string;
  color: string;
  prepTime: number;
  exerciseTime: number;
  restBetweenExercises: number;
  rounds: number;
  cycles: number;
  restBetweenCycles: number;
  recoveryTime: number;
  exerciseIds: string[];
}

interface CircuitTiming {
  prepTime: number;
  exerciseTime: number;
  restBetweenExercises: number;
  rounds: number;
  cycles: number;
  restBetweenCycles: number;
  recoveryTime: number;
}

const defaultProfile: UserProfile = {
  accentColor: '#cbff47',
  age: 28,
  defaultProgrammeView: ViewMode.MONTH,
  firstName: 'Alexandre',
  gender: Gender.MALE,
  heightCm: 178,
  lastName: '',
  streakGraceDays: 2,
  weightKg: 75,
};

const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

const initialCircuits: Circuit[] = [
  {
    color: '#FF6B35',
    cycles: 3,
    exerciseIds: [
      SEED_EXERCISE_IDS.militaryPress,
      SEED_EXERCISE_IDS.pullUps,
      SEED_EXERCISE_IDS.burpees,
    ],
    exerciseTime: 45,
    id: SEED_CIRCUIT_IDS.forceUpper,
    name: 'Force Upper',
    prepTime: 10,
    recoveryTime: 90,
    restBetweenCycles: 60,
    restBetweenExercises: 15,
    rounds: 4,
  },
  {
    color: '#C62A47',
    cycles: 4,
    exerciseIds: [
      SEED_EXERCISE_IDS.burpees,
      SEED_EXERCISE_IDS.jumpSquat,
      SEED_EXERCISE_IDS.walkingLunges,
    ],
    exerciseTime: 30,
    id: SEED_CIRCUIT_IDS.cardioHiit,
    name: 'Cardio HIIT',
    prepTime: 5,
    recoveryTime: 120,
    restBetweenCycles: 45,
    restBetweenExercises: 10,
    rounds: 6,
  },
  {
    color: '#1A936F',
    cycles: 3,
    exerciseIds: [
      SEED_EXERCISE_IDS.burpees,
      SEED_EXERCISE_IDS.pullUps,
      SEED_EXERCISE_IDS.jumpSquat,
      SEED_EXERCISE_IDS.militaryPress,
      SEED_EXERCISE_IDS.plank,
      SEED_EXERCISE_IDS.walkingLunges,
    ],
    exerciseTime: 40,
    id: SEED_CIRCUIT_IDS.fullBody,
    name: 'Full Body',
    prepTime: 15,
    recoveryTime: 90,
    restBetweenCycles: 60,
    restBetweenExercises: 20,
    rounds: 4,
  },
];

const initialExercises: Exercise[] = [
  {
    description: 'Explosive full-body move chaining squat, push-up and vertical jump.',
    id: SEED_EXERCISE_IDS.burpees,
    name: 'Burpees',
    tags: ['cardio', 'legs', 'chest'],
  },
  {
    description: 'Vertical pull from a bar; back and biceps.',
    id: SEED_EXERCISE_IDS.pullUps,
    name: 'Pull-ups',
    tags: ['back', 'arms'],
  },
  {
    description: 'Deep squat with an explosive jump upward.',
    id: SEED_EXERCISE_IDS.jumpSquat,
    name: 'Jump squat',
    tags: ['legs', 'glutes', 'cardio'],
  },
  {
    description: 'Vertical press with dumbbells or barbell from the shoulders.',
    id: SEED_EXERCISE_IDS.militaryPress,
    name: 'Military press',
    tags: ['shoulders', 'arms'],
  },
  {
    description: 'Hold a rigid body position; deep core strengthening.',
    id: SEED_EXERCISE_IDS.plank,
    name: 'Plank',
    tags: ['abs'],
  },
  {
    description: 'Forward step with rear knee drop; unilateral leg work.',
    id: SEED_EXERCISE_IDS.walkingLunges,
    name: 'Walking lunges',
    tags: ['legs', 'glutes'],
  },
];

const FREE_TABATA_DEFAULTS: CircuitTiming = freeTabataDefaults;

function createFreeTabataCircuit(accent: string): Circuit {
  return {
    ...FREE_TABATA_DEFAULTS,
    color: accent,
    exerciseIds: [],
    id: uuidv4(),
    name: 'Tabata libre',
  };
}

function getTodayIndex(date: Date = new Date()): number {
  return (getDay(date) + 6) % 7;
}

function getWeekStart(weekOffset: number, from: Date = new Date()): Date {
  return startOfWeek(addWeeks(from, -weekOffset), WEEK_START_OPTIONS);
}

function findHistoryWeek(weekStart: Date, history: typeof WEEK_HISTORY) {
  const isoWeek = getISOWeek(weekStart);
  const year = getISOWeekYear(weekStart);
  return history.find((week) => week.isoWeek === isoWeek && week.year === year);
}

function getWeekKey(weekStart: Date): string {
  return `${getISOWeekYear(weekStart)}-W${getISOWeek(weekStart)}`;
}

function resolveWeekDays(
  weekStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
): DayProgram[] {
  const key = getWeekKey(weekStart);
  if (Object.hasOwn(weekPrograms, key)) return weekPrograms[key];
  return findHistoryWeek(weekStart, WEEK_HISTORY)?.days ?? WEEK_HISTORY[0].days;
}

export const App = () => {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [prevScreen, setPrevScreen] = useState<Screen>(Screen.HOME);
  const [exercises] = useState<Exercise[]>(initialExercises);
  const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits);
  const [weekPrograms, setWeekPrograms] = useState<Record<string, DayProgram[]>>(() => {
    const currentStart = getWeekStart(0);
    return { [getWeekKey(currentStart)]: WEEK_HISTORY[0].days };
  });
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);
  const [session, setSession] = useState<
    { circuit: Circuit; tabataMode: TabataMode } | undefined
  >();

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', profile.accentColor);
  }, [profile.accentColor]);

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const handleBack = () => {
    setScreen(prevScreen === screen ? Screen.HOME : prevScreen);
  };

  const openFreeTabata = () => {
    setSession({
      circuit: createFreeTabataCircuit(profile.accentColor),
      tabataMode: TabataMode.FREE,
    });
    navigate(Screen.TABATA);
  };

  const startSession = (circuit: Circuit | undefined, tabataMode: TabataMode) => {
    if (!circuit) return;
    setSession({ circuit, tabataMode });
    navigate(Screen.TABATA);
  };

  const goToCreateCircuit = (id?: string) => {
    setEditingCircuitId(id ?? null);
    navigate(Screen.CREATE_CIRCUIT);
  };

  const handleSaveCircuit = (c: Circuit) => {
    setCircuits((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      return exists ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
    });
  };

  const handleUpdateDay = (weekStart: Date, dayIndex: number, day: DayProgram) => {
    const key = getWeekKey(weekStart);
    setWeekPrograms((prev) => {
      const base = prev[key] ?? resolveWeekDays(weekStart, prev);
      return {
        ...prev,
        [key]: base.map((d, idx) => (idx === dayIndex ? day : d)),
      };
    });
  };

  const currentWeekDays = resolveWeekDays(getWeekStart(0), weekPrograms);
  const todayIndex = getTodayIndex();

  const todayTraining = firstTrainingActivity(currentWeekDays[todayIndex]);
  const todayCircuit = todayTraining?.meta.circuitId
    ? circuits.find((c) => c.id === todayTraining.meta.circuitId)
    : undefined;

  const editingCircuit = editingCircuitId
    ? circuits.find((c) => c.id === editingCircuitId)
    : undefined;
  const accent = profile.accentColor;
  const noNav =
    screen === Screen.CREATE_CIRCUIT ||
    screen === Screen.PROFILE ||
    (screen === Screen.TABATA && session?.tabataMode === TabataMode.PLANNED);

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ backgroundColor: '#050505' }}>
      <div
        className="flex flex-col overflow-hidden relative"
        style={{
          backgroundColor: '#0d0d0d',
          boxShadow: '0 0 80px #00000080',
          height: 'min(100vh, 844px)',
          width: 'min(100vw, 390px)',
        }}>
        <div className="flex-1 overflow-hidden relative">
          {screen === Screen.HOME && (
            <HomePage
              accent={accent}
              circuits={circuits}
              currentWeekDays={currentWeekDays}
              profile={profile}
              weekPrograms={weekPrograms}
              onGoToFreeTabata={openFreeTabata}
              onGoToProfile={() => {
                navigate(Screen.PROFILE);
              }}
              onGoToTimer={() => {
                if (!todayTraining) return;
                startSession(todayCircuit, todayTraining.meta.tabataMode);
              }}
              onGoToWeekly={() => {
                navigate(Screen.WEEKLY);
              }}
            />
          )}
          {screen === Screen.WEEKLY && (
            <ProgrammePage
              accent={accent}
              circuits={circuits}
              defaultViewMode={profile.defaultProgrammeView}
              weekPrograms={weekPrograms}
              onCreateCircuit={() => {
                goToCreateCircuit();
              }}
              onStartSession={({ circuitId, tabataMode }) => {
                startSession(
                  circuits.find((c) => c.id === circuitId),
                  tabataMode,
                );
              }}
              onUpdateDay={handleUpdateDay}
            />
          )}
          {screen === Screen.CIRCUITS && (
            <CircuitsPage
              accent={accent}
              circuits={circuits}
              exercises={exercises}
              onCreateNew={() => {
                goToCreateCircuit();
              }}
              onEdit={(id) => {
                goToCreateCircuit(id);
              }}
            />
          )}
          {screen === Screen.CREATE_CIRCUIT && (
            <CreateCircuitPage
              accent={accent}
              exercises={exercises}
              initial={editingCircuit}
              onBack={handleBack}
              onSave={handleSaveCircuit}
            />
          )}
          {screen === Screen.TABATA && session && (
            <TabataPage
              key={session.circuit.id}
              accent={accent}
              circuit={session.circuit}
              exercises={exercises}
              tabataMode={session.tabataMode}
              onClose={handleBack}
            />
          )}
          {screen === Screen.PROFILE && (
            <ProfilePage profile={profile} onBack={handleBack} onSave={setProfile} />
          )}
        </div>
        {!noNav && (
          <BottomNav
            accent={accent}
            screen={screen}
            onNavigate={(s) => {
              if (s === Screen.TABATA) {
                openFreeTabata();
                return;
              }
              navigate(s);
            }}
          />
        )}
      </div>
    </div>
  );
};

App.displayName = 'App';
