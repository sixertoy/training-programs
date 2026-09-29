import cn from 'classnames';
import type { CSSProperties } from 'react';

import { IconPlus } from '../../assets/icons';
import { circuitDurationMin } from '../../helpers';
import type { Circuit, Exercise } from '../../interfaces';
import ui from '../../styles/ui.module.scss';

export interface CircuitsScreenProps {
  circuits: Circuit[];
  exercises: Exercise[];
  onCreateNew: () => void;
  onEdit: (id: string) => void;
}

export function CircuitsScreen({ circuits, exercises, onCreateNew, onEdit }: CircuitsScreenProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-900">Mes Circuits</h1>
          <p className={cn('text-sm mt-0.5', ui.textMuted)}>
            {circuits.length} circuit{circuits.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90',
            ui.primaryFab,
          )}
          onClick={onCreateNew}>
          <IconPlus />
        </button>
      </div>
      <div className="px-5 space-y-3 pb-6">
        {circuits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-5xl">💪</p>
            <p className={cn('font-800 text-center', ui.textDim)}>Aucun circuit encore</p>
            <button
              className={cn('px-6 py-3.5 rounded-2xl font-900', ui.primaryFab)}
              onClick={onCreateNew}>
              Créer mon premier circuit
            </button>
          </div>
        )}
        {circuits.map((c) => {
          const exs = exercises.filter((e) => c.exerciseIds.includes(e.id));
          const itemStyle = { '--item-color': c.color } as CSSProperties;
          return (
            <div
              key={c.id}
              className={cn('rounded-2xl overflow-hidden', ui.card)}
              style={itemStyle}>
              <div className={cn('h-1.5 w-full', ui.itemColorBar)} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-900 text-base">{c.name}</h3>
                    <p className={cn('text-xs font-700 mt-1', ui.textDim)}>
                      {c.cycles} cycles · {c.rounds} rounds · ~{circuitDurationMin(c)} min
                    </p>
                  </div>
                  <button
                    className={cn(
                      'text-xs font-800 px-3 py-1.5 rounded-xl transition-all active:scale-95 shrink-0',
                      ui.itemTintButton,
                    )}
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
                      className={cn('text-xs font-700 px-2.5 py-1 rounded-full', ui.chipMuted)}>
                      {b}
                    </span>
                  ))}
                </div>

                {exs.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {exs.map((e) => {
                      const exerciseStyle = { '--item-color': e.color } as CSSProperties;
                      return (
                        <div
                          key={e.id}
                          className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-xl',
                            ui.itemTintBg,
                          )}
                          style={exerciseStyle}>
                          <div className={cn('w-2 h-2 rounded-full', ui.itemColorBar)} />
                          <span className={cn('text-xs font-800', ui.itemTintText)}>{e.name}</span>
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
