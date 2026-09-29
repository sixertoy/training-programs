import { IconPlus } from '../../assets/icons';
import { circuitDurationMin, withAlpha } from '../../helpers';
import type { Circuit, Exercise } from '../../interfaces';

interface CircuitsScreenProps {
  accent: string;
  circuits: Circuit[];
  exercises: Exercise[];
  onCreateNew: () => void;
  onEdit: (id: string) => void;
}

export function CircuitsScreen({
  accent,
  circuits,
  exercises,
  onCreateNew,
  onEdit,
}: CircuitsScreenProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-900">Mes Circuits</h1>
          <p className="text-sm mt-0.5" style={{ color: '#888' }}>
            {circuits.length} circuit{circuits.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
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
              Aucun circuit encore
            </p>
            <button
              className="px-6 py-3.5 rounded-2xl font-900"
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={onCreateNew}>
              Créer mon premier circuit
            </button>
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
                      {c.cycles} cycles · {c.rounds} rounds · ~{circuitDurationMin(c)} min
                    </p>
                  </div>
                  <button
                    className="text-xs font-800 px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0"
                    style={{ backgroundColor: withAlpha(c.color, 0.12), color: c.color }}
                    onClick={() => {
                      onEdit(c.id);
                    }}>
                    Éditer
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  {[
                    `⚡ ${c.exerciseTime}s travail`,
                    `💤 ${c.restBetweenExercises}s repos`,
                    `🔄 ${c.restBetweenCycles}s inter-cycle`,
                    `🏁 ${c.prepTime}s prép.`,
                  ].map((b) => (
                    <span
                      key={b}
                      className="text-xs font-700 px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#2a2a2a', color: '#666' }}>
                      {b}
                    </span>
                  ))}
                </div>

                {exs.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {exs.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                        style={{ backgroundColor: withAlpha(e.color, 0.12) }}>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                        <span className="text-xs font-800" style={{ color: e.color }}>
                          {e.name}
                        </span>
                      </div>
                    ))}
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
