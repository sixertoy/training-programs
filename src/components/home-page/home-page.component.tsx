import { format, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { IconFlash, IconPlay, IconUser } from '../../assets/icons';
import { WEEK_HISTORY } from '../../data/week-history';
import type { Gender, ViewMode } from '../../enums';
import { ActivityCategory } from '../../enums';
import type { DayProgram } from '../../interfaces';
import {
  ACTIVITY_CATEGORY_LABELS,
  circuitMuscleKey,
  computeCaloriesBurned,
  computeCategoryRatioLast30Days,
  computeCategoryTotals,
  computeMonthlyVolume,
  computePersonalBestMonth,
  computeRecoveryIndex,
  computeStreakAlert,
  computeStreakDays,
  computeStreakWeeks,
  dayExerciseCount,
  dayPrimaryLabel,
  daySummaryLabel,
  DEFAULT_ACTIVITY_COLORS,
  firstTrainingCircuitId,
  flattenDatedDays,
} from '../../utils';
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

const DAY_SHORTS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  accentColor: string;
  defaultProgrammeView: ViewMode;
  streakGraceDays: number;
}

interface NextSession {
  circuit: string;
  circuitId?: string;
  day: string;
  exercises: number;
}

interface GlobalStats {
  bodyPartCount: Record<string, number>;
  maxCount: number;
  totalExerciseReps: number;
  totalMin: number;
  totalSessions: number;
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

const BODY_PARTS = ['shoulders', 'back', 'legs', 'abs', 'arms', 'chest', 'glutes', 'cardio'];

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

const CIRCUIT_MUSCLES: Record<string, string[]> = {
  cardio_hiit: ['cardio', 'legs'],
  force_lower: ['legs', 'glutes'],
  force_upper: ['shoulders', 'back', 'arms', 'chest'],
  full_body: ['shoulders', 'back', 'legs', 'abs', 'arms', 'chest', 'glutes', 'cardio'],
  leg_day: ['legs', 'glutes'],
  mobility: ['back', 'shoulders', 'legs'],
  pull_day: ['back', 'arms'],
  push_day: ['shoulders', 'chest', 'arms'],
};

function getNextSession(days: DayProgram[], todayIndex: number): NextSession | null {
  const nextIndex = days.findIndex(
    (day, i) => i > todayIndex && !day.isRest && day.activities.length > 0,
  );
  if (nextIndex < 0) return null;
  const day = days[nextIndex];
  const training = day.activities.find(
    (activity) => activity.category === ActivityCategory.TRAINING,
  );
  const primary = training ?? day.activities[0];
  return {
    circuit: primary.name,
    circuitId: training?.meta.circuitId,
    day: DAY_SHORTS[nextIndex] ?? '',
    exercises: dayExerciseCount(day),
  };
}

function computeGlobalStats(
  weeks: typeof WEEK_HISTORY,
  bodyParts: readonly string[],
  circuitMuscles: Record<string, readonly string[]>,
): GlobalStats {
  const pastWeeks = weeks.slice(1);
  const totalMin = pastWeeks.reduce((sum, week) => sum + week.stats.totalMin, 0);
  const totalSessions = pastWeeks.reduce((sum, week) => sum + week.stats.sessions, 0);
  const totalExerciseReps = pastWeeks.reduce((sum, week) => {
    const weekReps = week.days.reduce((daySum, day) => daySum + dayExerciseCount(day), 0);
    return sum + weekReps;
  }, 0);
  const bodyPartCount: Record<string, number> = {};

  for (const part of bodyParts) {
    bodyPartCount[part] = 0;
  }

  for (const week of pastWeeks) {
    for (const day of week.days) {
      if (!day.isRest) {
        for (const activity of day.activities) {
          if (activity.category === ActivityCategory.TRAINING) {
            const key = circuitMuscleKey(activity.name);
            for (const muscle of circuitMuscles[key] ?? []) {
              bodyPartCount[muscle] = (bodyPartCount[muscle] ?? 0) + 1;
            }
          }
        }
      }
    }
  }

  return {
    bodyPartCount,
    maxCount: Math.max(...Object.values(bodyPartCount), 1),
    totalExerciseReps,
    totalMin,
    totalSessions,
  };
}

function getTodayIndex(date: Date = new Date()): number {
  return (getDay(date) + 6) % 7;
}

function humanizeKey(key: string): string {
  if (!key) return key;
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
}

export function HomePage({
  accent,
  circuits,
  currentWeekDays,
  onGoToFreeTabata,
  onGoToProfile,
  onGoToTimer,
  onGoToWeekly,
  profile,
  weekPrograms,
}: {
  onGoToFreeTabata: () => void;
  onGoToTimer: () => void;
  onGoToWeekly: () => void;
  onGoToProfile: () => void;
  profile: UserProfile;
  currentWeekDays: DayProgram[];
  weekPrograms: Record<string, DayProgram[]>;
  circuits: Circuit[];
  accent: string;
}) {
  const { bodyPartCount, maxCount, totalExerciseReps, totalMin, totalSessions } =
    computeGlobalStats(WEEK_HISTORY, BODY_PARTS, CIRCUIT_MUSCLES);
  const todayIndex = getTodayIndex();
  const nextSession = getNextSession(currentWeekDays, todayIndex);
  const sortedParts = [...BODY_PARTS].sort((a, b) => bodyPartCount[b] - bodyPartCount[a]);
  const totalHours = Math.floor(totalMin / 60);
  const totalMinsRem = totalMin % 60;
  const todayLabel = format(new Date(), 'EEEE · dd MMM yyyy', { locale: fr });
  const todayHeading = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);
  const todayProgram = currentWeekDays[todayIndex];
  const today = new Date();
  const datedDays = flattenDatedDays(WEEK_HISTORY, weekPrograms);
  const { streak: dayStreak } = computeStreakDays(datedDays, today, profile.streakGraceDays);
  const weekStreak = computeStreakWeeks(datedDays, today, profile.streakGraceDays);
  const streakAlert = computeStreakAlert(datedDays, today, profile.streakGraceDays, dayStreak);
  const personalBest = computePersonalBestMonth(datedDays, circuits);
  const personalBestHours = Math.floor(personalBest.totalMin / 60);
  const calories = computeCaloriesBurned(datedDays, profile.weightKg, circuits);
  const monthlyVolume = computeMonthlyVolume(datedDays, circuits, 6, today);
  const categoryTotals = computeCategoryTotals(datedDays);
  const categoryRatio = computeCategoryRatioLast30Days(datedDays, today);
  const recovery = computeRecoveryIndex(datedDays, today);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const monthMax = Math.max(...monthlyVolume.map((m) => m.totalMin), 1);
  const pieTotal = categoryRatio.reduce((sum, item) => sum + item.value, 0);

