import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { IconGear, IconPause, IconPlay, IconPlus, IconRotateCcw } from '../../assets/icons';
import freeTabataDefaults from '../../config/tabata-free.json';
import { TabataMode, TimerPhase } from '../../enums';
import { Button } from '../button';
import { Stepper } from '../stepper';

enum AccentColor {
  LIME = '#CBFF47',
  ORANGE = '#FF6B35',
  TEAL = '#4ECDC4',
  CORAL = '#FF6B6B',
  VIOLET = '#A78BFA',
  AMBER = '#F18F01',
  MINT = '#60D394',
  SKY = '#74C0FC',
  YELLOW = '#FFE66D',
  SALMON = '#FF8B94',
  SAGE = '#A8E6CF',
  SEAFOAM = '#88D8B0',
  BLUSH = '#FF9A9E',
}

function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + alpha;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').slice(0, 6);
  return {
    b: parseInt(h.slice(4, 6), 16),
    g: parseInt(h.slice(2, 4), 16),
    r: parseInt(h.slice(0, 2), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { b, g, r } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }

  return { h, l, s };
}

function hslToHex(h: number, s: number, l: number): string {
  if (s === 0) {
    const v = l * 255;
    return rgbToHex(v, v, v);
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return rgbToHex(
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  );
}

function shiftAccentLightness(hex: string, amount = 0.28): string {
  const { h, l, s } = hexToHsl(hex);
  const nextL = clamp01(l > 0.5 ? l - amount : l + amount);
  return hslToHex(h, s, nextL);
}

/** Même famille que l’accent : décalage de teinte + luminosité (comme la préparation). */
function shiftAccentHue(hex: string, hueDeg: number, lightnessAmount = 0.28): string {
  const { h, l, s } = hexToHsl(hex);
  const nextH = ((((h * 360 + hueDeg) % 360) + 360) % 360) / 360;
  const nextL = clamp01(l > 0.5 ? l - lightnessAmount : l + lightnessAmount);
  return hslToHex(nextH, s, nextL);
}

function circuitDurationMin(circuit: CircuitTiming): number {
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

const FREE_TABATA_DEFAULTS: CircuitTiming = freeTabataDefaults;

const TAG_COLORS: Record<string, AccentColor> = {
  abs: AccentColor.SALMON,
  arms: AccentColor.SAGE,
  back: AccentColor.TEAL,
  cardio: AccentColor.LIME,
  chest: AccentColor.SEAFOAM,
  glutes: AccentColor.BLUSH,
  legs: AccentColor.YELLOW,
  shoulders: AccentColor.CORAL,
};

function exerciseColor(exercise: Exercise): string {
  return TAG_COLORS[exercise.tags[0]] ?? '#888';
}

interface TimerStep {
  cycle: number;
  round: number;
  phase: TimerPhase;
  seconds: number;
  done: boolean;
}

interface TimerDurations {
  prepTime: number;
  workTime: number;
  restTime: number;
  interCycleRest: number;
  recoveryTime: number;
}

function getExerciseIndex(round: number, exerciseCount: number): number {
  return (round - 1) % Math.max(1, exerciseCount);
}

function phaseDuration(phase: TimerPhase, durations: TimerDurations): number {
  if (phase === TimerPhase.PREP) return durations.prepTime;
  if (phase === TimerPhase.WORK) return durations.workTime;
  if (phase === TimerPhase.REST) return durations.restTime;
  if (phase === TimerPhase.RECOVERY) return durations.recoveryTime;
  return durations.interCycleRest;
}

function advanceTimerStep(
  state: TimerStep,
  totalRounds: number,
  totalCycles: number,
  durations: TimerDurations,
): TimerStep {
  if (state.done) return state;

  const { interCycleRest, recoveryTime, restTime, workTime } = durations;

  if (state.phase === TimerPhase.PREP) {
    return { ...state, cycle: 1, phase: TimerPhase.WORK, round: 1, seconds: workTime };
  }

  if (state.phase === TimerPhase.WORK) {
    const isLastRound = state.round >= totalRounds;
    const isLastCycle = state.cycle >= totalCycles;

    // Repos après le dernier round ignoré : absorbé par le repos inter-cycle / la récupération.
    if (isLastRound) {
      if (!isLastCycle) {
        return { ...state, phase: TimerPhase.INTER_CYCLE_REST, seconds: interCycleRest };
      }
      if (recoveryTime > 0) {
        return { ...state, phase: TimerPhase.RECOVERY, seconds: recoveryTime };
      }
      return { ...state, done: true, seconds: 0 };
    }

    return { ...state, phase: TimerPhase.REST, seconds: restTime };
  }

  if (state.phase === TimerPhase.REST) {
    return {
      ...state,
      phase: TimerPhase.WORK,
      round: state.round + 1,
      seconds: workTime,
    };
  }

  if (state.phase === TimerPhase.RECOVERY) {
    return { ...state, done: true, seconds: 0 };
  }

  return {
    ...state,
    cycle: state.cycle + 1,
    phase: TimerPhase.WORK,
    round: 1,
    seconds: workTime,
  };
}

export function TabataPage({
  accent,
  circuit: circuitProp,
  exercises,
  mode,
  onClose,
}: {
  onClose: () => void;
  circuit: Circuit;
  exercises: Exercise[];
  accent: string;
  mode: TabataMode;
}) {
  const isFree = mode === TabataMode.FREE;
  const [localCircuit, setLocalCircuit] = useState<Circuit>(circuitProp);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [draft, setDraft] = useState<Circuit>(circuitProp);

  const PREP_TIME = localCircuit.prepTime;
  const WORK_TIME = localCircuit.exerciseTime;
  const REST_TIME = localCircuit.restBetweenExercises;
  const INTER_CYCLE_REST = localCircuit.restBetweenCycles;
  const RECOVERY_TIME = localCircuit.recoveryTime;
  const TOTAL_ROUNDS = localCircuit.rounds;
  const TOTAL_CYCLES = localCircuit.cycles;
  const durations: TimerDurations = {
    interCycleRest: INTER_CYCLE_REST,
    prepTime: PREP_TIME,
    recoveryTime: RECOVERY_TIME,
    restTime: REST_TIME,
    workTime: WORK_TIME,
  };
  const initialPhase: TimerPhase = PREP_TIME > 0 ? TimerPhase.PREP : TimerPhase.WORK;
  const initialSeconds = PREP_TIME > 0 ? PREP_TIME : WORK_TIME;

  const exerciseNames =
    localCircuit.exerciseIds.length > 0
      ? localCircuit.exerciseIds.map((id) => exercises.find((e) => e.id === id)?.name ?? 'Exercice')
      : ['Exercice'];

  const [cycle, setCycle] = useState(1);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<TimerPhase>(initialPhase);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const exerciseIndex = getExerciseIndex(round, exerciseNames.length);
  const phaseMax = phaseDuration(phase, durations);
  const isRestPhase =
    phase === TimerPhase.REST ||
    phase === TimerPhase.INTER_CYCLE_REST ||
    phase === TimerPhase.RECOVERY;
  let phaseColor = shiftAccentHue(accent, 40);
  if (phase === TimerPhase.WORK) phaseColor = accent;
  else if (phase === TimerPhase.PREP) phaseColor = shiftAccentLightness(accent);
  else if (phase === TimerPhase.RECOVERY) phaseColor = shiftAccentHue(accent, -50);

  const resetTimer = (circuit: Circuit = localCircuit) => {
    const prep = circuit.prepTime;
    const work = circuit.exerciseTime;
    const startPhase: TimerPhase = prep > 0 ? TimerPhase.PREP : TimerPhase.WORK;
    setCycle(1);
    setRound(1);
    setPhase(startPhase);
    setSeconds(prep > 0 ? prep : work);
    setIsRunning(false);
    setDone(false);
    setElapsedSec(0);
    startedAtRef.current = null;
  };

  useEffect(() => {
    if (isRunning && !done) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            const next = advanceTimerStep(
              { cycle, done, phase, round, seconds: s },
              TOTAL_ROUNDS,
              TOTAL_CYCLES,
              durations,
            );
            setCycle(next.cycle);
            setRound(next.round);
            setPhase(next.phase);
            setDone(next.done);
            if (next.done) {
              setIsRunning(false);
              if (startedAtRef.current !== null) {
                setElapsedSec(Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)));
              }
            }
            return next.seconds;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    isRunning,
    phase,
    cycle,
    round,
    done,
    PREP_TIME,
    WORK_TIME,
    REST_TIME,
    INTER_CYCLE_REST,
    RECOVERY_TIME,
    TOTAL_ROUNDS,
    TOTAL_CYCLES,
  ]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDuration = (totalSec: number) =>
    `${pad(Math.floor(totalSec / 60))}:${pad(totalSec % 60)}`;
  const TIMER_R = 108;
  const TIMER_SIZE = 250;
  const TIMER_CX = TIMER_SIZE / 2;
  const progress = phaseMax > 0 ? seconds / phaseMax : 0;
  const circumference = 2 * Math.PI * TIMER_R;

  const handleReset = () => {
    resetTimer();
  };

  const handleResetConfig = () => {
    const resetCircuit: Circuit = {
      ...localCircuit,
      ...FREE_TABATA_DEFAULTS,
      exerciseIds: [],
    };
    setDraft(resetCircuit);
    setLocalCircuit(resetCircuit);
    setShowPicker(false);
    resetTimer(resetCircuit);
  };

  const handlePlayPause = () => {
    if (done) return;
    setIsRunning((running) => {
      if (!running && startedAtRef.current === null) {
        startedAtRef.current = Date.now();
      }
      return !running;
    });
  };

  const PHASE_LABELLS: Partial<Record<TimerPhase, string>> = {
    [TimerPhase.PREP]: 'Préparation',
    [TimerPhase.WORK]: 'Travail',
    [TimerPhase.REST]: 'Repos',
    [TimerPhase.RECOVERY]: 'Récupération',
    [TimerPhase.INTER_CYCLE_REST]: 'Repos inter-cycle',
  };
  const phaseLabel = PHASE_LABELLS[phase] ?? 'Repos inter-cycle';

  const openSheet = () => {
    setDraft(localCircuit);
    setShowPicker(false);
    setSheetOpen(true);
  };

  const applyDraft = () => {
    setLocalCircuit(draft);
    setSheetOpen(false);
    setShowPicker(false);
    resetTimer(draft);
  };

  const draftDurationMin = circuitDurationMin(draft);
  const draftExercises = draft.exerciseIds
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];

  let nextIndex: number;

  if (phase === TimerPhase.PREP) {
    nextIndex = 0;
  } else if (phase === TimerPhase.WORK) {
    nextIndex = (exerciseIndex + 1) % exerciseNames.length;
  } else {
    const nextRound = round < TOTAL_ROUNDS ? round + 1 : 1;
    nextIndex = getExerciseIndex(nextRound, exerciseNames.length);
  }
  const nextExerciseName = exerciseNames[nextIndex];

  const PHASE_LABELS: Partial<Record<TimerPhase, string>> = {
    [TimerPhase.PREP]: 'Préparation',
    [TimerPhase.RECOVERY]: 'Fin de séance',
    [TimerPhase.INTER_CYCLE_REST]: 'Entre cycles',
    [TimerPhase.REST]: 'Repos',
  };

  const infoContext = PHASE_LABELS[phase] ?? 'Exercice actuel';

  let infoMain = exerciseNames[exerciseIndex];
  if (phase === TimerPhase.PREP) {
    infoMain = 'Préparez-vous';
  } else if (isRestPhase) {
    infoMain = 'Repos';
  }

  const showNext =
    (phase === TimerPhase.PREP ||
      phase === TimerPhase.WORK ||
      phase === TimerPhase.REST ||
      phase === TimerPhase.INTER_CYCLE_REST) &&
    exerciseNames.length > 0;

  const timingRows: {
    key: keyof CircuitTiming;
    label: string;
    min?: number;
    step: number;
    unit: string;
  }[] = [
    { key: 'prepTime', label: 'Préparation', step: 5, unit: 'sec' },
    { key: 'exerciseTime', label: "Temps d'exercice", step: 5, unit: 'sec' },
    { key: 'restBetweenExercises', label: 'Repos entre exercices', step: 5, unit: 'sec' },
    { key: 'rounds', label: 'Rounds / cycle', min: 1, step: 1, unit: '×' },
    { key: 'cycles', label: 'Nombre de cycles', min: 1, step: 1, unit: '×' },
    { key: 'restBetweenCycles', label: 'Repos entre cycles', step: 15, unit: 'sec' },
    { key: 'recoveryTime', label: 'Récupération finale', step: 15, unit: 'sec' },
  ];

  const sheet = sheetOpen && (
    // Backdrop dismiss — overlay intentionally non-focusable
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="absolute inset-0 flex flex-col justify-end"
      style={{ backgroundColor: '#00000090', zIndex: 50 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSheetOpen(false);
      }}>
      <div
        className="rounded-t-3xl px-5 pt-5 pb-6 flex flex-col"
        style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '78%' }}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <p className="font-900 text-lg">Configuration</p>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none"
            style={{ backgroundColor: '#2a2a2a', color: '#888' }}
            onClick={() => {
              setSheetOpen(false);
            }}>
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-4 pr-0.5">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {timingRows.map((row, idx) => (
              <div
                key={row.key}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: idx < timingRows.length - 1 ? '1px solid #2a2a2a' : 'none',
                }}>
                <p className="text-sm font-700" style={{ color: '#aaa' }}>
                  {row.label}
                </p>
                <Stepper
                  min={row.min ?? 0}
                  step={row.step}
                  unit={row.unit}
                  value={draft[row.key]}
                  onChange={(v) => {
                    setDraft((d) => ({ ...d, [row.key]: v }));
                  }}
                />
              </div>
            ))}
          </div>

          <p className="text-xs font-600 leading-relaxed" style={{ color: '#666' }}>
            Le repos après le dernier round d&apos;un cycle est ignoré : il est inclus dans le repos
            entre cycles (ou la récupération finale pour le dernier cycle).
          </p>

          <p className="text-xs font-700 text-right" style={{ color: '#555' }}>
            Durée estimée : ~{draftDurationMin} min
          </p>

          <div>
            <p
              className="text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Exercices ({draft.exerciseIds.length})
            </p>
            {draftExercises.length === 0 ? (
              <p className="text-sm font-600" style={{ color: '#555' }}>
                Aucun exercice sélectionné
              </p>
            ) : (
              <div className="space-y-2">
                {draftExercises.map((e, i) => {
                  const color = exerciseColor(e);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-900 text-sm shrink-0"
                        style={{ backgroundColor: withAlpha(color, 0.15), color }}>
                        {i + 1}
                      </div>
                      <p className="font-800 text-sm flex-1 min-w-0 truncate">{e.name}</p>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-900 leading-none"
                        style={{ backgroundColor: '#2a2a2a', color: '#FF6B6B' }}
                        onClick={() => {
                          setDraft((d) => ({
                            ...d,
                            exerciseIds: d.exerciseIds.filter((id) => id !== e.id),
                          }));
                        }}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <Button
              className="w-full rounded-xl py-3 mt-3 font-800 text-sm transition-all active:scale-95"
              icon={IconPlus}
              label="Ajouter des exercices"
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px dashed ${withAlpha(accent, 0.3)}`,
                color: accent,
              }}
              onClick={() => {
                setShowPicker(true);
              }}
            />
          </div>
        </div>

        <div className="shrink-0 mt-4 flex items-center gap-2">
          <Button
            className="flex-1 rounded-2xl py-4 font-900 text-sm transition-all active:scale-95"
            label="Appliquer"
            style={{ backgroundColor: accent, color: '#0d0d0d' }}
            onClick={applyDraft}
          />
          {isFree && (
            <button
              aria-label="Reset"
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95"
              style={{ backgroundColor: '#1a1a1a', color: '#888' }}
              onClick={handleResetConfig}>
              <IconRotateCcw />
            </button>
          )}
        </div>
      </div>

      {showPicker && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{ backgroundColor: '#000000a0', zIndex: 60 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPicker(false);
          }}>
          <div
            className="rounded-t-3xl px-5 pt-5 pb-6 flex flex-col"
            style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '72%' }}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="font-900 text-lg">Choisir des exercices</p>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none"
                style={{ backgroundColor: '#2a2a2a', color: '#888' }}
                onClick={() => {
                  setShowPicker(false);
                }}>
                ×
              </button>
            </div>
            <div className="overflow-y-auto space-y-2">
              {exercises.map((e) => {
                const selected = draft.exerciseIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                    style={{
                      backgroundColor: selected ? withAlpha(accent, 0.12) : '#1a1a1a',
                      border: `1px solid ${selected ? withAlpha(accent, 0.35) : '#2a2a2a'}`,
                    }}
                    onClick={() => {
                      setDraft((d) => ({
                        ...d,
                        exerciseIds: selected
                          ? d.exerciseIds.filter((id) => id !== e.id)
                          : [...d.exerciseIds, e.id],
                      }));
                    }}>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: exerciseColor(e) }}
                    />
                    <span className="font-800 text-sm flex-1">{e.name}</span>
                    <span
                      className="text-xs font-900"
                      style={{ color: selected ? accent : '#444' }}>
                      {selected ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (done) {
    return (
      <div
        className="flex flex-col h-full relative"
        style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)' }}>
        <div className="px-5 pt-8 pb-4 text-center">
          <p className="font-900 text-sm" style={{ color: accent }}>
            {localCircuit.name}
          </p>
          <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
            Tabata terminé
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div
            className="rounded-2xl p-5 mb-4 text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p className="text-4xl font-900 mb-2" style={{ color: accent }}>
              ✓
            </p>
            <p className="text-xl font-900">Circuit complété</p>
            <p className="text-sm font-600 mt-2" style={{ color: '#888' }}>
              Durée {formatDuration(elapsedSec)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-2xl font-900" style={{ color: accent }}>
                {TOTAL_CYCLES}
              </p>
              <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
                Cycles
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-2xl font-900" style={{ color: '#fff' }}>
                {TOTAL_ROUNDS}
              </p>
              <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
                Rounds / cycle
              </p>
            </div>
          </div>

          <p
            className="text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: '#555' }}>
            Exercices
          </p>
          <div className="space-y-2 mb-6">
            {exerciseNames.map((name, i) => {
              const key = `${name}-${i}`;
              return (
                <div
                  key={key}
                  className="rounded-xl px-4 py-3 font-800 text-sm"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  {name}
                </div>
              );
            })}
          </div>

          {isFree ? (
            <Button
              className="w-full rounded-2xl py-4 font-900 text-sm transition-all active:scale-95"
              label="Recommencer"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={handleReset}
            />
          ) : (
            <Button
              className="w-full rounded-2xl py-4 font-900 text-sm transition-all active:scale-95"
              label="Fermer"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={onClose}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)' }}>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between gap-2">
        {isFree ? (
          <div className="w-10 shrink-0" />
        ) : (
          <button
            aria-label="Fermer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl leading-none font-900 shrink-0"
            style={{ backgroundColor: '#1a1a1a', color: '#888' }}
            onClick={onClose}>
            ×
          </button>
        )}
        <div className="text-center flex-1 min-w-0">
          <p className="font-900 text-sm truncate" style={{ color: accent }}>
            {localCircuit.name}
          </p>
          <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
            Tabata
          </p>
        </div>
        {isFree ? (
          <button
            aria-label="Configuration"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1a1a1a', color: '#888' }}
            onClick={openSheet}>
            <IconGear />
          </button>
        ) : (
          <div className="w-10 shrink-0" />
        )}
      </div>

      <div className="px-5 flex gap-3 mb-4">
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
              {Array.from({ length: bar.total }).map((_, i) => {
                const key = `${i}`;
                return (
                  <div
                    key={key}
                    className="h-1.5 flex-1 rounded-full"
                    style={{ backgroundColor: i < bar.value ? bar.color : '#2a2a2a' }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="relative">
          <svg height={TIMER_SIZE} style={{ transform: 'rotate(-90deg)' }} width={TIMER_SIZE}>
            <circle
              cx={TIMER_CX}
              cy={TIMER_CX}
              fill="none"
              r={TIMER_R}
              stroke="#2a2a2a"
              strokeWidth="8"
            />
            <circle
              cx={TIMER_CX}
              cy={TIMER_CX}
              fill="none"
              r={TIMER_R}
              stroke={phaseColor}
              strokeDasharray={`${circumference * progress} ${circumference}`}
              strokeLinecap="round"
              strokeWidth="8"
              style={{ transition: 'stroke-dasharray 0.5s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-900 leading-none" style={{ color: '#fff', fontSize: 64 }}>
              {`${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`}
            </span>
            <span
              className="text-xs font-900 tracking-widest uppercase px-4 py-1.5 rounded-full mt-3"
              style={{
                backgroundColor: withAlpha(phaseColor, 0.12),
                color: phaseColor,
              }}>
              {phaseLabel}
            </span>
          </div>
        </div>

        <div className="mt-8 w-full text-center px-5 py-5">
          <p className="text-xs font-800 tracking-widest uppercase mb-2" style={{ color: '#666' }}>
            {infoContext}
          </p>
          <p className="text-2xl font-900 leading-tight">{infoMain}</p>
          {showNext && (
            <p className="text-base font-700 mt-3" style={{ color: '#888' }}>
              {phase === TimerPhase.PREP ? 'Premier' : 'Suivant'} : {nextExerciseName}
            </p>
          )}
        </div>
      </div>

      <div className={cn('px-5 flex items-center justify-center', {
        'pb-10': !isFree,
        'pb-4': isFree,
      })}>
        <button
          aria-label={isRunning ? 'Pause' : 'Lecture'}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          style={{
            backgroundColor: phaseColor,
            color: '#0d0d0d',
            transition: 'background-color 0.3s ease, transform 0.15s ease',
          }}
          onClick={handlePlayPause}>
          {isRunning ? (
            <IconPause />
          ) : (
            <span style={{ marginLeft: 4 }}>
              <IconPlay />
            </span>
          )}
        </button>
      </div>

      {sheet}
    </div>
  );
}
