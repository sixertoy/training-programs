import { useEffect, useState } from 'react';

import {
  BottomNav,
  CircuitsScreen,
  CreateCircuitScreen,
  HomeScreen,
  ProfileScreen,
  TimerScreen,
  WeeklyScreen,
} from './components';
import { TODAY_INDEX } from './constants/program.constants';
import type { Circuit, DayProgram, Exercise, UserProfile } from './interfaces';
import { defaultProfile, initialCircuits, initialExercises, WEEK_HISTORY } from './mocks';
import type { Screen } from './types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [prevScreen, setPrevScreen] = useState<Screen>('home');
  const [exercises] = useState<Exercise[]>(initialExercises);
  const [circuits, setCircuits] = useState<Circuit[]>(initialCircuits);
  const [currentWeekDays, setCurrentWeekDays] = useState<DayProgram[]>(WEEK_HISTORY[0].days);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', profile.accentColor);
  }, [profile.accentColor]);

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };
  const handleBack = () => {
    setScreen(prevScreen === screen ? 'home' : prevScreen);
  };

  const goToCreateCircuit = (id?: string) => {
    setEditingCircuitId(id ?? null);
    navigate('create-circuit');
  };

  const handleSaveCircuit = (c: Circuit) => {
    setCircuits((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      return exists ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
    });
  };

  const todayCircuit = currentWeekDays[TODAY_INDEX].circuitId
    ? circuits.find((c) => c.id === currentWeekDays[TODAY_INDEX].circuitId)
    : undefined;

  const editingCircuit = editingCircuitId
    ? circuits.find((c) => c.id === editingCircuitId)
    : undefined;
  const accent = profile.accentColor;
  const noNav = screen === 'create-circuit' || screen === 'profile';

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
          {screen === 'home' && (
            <HomeScreen
              accent={accent}
              currentWeekDays={currentWeekDays}
              profile={profile}
              onGoToProfile={() => {
                navigate('profile');
              }}
              onGoToTimer={() => {
                navigate('timer');
              }}
              onGoToWeekly={() => {
                navigate('weekly');
              }}
            />
          )}
          {screen === 'weekly' && (
            <WeeklyScreen
              accent={accent}
              circuits={circuits}
              currentWeekDays={currentWeekDays}
              onCreateCircuit={() => {
                goToCreateCircuit();
              }}
              onStartTimer={() => {
                navigate('timer');
              }}
              onUpdateDay={(i, d) => {
                setCurrentWeekDays((prev) => prev.map((day, idx) => (idx === i ? d : day)));
              }}
            />
          )}
          {screen === 'circuits' && (
            <CircuitsScreen
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
          {screen === 'create-circuit' && (
            <CreateCircuitScreen
              accent={accent}
              exercises={exercises}
              initial={editingCircuit}
              onBack={handleBack}
              onSave={handleSaveCircuit}
            />
          )}
          {screen === 'timer' && (
            <TimerScreen
              accent={accent}
              circuit={todayCircuit}
              exercises={exercises}
              onBack={handleBack}
            />
          )}
          {screen === 'profile' && (
            <ProfileScreen profile={profile} onBack={handleBack} onSave={setProfile} />
          )}
        </div>
        {!noNav && <BottomNav accent={accent} screen={screen} onNavigate={navigate} />}
      </div>
    </div>
  );
}