  let alertStyle = {
    backgroundColor: withAlpha(accent, 0.12),
    border: `1px solid ${withAlpha(accent, 0.3)}`,
  };
  if (streakAlert.level === 'lost') {
    alertStyle = { backgroundColor: '#3a1515', border: '1px solid #FF6B6B55' };
  } else if (streakAlert.level === 'danger') {
    alertStyle = {
      backgroundColor: withAlpha('#FF6B35', 0.15),
      border: '1px solid #FF6B3555',
    };
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-800 tracking-widest uppercase" style={{ color: accent }}>
            {todayHeading}
          </p>
          <h1 className="text-3xl font-900 mt-1">Bonjour,</h1>
          <p className="text-3xl font-900" style={{ color: accent }}>
            {profile.firstName || 'Athlète'} 👊
          </p>
        </div>
        <button
          aria-label="Profil"
          className="w-10 h-10 rounded-full flex items-center justify-center mt-2 transition-all active:scale-90"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
          onClick={onGoToProfile}>
          <IconUser />
        </button>
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)` }}>
        <div className="p-5 flex items-center justify-between">
          <button className="text-left flex-1 min-w-0" onClick={onGoToWeekly}>
            <p
              className="text-xs font-800 tracking-widest uppercase"
              style={{ color: '#0d0d0d90' }}>
              Aujourd&apos;hui · {DAY_LABELS[todayIndex]}
            </p>
            <h2 className="text-2xl font-900 mt-1" style={{ color: '#0d0d0d' }}>
              {dayPrimaryLabel(todayProgram)}
            </h2>
            <p className="text-sm font-700 mt-1" style={{ color: '#0d0d0d80' }}>
              {todayProgram.isRest ? 'Modifier' : `${daySummaryLabel(todayProgram)} · Modifier`}
            </p>
          </button>
          {firstTrainingCircuitId(todayProgram) && (
            <button
              aria-label="Lancer le tabata"
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
              style={{ backgroundColor: '#0d0d0d' }}
              onClick={(e) => {
                e.stopPropagation();
                onGoToTimer();
              }}>
              <span style={{ color: accent, marginLeft: 3 }}>
                <IconPlay />
              </span>
            </button>
          )}
        </div>
      </div>

      <Button
        className="mx-5 mb-5 rounded-2xl py-3.5 font-900 text-sm transition-all active:scale-95"
        icon={IconFlash}
        label="Lancer un Tabata libre"
        style={{ backgroundColor: accent, color: '#0d0d0d' }}
        onClick={onGoToFreeTabata}
      />

      {!alertDismissed && streakAlert.level !== 'safe' && (
        <div
          className="mx-5 mb-4 rounded-2xl px-4 py-3.5 flex items-start gap-3"
          style={alertStyle}>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-800 tracking-widest uppercase mb-1"
              style={{ color: accent }}>
              Série
            </p>
            <p className="text-sm font-700" style={{ color: '#eee' }}>
              {streakAlert.message}
            </p>
          </div>
          <button
            aria-label="Fermer l'alerte"
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#2a2a2a', color: '#888' }}
            type="button"
            onClick={() => {
              setAlertDismissed(true);
            }}>
            ×
          </button>
        </div>
      )}

      <div className="mx-5 mb-5 grid grid-cols-2 gap-2.5">
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p className="text-xs font-800 tracking-widest uppercase mb-2" style={{ color: '#555' }}>
            Série
          </p>
          <p className="text-3xl font-900" style={{ color: accent }}>
            {dayStreak}
          </p>
          <p className="text-xs font-700 mt-1" style={{ color: '#888' }}>
            jours · {weekStreak} sem.
          </p>
        </div>
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p className="text-xs font-800 tracking-widest uppercase mb-2" style={{ color: '#555' }}>
            Record
          </p>
          <p className="text-2xl font-900" style={{ color: accent }}>
            {personalBestHours > 0 ? `${personalBestHours}h` : `${personalBest.totalMin}m`}
          </p>
          <p className="text-xs font-700 mt-1" style={{ color: '#888' }}>
            {personalBest.totalMin > 0
              ? `Ton record : ${personalBestHours}h en ${personalBest.label}`
              : 'Pas encore de record'}
          </p>
        </div>
      </div>

      {recovery.needsRecovery && (
        <div
          className="mx-5 mb-5 rounded-2xl px-4 py-3.5"
          style={{
            backgroundColor: withAlpha('#74C0FC', 0.1),
            border: '1px solid #74C0FC44',
          }}>
          <p
            className="text-xs font-800 tracking-widest uppercase mb-1"
            style={{ color: '#74C0FC' }}>
            Récupération
          </p>
          <p className="text-sm font-700" style={{ color: '#ddd' }}>
            {recovery.hardDays} jours intenses sans Flow — planifie une séance de mobilité.
          </p>
          <Button
            className="mt-2 text-xs font-800"
            label="Ouvrir le programme →"
            style={{ color: accent }}
            onClick={onGoToWeekly}
          />
        </div>
      )}

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
        <p className="text-xs font-800 tracking-widest uppercase mb-1" style={{ color: '#555' }}>
          Calories estimées
        </p>
        <p className="text-3xl font-900" style={{ color: accent }}>
          {calories}
          <span className="text-sm font-700 ml-1" style={{ color: '#888' }}>
            kcal
          </span>
        </p>
        <p className="text-xs font-600 mt-1" style={{ color: '#555' }}>
          Méthode MET · estimation
        </p>
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <p className="text-xs font-800 tracking-widest uppercase mb-3" style={{ color: '#555' }}>
          Charge mensuelle
        </p>
        <div style={{ height: 160, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={monthlyVolume}>
              <XAxis dataKey="label" stroke="#555" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis hide domain={[0, monthMax]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161616',
                  border: '1px solid #2a2a2a',
                  borderRadius: 12,
                }}
                formatter={(value) => [`${String(value)} min`, 'Volume']}
              />
              <Bar dataKey="totalMin" fill={accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mx-5 mb-5">
        <p className="text-xs font-800 tracking-widest uppercase mb-2.5" style={{ color: '#555' }}>
          Séances par catégorie
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [ActivityCategory.TRAINING, ActivityCategory.RUNNING, ActivityCategory.FLOW] as const
          ).map((category) => (
            <div
              key={category}
              className="rounded-2xl p-3 text-center"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-xl font-900" style={{ color: DEFAULT_ACTIVITY_COLORS[category] }}>
                {categoryTotals[category]}
              </p>
              <p className="text-xs font-700 mt-1" style={{ color: '#555' }}>
                {ACTIVITY_CATEGORY_LABELS[category]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <p className="text-xs font-800 tracking-widest uppercase mb-3" style={{ color: '#555' }}>
          Équilibre 30 jours
        </p>
        {pieTotal === 0 ? (
          <p className="text-sm font-700" style={{ color: '#555' }}>
            Pas encore d&apos;activités sur 30 jours
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <div style={{ height: 140, width: 140 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={categoryRatio}
                    dataKey="value"
                    innerRadius={36}
                    nameKey="label"
                    outerRadius={60}
                    stroke="none">
                    {categoryRatio.map((entry) => (
                      // Recharts Cell API still required for per-slice fill
                      // eslint-disable-next-line @typescript-eslint/no-deprecated
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryRatio.map((entry) => (
                <div key={entry.category} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs font-800 truncate">{entry.label}</span>
                  </div>
                  <span className="text-xs font-900" style={{ color: '#888' }}>
                    {Math.round((entry.value / pieTotal) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="mx-5 mb-5 rounded-2xl p-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <p className="text-xs font-800 tracking-widest uppercase mb-4" style={{ color: '#555' }}>
          Parties du corps travaillées
        </p>
        <div className="space-y-3">
          {sortedParts.map((part) => {
            const count = bodyPartCount[part];
            const pct = (count / maxCount) * 100;
            return (
              <div key={part}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-800" style={{ color: count > 0 ? '#ccc' : '#444' }}>
                    {humanizeKey(part)}
                  </span>
                  <span
                    className="text-xs font-900"
                    style={{ color: count > 0 ? TAG_COLORS[part] : '#333' }}>
                    {count > 0 ? `${count}×` : '—'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: '#2a2a2a' }}>
                  {count > 0 && (
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: TAG_COLORS[part], width: `${pct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        className="mx-5 mb-8 rounded-2xl py-3.5 font-800 text-sm transition-all active:scale-95"
        label="Voir le programme complet →"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
        onClick={onGoToWeekly}
      />
    </div>
  );
}
