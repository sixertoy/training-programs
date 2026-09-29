import { useState } from 'react';

import { IconBack, IconPlus } from '../../assets/icons';
import { AccentColor, CARD_COLORS } from '../../enums';
import { circuitDurationMin, withAlpha } from '../../helpers';
import type { Circuit, Exercise } from '../../interfaces';
import { findMuscleGroup } from '../../mocks';
import { Stepper } from '../stepper';

export interface CreateCircuitScreenProps {
  accent: string;
  exercises: Exercise[];
  initial?: Circuit;
  onBack: () => void;
  onSave: (circuit: Circuit) => void;
}

export function CreateCircuitScreen({
  accent,
  exercises,
  initial,
  onBack,
  onSave,
}: CreateCircuitScreenProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? CARD_COLORS[0]);
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
        id: initial?.id ?? Date.now().toString(),
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
    { label: 'Préparation', onChange: setPrepTime, step: 5, unit: 'sec', value: prepTime },
    {
      label: "Temps d'exercice",
      onChange: setExerciseTime,
      step: 5,
      unit: 'sec',
      value: exerciseTime,
    },
    {
      label: 'Repos entre exercices',
      onChange: setRestBetweenExercises,
      step: 5,
      unit: 'sec',
      value: restBetweenExercises,
    },
    { label: 'Rounds / cycle', min: 1, onChange: setRounds, step: 1, unit: '×', value: rounds },
    { label: 'Nombre de cycles', min: 1, onChange: setCycles, step: 1, unit: '×', value: cycles },
    {
      label: 'Repos entre cycles',
      onChange: setRestBetweenCycles,
      step: 15,
      unit: 'sec',
      value: restBetweenCycles,
    },
    {
      label: 'Récupération finale',
      onChange: setRecoveryTime,
      step: 15,
      unit: 'sec',
      value: recoveryTime,
    },
  ];

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
            {initial ? 'Éditer le circuit' : 'Créer un Circuit'}
          </h1>
        </div>

        <div className="px-5 space-y-5 pb-8">
          {/* Name */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Nom du circuit
            </label>
            <input
              className="w-full rounded-xl px-4 py-3.5 font-700 text-base outline-none"
              placeholder="Ex: Force Upper Body"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f5f5f5' }}
              type="text"
              value={name}
              onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
              onChange={(e) => {
                setName(e.target.value);
              }}
              onFocus={(e) => (e.target.style.borderColor = withAlpha(accent, 0.4))}
            />
          </div>

          {/* Color */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Couleur
            </label>
            <div className="flex gap-2.5">
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  className="w-8 h-8 rounded-lg transition-all active:scale-90"
                  style={{
                    backgroundColor: c,
                    border: color === c ? '2.5px solid #fff' : '2.5px solid transparent',
                    transform: color === c ? 'scale(1.18)' : 'scale(1)',
                  }}
                  onClick={() => {
                    setColor(c);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timing */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Paramètres de timing
            </label>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              {timingRows.map((row, idx) => (
                <div
                  key={row.label}
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
            <p className="text-xs font-700 mt-2 text-right" style={{ color: '#555' }}>
              Durée estimée : ~{durationMin} min
            </p>
          </div>

          {/* Exercises */}
          <div>
            <label
              className="block text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: accent }}>
              Exercices ({exerciseIds.length})
            </label>
            {selectedExercises.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedExercises.map((e, i) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-900 text-sm shrink-0"
                      style={{ backgroundColor: withAlpha(e.color, 0.15), color: e.color }}>
                      {i + 1}
                    </div>
                    <p className="font-800 text-sm flex-1 min-w-0 truncate">{e.name}</p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-900"
                        style={{ backgroundColor: '#2a2a2a', color: i > 0 ? '#888' : '#333' }}
                        onClick={() => {
                          moveExercise(i, -1);
                        }}>
                        ↑
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-900"
                        style={{
                          backgroundColor: '#2a2a2a',
                          color: i < exerciseIds.length - 1 ? '#888' : '#333',
                        }}
                        onClick={() => {
                          moveExercise(i, 1);
                        }}>
                        ↓
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-900 leading-none"
                        style={{ backgroundColor: '#2a2a2a', color: AccentColor.CORAL }}
                        onClick={() => {
                          setExerciseIds(exerciseIds.filter((id) => id !== e.id));
                        }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              className="w-full rounded-xl py-3 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px dashed ${withAlpha(accent, 0.3)}`,
                color: accent,
              }}
              onClick={() => {
                setShowPicker(true);
              }}>
              <IconPlus /> Ajouter des exercices
            </button>
          </div>

          {/* Save */}
          <button
            className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            disabled={!name.trim() || saved}
            style={{
              backgroundColor: saved ? AccentColor.LEAF : name.trim() ? accent : '#2a2a2a',
              color: name.trim() ? '#0d0d0d' : '#555',
            }}
            onClick={handleSave}>
            {saved
              ? '✓ Circuit enregistré !'
              : initial
                ? 'Enregistrer les modifications'
                : 'Créer le circuit'}
          </button>
        </div>
      </div>

      {/* Exercise Picker */}
      {showPicker && (
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
                const selected = exerciseIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all"
                    style={{
                      backgroundColor: selected ? withAlpha(e.color, 0.1) : '#1a1a1a',
                      border: `1px solid ${selected ? withAlpha(e.color, 0.4) : '#2a2a2a'}`,
                    }}
                    onClick={() => {
                      setExerciseIds(
                        selected ? exerciseIds.filter((id) => id !== e.id) : [...exerciseIds, e.id],
                      );
                    }}>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-900 shrink-0"
                      style={{ backgroundColor: withAlpha(e.color, 0.15), color: e.color }}>
                      {e.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-800 text-sm">{e.name}</p>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {e.tags.map((tagId) => {
                          const group = findMuscleGroup(tagId);
                          return (
                            <span
                              key={tagId}
                              className="text-xs font-700"
                              style={{ color: group?.color }}>
                              {group?.name ?? tagId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {selected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: e.color }}>
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
            <button
              className="mt-4 w-full rounded-2xl py-3.5 font-900 shrink-0"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={() => {
                setShowPicker(false);
              }}>
              Confirmer ({exerciseIds.length} exercice{exerciseIds.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
