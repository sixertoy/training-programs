import { useEffect, useRef, useState } from 'react';

import { IconBack, IconPause, IconPlay, IconSkip } from '../../assets/icons';
import { AccentColor } from '../../enums';
import { withAlpha } from '../../helpers';
import type { Circuit, Exercise } from '../../interfaces';

interface TimerScreenProps {
  accent: string;
  circuit?: Circuit;
  exercises: Exercise[];
  onBack: () => void;
}

export function TimerScreen({ accent, circuit, exercises, onBack }: TimerScreenProps) {
  const WORK_TIME = circuit?.exerciseTime ?? 45;
  const REST_TIME = circuit?.restBetweenExercises ?? 15;
  const TOTAL_ROUNDS = circuit?.rounds ?? 4;
  const TOTAL_CYCLES = circuit?.cycles ?? 6;

  const exerciseNames = circuit
    ? circuit.exerciseIds.map((id) => exercises.find((e) => e.id === id)?.name ?? 'Exercice')
    : ['Burpees', 'Tractions', 'Squat sauté', 'Gainage planche', 'Fentes marchées'];

  const [seconds, setSeconds] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [round, setRound] = useState(1);
  const [cycle, setCycle] = useState(1);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exerciseIndex = (cycle - 1) % Math.max(1, exerciseNames.length);

  useEffect(() => {
    if (isRunning && !done) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (isWork) {
              setIsWork(false);
              return REST_TIME;
            }
            if (cycle >= TOTAL_CYCLES && round >= TOTAL_ROUNDS) {
              setIsRunning(false);
              setDone(true);
              return 0;
            }
            if (cycle >= TOTAL_CYCLES) {
              setRound((r) => r + 1);
              setCycle(1);
            } else {
              setCycle((c) => c + 1);
            }
            setIsWork(true);
            return WORK_TIME;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isWork, cycle, round, done, WORK_TIME, REST_TIME, TOTAL_ROUNDS, TOTAL_CYCLES]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const progress = seconds / (isWork ? WORK_TIME : REST_TIME);
  const circumference = 2 * Math.PI * 88;

  const handleReset = () => {
    setSeconds(WORK_TIME);
    setIsRunning(false);
    setIsWork(true);
    setRound(1);
    setCycle(1);
    setDone(false);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)' }}>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a' }}
          onClick={onBack}>
          <IconBack />
        </button>
        <div className="text-center">
          <p className="font-900 text-sm" style={{ color: accent }}>
            {circuit?.name ?? 'Séance'}
          </p>
          <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
            Circuit du jour
          </p>
        </div>
        <button
          className="text-xs font-800 px-3 py-2 rounded-full"
          style={{ backgroundColor: '#1a1a1a', color: '#888' }}
          onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="px-5 flex gap-3 mb-6">
        {[
          { color: accent, label: 'Rounds', total: TOTAL_ROUNDS, value: round },
          { color: '#fff', label: 'Cycles', total: TOTAL_CYCLES, value: cycle },
        ].map((bar) => (
          <div
            key={bar.label}
            className="flex-1 rounded-xl p-3 text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p
              className="text-xs font-800 tracking-widest uppercase mb-1"
              style={{ color: '#555' }}>
              {bar.label}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-900" style={{ color: bar.color }}>
                {bar.value}
              </span>
              <span className="text-sm font-700" style={{ color: '#444' }}>
                / {bar.total}
              </span>
            </div>
            <div className="flex gap-1 justify-center mt-2">
              {Array.from({ length: bar.total }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ backgroundColor: i < bar.value ? bar.color : '#2a2a2a' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mb-2">
        <span
          className="text-xs font-900 tracking-widest uppercase px-4 py-1.5 rounded-full"
          style={{
            backgroundColor: isWork
              ? withAlpha(accent, 0.12)
              : withAlpha(AccentColor.ORANGE, 0.125),
            color: isWork ? accent : AccentColor.ORANGE,
          }}>
          {done ? 'Terminé !' : isWork ? 'Travail' : 'Repos'}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <svg height="210" style={{ transform: 'rotate(-90deg)' }} width="210">
            <circle cx="105" cy="105" fill="none" r="88" stroke="#2a2a2a" strokeWidth="8" />
            <circle
              cx="105"
              cy="105"
              fill="none"
              r="88"
              stroke={isWork ? accent : AccentColor.ORANGE}
              strokeDasharray={`${circumference * progress} ${circumference}`}
              strokeLinecap="round"
              strokeWidth="8"
              style={{ transition: 'stroke-dasharray 0.5s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-900 leading-none"
              style={{ color: done ? accent : '#fff', fontSize: 54 }}>
              {done ? '✓' : `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`}
            </span>
            {!done && (
              <span className="text-sm font-700 mt-1" style={{ color: '#555' }}>
                {isWork ? 'secondes' : 'récupération'}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 text-center px-8">
          <p className="text-xs font-800 tracking-widest uppercase mb-1" style={{ color: '#555' }}>
            Exercice actuel
          </p>
          <p className="text-xl font-900">
            {done ? 'Circuit complété !' : exerciseNames[exerciseIndex]}
          </p>
          {!done && exerciseNames.length > 1 && (
            <p className="text-sm font-600 mt-1" style={{ color: '#555' }}>
              Suivant : {exerciseNames[(exerciseIndex + 1) % exerciseNames.length]}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-10 flex items-center justify-center gap-6">
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
          onClick={() => {
            setCycle((c) => Math.max(1, c - 1));
            setSeconds(WORK_TIME);
            setIsWork(true);
          }}>
          <span style={{ transform: 'scaleX(-1)' }}>
            <IconSkip />
          </span>
        </button>
        <button
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          style={{ backgroundColor: accent, color: '#0d0d0d' }}
          onClick={() => {
            done ? handleReset() : setIsRunning((r) => !r);
          }}>
          {done ? (
            <span className="text-2xl font-900">↺</span>
          ) : isRunning ? (
            <IconPause />
          ) : (
            <span style={{ marginLeft: 4 }}>
              <IconPlay />
            </span>
          )}
        </button>
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
          onClick={() => {
            if (cycle < TOTAL_CYCLES) setCycle((c) => c + 1);
            else if (round < TOTAL_ROUNDS) {
              setRound((r) => r + 1);
              setCycle(1);
            }
            setSeconds(WORK_TIME);
            setIsWork(true);
          }}>
          <IconSkip />
        </button>
      </div>
    </div>
  );
}
