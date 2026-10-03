import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { IconBack, IconPlus } from '../../assets/icons';
import { t } from '../../i18n';
import { AccentColorPicker } from '../accent-color-picker';
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

function humanizeKey(key: string): string {
  if (!key) return key;
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
}

function exerciseColor(exercise: Exercise): string {
  return TAG_COLORS[exercise.tags[0]] ?? '#888';
}

export function CreateCircuitPage({
  accent,
  exercises,
  initial,
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (c: Circuit) => void;
  exercises: Exercise[];
  initial?: Circuit;
  accent: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? AccentColor.ORANGE);
  const [prepTime, setPrepTime] = useState(initial?.prepTime ?? 10);
  const [exerciseTime, setExerciseTime] = useState(initial?.exerciseTime ?? 45);
  const [restBetweenExercises, setRestBetweenExercises] = useState(
    initial?.restBetweenExercises ?? 15,
  );
  const [rounds, setRounds] = useState(initial?.rounds ?? 4);
  const [cycles, setCycles] = useState(initial?.cycles ?? 3);
  const [restBetweenCycles, setRestBetweenCycles] = useState(initial?.restBetweenCycles ?? 60);
  const [recoveryTime, setRecoveryTime] = useState(initial?.recoveryTime ?? 90);
  const [exerciseIds, setExerciseIds] = useState<string[]>(initial?.exerciseIds ?? []);
  const [showPicker, setShowPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  const durationMin = circuitDurationMin({
    cycles,
    exerciseTime,
    prepTime,
    recoveryTime,
    restBetweenCycles,
    restBetweenExercises,
    rounds,
  });
  const selectedExercises = exerciseIds
    .map((id) => exercises.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];

  const handleSave = () => {
    if (!name.trim()) return;
    setSaved(true);
    setTimeout(() => {
      onSave({
        color,
        cycles,
        exerciseIds,
        exerciseTime,
        id: initial?.id ?? uuidv4(),
        name: name.trim(),
        prepTime,
        recoveryTime,
        restBetweenCycles,
        restBetweenExercises,
        rounds,
      });
      onBack();
    }, 600);
  };

  const moveExercise = (i: number, dir: -1 | 1) => {
    const ids = [...exerciseIds];
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setExerciseIds(ids);
  };

  const timingRows = [
    {
      id: 'prepTime',
      label: t('tabata.config.timing.prep'),
      onChange: setPrepTime,
      step: 5,
      unit: 'sec',
      value: prepTime,
    },
    {
      id: 'exerciseTime',
      label: t('tabata.config.timing.exercise'),
      onChange: setExerciseTime,
      step: 5,
      unit: 'sec',
      value: exerciseTime,
    },
    {
      id: 'restBetweenExercises',
      label: t('tabata.config.timing.restBetweenExercises'),
      onChange: setRestBetweenExercises,
      step: 5,
      unit: 'sec',
      value: restBetweenExercises,
    },
    {
      id: 'rounds',
      label: t('tabata.config.timing.roundsPerCycle'),
      min: 1,
      onChange: setRounds,
      step: 1,
      unit: '×',
      value: rounds,
    },
    {
      id: 'cycles',
      label: t('tabata.config.timing.cyclesCount'),
      min: 1,
      onChange: setCycles,
      step: 1,
      unit: '×',
      value: cycles,
    },
    {
      id: 'restBetweenCycles',
      label: t('tabata.config.timing.restBetweenCycles'),
      onChange: setRestBetweenCycles,
      step: 15,
      unit: 'sec',
      value: restBetweenCycles,
    },
    {
      id: 'recoveryTime',
      label: t('tabata.config.timing.finalRecovery'),
      onChange: setRecoveryTime,
      step: 15,
      unit: 'sec',
      value: recoveryTime,
    },
  ];

  let saveLabel = t('createCircuit.save.create');
  if (saved) saveLabel = t('createCircuit.save.saved');
  else if (initial) saveLabel = t('createCircuit.save.edit');
  let saveBg = '#2a2a2a';
  if (saved) saveBg = '#8bcf00';
  else if (name.trim()) saveBg = accent;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-5 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
            onClick={onBack}>
            <IconBack />
          </button>
          <h1 className="text-2xl font-900">
            {initial ? t('createCircuit.title.edit') : t('createCircuit.title.create')}
          </h1>
        </div>

        <div className="px-5 space-y-5 pb-8">
          {/* Name */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              {t('createCircuit.field.name')}
            </label>
            <input
              className="w-full rounded-xl px-4 py-3.5 font-700 text-base outline-none"
              placeholder={t('createCircuit.field.namePlaceholder')}
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f5f5f5' }}
              type="text"
              value={name}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a2a';
              }}
              onChange={(e) => {
                setName(e.target.value);
              }}
              onFocus={(e) => {
                e.target.style.borderColor = withAlpha(accent, 0.4);
              }}
            />
          </div>

          {/* Color */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              {t('createCircuit.field.color')}
            </label>
            <AccentColorPicker value={color} onChange={setColor} />
          </div>

          {/* Timing */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              {t('createCircuit.field.timing')}
            </label>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              {timingRows.map((row, idx) => (
                <div
                  key={row.id}
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
                    value={row.value}
                    onChange={row.onChange}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs font-600 mt-2.5 leading-relaxed" style={{ color: '#666' }}>
              {t('createCircuit.restHint')}
            </p>
            <p className="text-xs font-700 mt-2 text-right" style={{ color: '#555' }}>
              {t('createCircuit.estimatedDuration', { minutes: durationMin })}
            </p>
          </div>

          {/* Exercises */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              {t('createCircuit.field.exercises', { count: exerciseIds.length })}
            </label>
            {selectedExercises.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedExercises.map((e, i) => {
                  const tagColor = exerciseColor(e);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-900 text-sm shrink-0"
                        style={{ backgroundColor: withAlpha(tagColor, 0.15), color: tagColor }}>
                        {i + 1}
                      </div>
                      <p className="font-800 text-sm flex-1 min-w-0 truncate">{e.name}</p>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          className="w-7 h-7 rounded-lg text-sm font-900"
                          label="↑"
                          style={{ backgroundColor: '#2a2a2a', color: i > 0 ? '#888' : '#333' }}
                          onClick={() => {
                            moveExercise(i, -1);
                          }}
                        />
                        <Button
                          className="w-7 h-7 rounded-lg text-sm font-900"
                          label="↓"
                          style={{
                            backgroundColor: '#2a2a2a',
                            color: i < exerciseIds.length - 1 ? '#888' : '#333',
                          }}
                          onClick={() => {
                            moveExercise(i, 1);
                          }}
                        />
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-900 leading-none"
                          style={{ backgroundColor: '#2a2a2a', color: '#FF6B6B' }}
                          onClick={() => {
                            setExerciseIds(exerciseIds.filter((id) => id !== e.id));
                          }}>
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Button
              className="w-full rounded-xl py-3 font-800 text-sm transition-all active:scale-95"
              icon={IconPlus}
              label={t('createCircuit.addExercises')}
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

          {/* Save */}
          <Button
            className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95"
            disabled={!name.trim() || saved}
            label={saveLabel}
            style={{
              backgroundColor: saveBg,
              color: name.trim() ? '#0d0d0d' : '#555',
            }}
            onClick={handleSave}
          />
        </div>
      </div>

      {/* Exercise Picker */}
      {showPicker && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{ backgroundColor: '#00000090', zIndex: 50 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPicker(false);
          }}>
          <div
            className="rounded-t-3xl px-5 pt-5 pb-6 flex flex-col"
            style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '72%' }}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <p className="font-900 text-lg">{t('createCircuit.picker.title')}</p>
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
                const selected = exerciseIds.includes(e.id);
                const tagColor = exerciseColor(e);
                return (
                  <button
                    key={e.id}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all"
                    style={{
                      backgroundColor: selected ? withAlpha(tagColor, 0.1) : '#1a1a1a',
                      border: `1px solid ${selected ? withAlpha(tagColor, 0.4) : '#2a2a2a'}`,
                    }}
                    onClick={() => {
                      setExerciseIds(
                        selected ? exerciseIds.filter((id) => id !== e.id) : [...exerciseIds, e.id],
                      );
                    }}>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-900 shrink-0"
                      style={{ backgroundColor: withAlpha(tagColor, 0.15), color: tagColor }}>
                      {e.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-800 text-sm">{e.name}</p>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {e.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-700"
                            style={{ color: TAG_COLORS[tag] }}>
                            {humanizeKey(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tagColor }}>
                        <svg
                          fill="none"
                          height="10"
                          stroke="#000"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3.5"
                          viewBox="0 0 24 24"
                          width="10">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              className="mt-4 w-full rounded-2xl py-3.5 font-900 shrink-0"
              label={t('createCircuit.confirmExercises', { count: exerciseIds.length })}
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={() => {
                setShowPicker(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
