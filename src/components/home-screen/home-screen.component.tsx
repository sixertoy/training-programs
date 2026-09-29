import { IconGear, IconPlay } from '../../assets/icons';
import { withAlpha } from '../../helpers';
import type { NextSession, UserProfile } from '../../interfaces';
import { findMuscleGroup } from '../../mocks';

export interface HomeScreenProps {
  accent: string;
  bodyPartCount: Record<string, number>;
  maxCount: number;
  nextSession: NextSession | null;
  onGoToProfile: () => void;
  onGoToTimer: () => void;
  onGoToWeekly: () => void;
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
  accent,
  bodyPartCount,
  maxCount,
  nextSession,
  onGoToProfile,
  onGoToTimer,
  onGoToWeekly,
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
          <p className="text-xs font-800 tracking-widest uppercase" style={{ color: accent }}>
            Lundi · 16 sept. 2026
          </p>
          <h1 className="text-3xl font-900 mt-1">Bonjour,</h1>
          <p className="text-3xl font-900" style={{ color: accent }}>
            {profile.firstName || 'Athlète'} 👊
          </p>
        </div>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center mt-2 transition-all active:scale-90"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
          onClick={onGoToProfile}>
          <IconGear />
        </button>
      </div>

      {nextSession && (
        <div className="mx-5 mb-5">
          <p
            className="text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: '#555' }}>
            Prochaine séance
          </p>
          <div
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
              border: `1px solid ${withAlpha(accent, 0.18)}`,
            }}>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-900 tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: withAlpha(accent, 0.13), color: accent }}>
                  {nextSession.day}
                </span>
                <span className="text-xs font-700" style={{ color: '#555' }}>
                  demain
                </span>
              </div>
              <p className="text-xl font-900">{nextSession.circuit}</p>
              <p className="text-sm font-600 mt-1" style={{ color: '#666' }}>
                {nextSession.exercises} exercices
              </p>
            </div>
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95"
              style={{ backgroundColor: accent }}
              onClick={onGoToTimer}>
              <span style={{ color: '#0d0d0d', marginLeft: 2 }}>
                <IconPlay />
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="px-5 mb-5">
        <p className="text-xs font-800 tracking-widest uppercase mb-2.5" style={{ color: '#555' }}>
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
              className="rounded-2xl p-4 flex flex-col items-center text-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-2xl font-900 leading-tight" style={{ color: accent }}>
                {s.value}
              </p>
              <p className="text-xs font-700 mt-1" style={{ color: '#555' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-800 tracking-widest uppercase" style={{ color: '#555' }}>
            Volume / semaine
          </p>
          <p className="text-xs font-700" style={{ color: accent }}>
            5 sem.
          </p>
        </div>
        <div className="flex items-end gap-1.5 h-14">
          {sparkData.map((val, i) => (
            <div key={i} className="flex-1">
              <div
                className="w-full rounded-t-md"
                style={{
                  backgroundColor: i === sparkData.length - 1 ? accent : withAlpha(accent, 0.2),
                  height: `${Math.round((val / sparkMax) * 100)}%`,
                  minHeight: 4,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2">
          {['S33', 'S34', 'S35', 'S36', 'S37'].map((s, i) => (
            <p
              key={s}
              className="flex-1 text-center text-xs font-700"
              style={{ color: i === 4 ? accent : '#333' }}>
              {s}
            </p>
          ))}
        </div>
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <p className="text-xs font-800 tracking-widest uppercase mb-4" style={{ color: '#555' }}>
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
                  <span className="text-sm font-800" style={{ color: count > 0 ? '#ccc' : '#444' }}>
                    {group?.name ?? partId}
                  </span>
                  <span
                    className="text-xs font-900"
                    style={{ color: count > 0 ? group?.color : '#333' }}>
                    {count > 0 ? `${count}×` : '—'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: '#2a2a2a' }}>
                  {count > 0 && (
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: group?.color, width: `${pct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="mx-5 mb-8 rounded-2xl py-3.5 font-800 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
        onClick={onGoToWeekly}>
        Voir le programme complet →
      </button>
    </div>
  );
}
