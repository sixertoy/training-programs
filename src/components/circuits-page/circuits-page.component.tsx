import { IconPlus } from '../../assets/icons';
import { t } from '../../i18n';
import { Button } from '../button';

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

function circuitDurationMin(circuit: Circuit): number {
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

export function CircuitsPage({
  accent,
  circuits,
  exercises,
  onCreateNew,
  onEdit,
}: {
  circuits: Circuit[];
  exercises: Exercise[];
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  accent: string;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-900">{t('circuits.title')}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#888' }}>
            {t('circuits.count', { count: circuits.length })}
          </p>
        </div>
        <button
          aria-label={t('common.aria.createCircuit')}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ backgroundColor: accent, color: '#0d0d0d' }}
          onClick={onCreateNew}>
          <IconPlus />
        </button>
      </div>

      <div className="px-5 space-y-3 pb-6">
        {circuits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-5xl">💪</p>
            <p className="font-800 text-center" style={{ color: '#555' }}>
              {t('circuits.empty')}
            </p>
            <Button
              className="px-6 py-3.5 rounded-2xl font-900"
              label={t('circuits.createFirst')}
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={onCreateNew}
            />
          </div>
        )}
        {circuits.map((c) => {
          const exs = exercises.filter((e) => c.exerciseIds.includes(e.id));
          return (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="h-1.5 w-full" style={{ backgroundColor: c.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-900 text-base">{c.name}</h3>
                    <p className="text-xs font-700 mt-1" style={{ color: '#555' }}>
                      {t('circuits.meta', {
                        cycles: c.cycles,
                        duration: circuitDurationMin(c),
                        rounds: c.rounds,
                      })}
                    </p>
                  </div>
                  <Button
                    className="text-xs font-800 px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
                    label={t('common.edit')}
                    style={{ backgroundColor: withAlpha(c.color, 0.12), color: c.color }}
                    onClick={() => {
                      onEdit(c.id);
                    }}
                  />
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  {[
                    {
                      id: 'work',
                      label: t('circuits.badge.work', { seconds: c.exerciseTime }),
                    },
                    {
                      id: 'rest',
                      label: t('circuits.badge.rest', { seconds: c.restBetweenExercises }),
                    },
                    {
                      id: 'interCycle',
                      label: t('circuits.badge.interCycle', { seconds: c.restBetweenCycles }),
                    },
                    {
                      id: 'prep',
                      label: t('circuits.badge.prep', { seconds: c.prepTime }),
                    },
                  ].map((b) => (
                    <span
                      key={b.id}
                      className="text-xs font-700 px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#2a2a2a', color: '#666' }}>
                      {b.label}
                    </span>
                  ))}
                </div>

                {exs.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {exs.map((e) => {
                      const color = exerciseColor(e);
                      return (
                        <div
                          key={e.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                          style={{ backgroundColor: withAlpha(color, 0.12) }}>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-800" style={{ color }}>
                            {e.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
