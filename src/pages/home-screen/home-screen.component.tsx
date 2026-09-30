import cn from 'classnames';
import { Link } from 'react-router';

import { IconGear, IconPlay } from '../../assets/icons';
import { resolveRoutePath } from '../../config';
import type { NextSession, UserProfile } from '../../interfaces';
import { findMuscleGroup } from '../../mocks';
import ui from '../../styles/ui.module.scss';

export interface HomeScreenProps {
  bodyPartCount: Record<string, number>;
  maxCount: number;
  nextSession: NextSession | null;
  profile: UserProfile;
  sortedParts: string[];
  sparkData: number[];
  sparkMax: number;
  totalExerciseReps: number;
  totalHours: number;
  totalMinsRem: number;
  totalSessions: number;
}

export function HomeScreen({
  bodyPartCount,
  maxCount,
  nextSession,
  profile,
  sortedParts,
  sparkData,
  sparkMax,
  totalExerciseReps,
  totalHours,
  totalMinsRem,
  totalSessions,
}: HomeScreenProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-5 flex items-start justify-between">
        <div>
          <p className={cn('text-xs font-800 tracking-widest uppercase', ui.accentText)}>
            Lundi · 16 sept. 2026
          </p>
          <h1 className="text-3xl font-900 mt-1">Bonjour,</h1>
          <p className={cn('text-3xl font-900', ui.accentText)}>
            {profile.firstName || 'Athlète'} 👊
          </p>
        </div>
        <Link
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center mt-2 transition-all active:scale-90 no-underline',
            ui.iconButton,
          )}
          to={resolveRoutePath('profile')}>
          <IconGear />
        </Link>
      </div>

      {nextSession && (
        <div className="mx-5 mb-5">
          <p className={cn('text-xs font-800 tracking-widest uppercase mb-2.5', ui.sectionLabel)}>
            Prochaine séance
          </p>
          <div
            className={cn('rounded-2xl p-5 flex items-center justify-between', ui.nextSessionCard)}>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    'text-xs font-900 tracking-widest uppercase px-2.5 py-1 rounded-full',
                    ui.accentTint13,
                  )}>
                  {nextSession.day}
                </span>
                <span className={cn('text-xs font-700', ui.textDim)}>demain</span>
              </div>
              <p className="text-xl font-900">{nextSession.circuit}</p>
              <p className={cn('text-sm font-600 mt-1', ui.textBody)}>
                {nextSession.exercises} exercices
              </p>
            </div>
            <Link
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 no-underline',
                ui.accentBg,
              )}
              to={resolveRoutePath('timer')}>
              <span className={ui.textOnAccent}>
                <span className={ui.playIconOffset}>
                  <IconPlay />
                </span>
              </span>
            </Link>
          </div>
        </div>
      )}

      <div className="px-5 mb-5">
        <p className={cn('text-xs font-800 tracking-widest uppercase mb-2.5', ui.sectionLabel)}>
          Statistiques globales
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Entraîné', value: `${totalHours}h${totalMinsRem > 0 ? totalMinsRem : ''}` },
            { label: 'Séances', value: `${totalSessions}` },
            { label: 'Exercices', value: `${totalExerciseReps}` },
          ].map((s) => (
            <div
              key={s.label}
              className={cn('rounded-2xl p-4 flex flex-col items-center text-center', ui.card)}>
              <p className={cn('text-2xl font-900 leading-tight', ui.accentText)}>{s.value}</p>
              <p className={cn('text-xs font-700 mt-1', ui.textDim)}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={cn('mx-5 mb-5 rounded-2xl p-4', ui.card)}>
        <div className="flex items-center justify-between mb-3">
          <p className={cn('text-xs font-800 tracking-widest uppercase', ui.sectionLabel)}>
            Volume / semaine
          </p>
          <p className={cn('text-xs font-700', ui.accentText)}>5 sem.</p>
        </div>
        <div className="flex items-end gap-1.5 h-14">
          {sparkData.map((val, i) => (
            <div key={`spark-${val}-${i}`} className="flex-1">
              <div
                className={cn(
                  'w-full rounded-t-md',
                  ui.sparkBar,
                  i === sparkData.length - 1 ? ui.sparkBarActive : ui.sparkBarMuted,
                )}
                style={{
                  height: `${Math.round((val / sparkMax) * 100)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2">
          {['S33', 'S34', 'S35', 'S36', 'S37'].map((s, i) => (
            <p
              key={s}
              className={cn(
                'flex-1 text-center text-xs font-700',
                i === 4 ? ui.weekLabelActive : ui.weekLabelInactive,
              )}>
              {s}
            </p>
          ))}
        </div>
      </div>

      <div className={cn('mx-5 mb-5 rounded-2xl p-4', ui.card)}>
        <p className={cn('text-xs font-800 tracking-widest uppercase mb-4', ui.sectionLabel)}>
          Parties du corps travaillées
        </p>
        <div className="space-y-3">
          {sortedParts.map((partId) => {
            const count = bodyPartCount[partId];
            const group = findMuscleGroup(partId);
            const pct = (count / maxCount) * 100;
            return (
              <div key={partId}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={cn('text-sm font-800', count > 0 ? ui.textSoft : ui.textFaint)}>
                    {group?.name ?? partId}
                  </span>
                  <span
                    className={cn('text-xs font-900', count <= 0 && ui.textGhost)}
                    style={count > 0 ? { color: group?.color } : undefined}>
                    {count > 0 ? `${count}×` : '—'}
                  </span>
                </div>
                <div className={cn('h-1.5 rounded-full', ui.progressTrack)}>
                  {count > 0 && (
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: group?.color,
                        width: `${pct}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Link
        className={cn(
          'mx-5 mb-8 rounded-2xl py-3.5 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95 no-underline',
          ui.ghostButton,
        )}
        to={resolveRoutePath('weekly')}>
        Voir le programme complet →
      </Link>
    </div>
  );
}
