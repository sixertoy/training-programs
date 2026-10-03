import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  getISOWeek,
  getISOWeekYear,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import React, { useState } from 'react';

import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCouch,
  IconPlay,
  IconPlus,
  IconWeek,
} from '../../assets/icons';
import { WEEK_HISTORY } from '../../data/week-history';
import type { TabataMode } from '../../enums';
import { ActivityCategory, FlowKind, ViewMode } from '../../enums';
import type { TranslationKey } from '../../i18n';
import { dateFnsLocale, t } from '../../i18n';
import type { DayActivity, DayProgram } from '../../interfaces';
import {
  activityMetaLabel,
  circuitDurationMin,
  createFlowActivity,
  createRunningActivity,
  createTrainingActivity,
  dayDurationMin,
  dayExerciseCount,
  dayPrimaryLabel,
  daySummaryLabel,
  DEFAULT_ACTIVITY_COLORS,
  firstTrainingActivity,
  isSameDayProgram,
} from '../../utils';
import { Button } from '../button';
import { Stepper } from '../stepper';

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

type AddStep = 'idle' | 'category' | 'training' | 'running' | 'flow';

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;
const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

function dayFullLabel(index: number): string {
  return t(`common.days.full.${index}` as TranslationKey);
}

function dayShortLabel(index: number): string {
  return t(`common.days.short.${index}` as TranslationKey);
}

function activityCategoryLabel(category: ActivityCategory): string {
  return t(`activity.category.${category}`);
}

function flowKindLabel(kind: FlowKind): string {
  return t(`activity.flowKind.${kind}`);
}

const CATEGORY_ADD_STEP: Record<ActivityCategory, Exclude<AddStep, 'idle' | 'category'>> = {
  [ActivityCategory.FLOW]: 'flow',
  [ActivityCategory.RUNNING]: 'running',
  [ActivityCategory.TRAINING]: 'training',
};

function pickTone(
  isToday: boolean,
  isDone: boolean,
  todayTone: string,
  doneTone: string,
  idleTone: string,
) {
  if (isToday) return todayTone;
  if (isDone) return doneTone;
  return idleTone;
}

function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + alpha;
}

function getTodayIndex(date: Date = new Date()): number {
  return (getDay(date) + 6) % 7;
}

function getWeekStart(weekOffset: number, from: Date = new Date()): Date {
  return startOfWeek(addWeeks(from, -weekOffset), WEEK_START_OPTIONS);
}

function weekOffsetFromDate(date: Date, from: Date = new Date()): number {
  return differenceInCalendarWeeks(
    startOfWeek(from, WEEK_START_OPTIONS),
    startOfWeek(date, WEEK_START_OPTIONS),
    WEEK_START_OPTIONS,
  );
}

function monthOffsetFromDate(date: Date, from: Date = new Date()): number {
  return differenceInCalendarMonths(startOfMonth(from), startOfMonth(date));
}

function formatWeekLabel(weekStart: Date): string {
  return t('programme.weekLabel', {
    isoWeek: getISOWeek(weekStart),
    isoYear: getISOWeekYear(weekStart),
  });
}

function formatDateRange(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, WEEK_START_OPTIONS);
  const sameMonth =
    format(weekStart, 'MMM', { locale: dateFnsLocale }) ===
    format(weekEnd, 'MMM', { locale: dateFnsLocale });
  if (sameMonth) {
    return `${format(weekStart, 'dd', { locale: dateFnsLocale })} – ${format(weekEnd, 'dd MMM', { locale: dateFnsLocale })}`;
  }
  return `${format(weekStart, 'dd MMM', { locale: dateFnsLocale })} – ${format(weekEnd, 'dd MMM', { locale: dateFnsLocale })}`;
}

function getWeekDayNumbers(weekStart: Date): string[] {
  return eachDayOfInterval({
    end: endOfWeek(weekStart, WEEK_START_OPTIONS),
    start: weekStart,
  }).map((day) => format(day, 'dd'));
}

function findHistoryWeek(weekStart: Date) {
  const isoWeek = getISOWeek(weekStart);
  const year = getISOWeekYear(weekStart);
  return WEEK_HISTORY.find((week) => week.isoWeek === isoWeek && week.year === year);
}

function getWeekKey(weekStart: Date): string {
  return `${getISOWeekYear(weekStart)}-W${getISOWeek(weekStart)}`;
}

function resolveWeekDays(
  weekStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
): DayProgram[] {
  const key = getWeekKey(weekStart);
  if (Object.hasOwn(weekPrograms, key)) return weekPrograms[key];
  return findHistoryWeek(weekStart)?.days ?? WEEK_HISTORY[0].days;
}

function isPastCalendarDay(dayDate: Date, now: Date = new Date()): boolean {
  return isBefore(startOfDay(dayDate), startOfDay(now));
}

function getMonthStart(monthOffset: number, from: Date = new Date()): Date {
  return startOfMonth(addMonths(from, -monthOffset));
}

function getMonthGridDays(monthStart: Date): Date[] {
  const gridStart = startOfWeek(monthStart, WEEK_START_OPTIONS);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function getDayProgram(date: Date, weekPrograms: Record<string, DayProgram[]>): DayProgram {
  const weekStart = startOfWeek(date, WEEK_START_OPTIONS);
  const days = resolveWeekDays(weekStart, weekPrograms);
  return days[getTodayIndex(date)];
}

function formatMonthLabel(monthStart: Date): string {
  const label = format(monthStart, 'MMMM yyyy', { locale: dateFnsLocale });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function computePeriodStats(
  days: Date[],
  weekPrograms: Record<string, DayProgram[]>,
  circuits: Circuit[],
): { sessions: number; totalMin: number; exercises: number } {
  let sessions = 0;
  let totalMin = 0;
  let exercises = 0;
  for (const date of days) {
    const day = getDayProgram(date, weekPrograms);
    if (!day.isRest && day.activities.length > 0) {
      sessions += day.activities.length;
      exercises += dayExerciseCount(day);
      totalMin += dayDurationMin(day, circuits);
    }
  }
  return { exercises, sessions, totalMin };
}

function computeWeekStats(
  weekStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
  circuits: Circuit[],
): { sessions: number; totalMin: number; exercises: number } {
  return computePeriodStats(
    eachDayOfInterval({
      end: endOfWeek(weekStart, WEEK_START_OPTIONS),
      start: weekStart,
    }),
    weekPrograms,
    circuits,
  );
}

function computeMonthStats(
  monthStart: Date,
  weekPrograms: Record<string, DayProgram[]>,
  circuits: Circuit[],
): { sessions: number; totalMin: number; exercises: number } {
  return computePeriodStats(
    eachDayOfInterval({
      end: endOfMonth(monthStart),
      start: monthStart,
    }),
    weekPrograms,
    circuits,
  );
}

function PeriodStatsRow({
  accent,
  stats,
}: {
  accent: string;
  stats: { sessions: number; totalMin: number; exercises: number };
}) {
  return (
    <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
      {[
        { label: t('programme.periodStats.sessions'), value: `${stats.sessions}` },
        { label: t('programme.periodStats.minutes'), value: `${stats.totalMin}` },
        { label: t('programme.periodStats.exercisesShort'), value: `${stats.exercises}` },
      ].map((s) => (
        <div
          key={s.label}
          className="rounded-xl p-3 text-center"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p className="text-lg font-900" style={{ color: accent }}>
            {s.value}
          </p>
          <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function DayActivitiesSheet({
  accent,
  circuits,
  day,
  dayDate,
  dayIndex,
  onAssign,
  onClose,
  onCreateCircuit,
  requiresConfirmation,
}: {
  dayIndex: number;
  dayDate: Date;
  day: DayProgram;
  circuits: Circuit[];
  onAssign: (d: DayProgram) => void;
  onCreateCircuit: () => void;
  onClose: () => void;
  accent: string;
  requiresConfirmation: boolean;
}) {
  const [draft, setDraft] = useState<DayProgram>(day);
  const [addStep, setAddStep] = useState<AddStep>('idle');
  const [pendingAssign, setPendingAssign] = useState<DayProgram | null>(null);
  const [runningName, setRunningName] = useState(() => t('activity.runningDefaultName'));
  const [runningDistance, setRunningDistance] = useState(5);
  const [runningDuration, setRunningDuration] = useState(30);
  const [runningInterval, setRunningInterval] = useState(false);
  const [flowName, setFlowName] = useState(() => t('activity.flowDefaultName'));
  const [flowDuration, setFlowDuration] = useState(20);
  const [flowKind, setFlowKind] = useState<FlowKind>(FlowKind.YOGA);

  const persist = (next: DayProgram, closeAfter = false) => {
    if (isSameDayProgram(day, next)) {
      setDraft(next);
      if (closeAfter) onClose();
      return;
    }
    if (requiresConfirmation) {
      setPendingAssign(next);
      return;
    }
    setDraft(next);
    onAssign(next);
    if (closeAfter) onClose();
  };

  const setRest = () => {
    persist({ ...draft, activities: [], isRest: true }, true);
  };

  const removeActivity = (activityId: string) => {
    const activities = draft.activities.filter((activity) => activity.id !== activityId);
    persist({ ...draft, activities, isRest: activities.length === 0 });
  };

  const addActivity = (activity: DayActivity) => {
    const activities = [...draft.activities, activity];
    setAddStep('idle');
    persist({ ...draft, activities, isRest: false });
  };

  let pendingLabel = '';
  if (pendingAssign) {
    pendingLabel = pendingAssign.isRest ? t('common.rest') : dayPrimaryLabel(pendingAssign);
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ zIndex: 50 }}>
      <button
        aria-label={t('common.aria.close')}
        className="absolute inset-0"
        style={{ backgroundColor: '#00000085' }}
        type="button"
        onClick={() => {
          if (!pendingAssign) onClose();
        }}
      />
      <div
        className="relative rounded-t-3xl px-5 pt-5 pb-8 overflow-y-auto"
        style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a', maxHeight: '85%' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-900 text-lg">{dayFullLabel(dayIndex)}</p>
            <p className="text-xs font-700 mt-0.5" style={{ color: '#555' }}>
              {format(dayDate, 'dd MMM yyyy', { locale: dateFnsLocale })}
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none font-900"
            style={{ backgroundColor: '#2a2a2a', color: '#888' }}
            onClick={onClose}>
            ×
          </button>
        </div>

        {addStep === 'idle' && (
          <React.Fragment>
            <button
              className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 mb-3 transition-all active:opacity-70"
              style={{
                backgroundColor: draft.isRest ? '#2a2a2a' : '#1a1a1a',
                border: draft.isRest ? `1px solid ${withAlpha(accent, 0.3)}` : '1px solid #2a2a2a',
              }}
              onClick={setRest}>
              <IconCouch />
              <span className="font-800 flex-1 text-left">{t('common.rest')}</span>
              {draft.isRest && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accent }}>
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

            <p
              className="text-xs font-800 tracking-widest uppercase mb-2.5"
              style={{ color: '#555' }}>
              {t('programme.sheet.dailyActivities')}
            </p>

            <div className="space-y-2 overflow-y-auto mb-3" style={{ maxHeight: 240 }}>
              {draft.activities.length === 0 ? (
                <div
                  className="rounded-2xl px-4 py-6 text-center"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <p className="text-sm font-700" style={{ color: '#555' }}>
                    {t('programme.sheet.noActivities')}
                  </p>
                </div>
              ) : (
                draft.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="w-full flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor: withAlpha(activity.color, 0.1),
                      border: `1px solid ${withAlpha(activity.color, 0.35)}`,
                    }}>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: activity.color }}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-800 text-sm truncate">{activity.name}</p>
                      <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                        {activityCategoryLabel(activity.category)} ·{' '}
                        {activityMetaLabel(activity, circuits)}
                      </p>
                    </div>
                    <button
                      aria-label={t('common.aria.removeActivity')}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#2a2a2a', color: '#888' }}
                      onClick={() => {
                        removeActivity(activity.id);
                      }}>
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <Button
              className="w-full rounded-2xl py-3 font-800 text-sm transition-all active:scale-95"
              icon={IconPlus}
              label={t('programme.sheet.addActivity')}
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px dashed ${withAlpha(accent, 0.3)}`,
                color: accent,
              }}
              onClick={() => {
                setAddStep('category');
              }}
            />
          </React.Fragment>
        )}

        {addStep === 'category' && (
          <React.Fragment>
            <p className="font-900 text-base mb-3">{t('programme.sheet.chooseCategory')}</p>
            <div className="space-y-2 mb-3">
              {(
                [
                  ActivityCategory.TRAINING,
                  ActivityCategory.RUNNING,
                  ActivityCategory.FLOW,
                ] as const
              ).map((category) => (
                <button
                  key={category}
                  className="w-full rounded-2xl px-4 py-3.5 font-800 text-left transition-all active:opacity-70"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#f5f5f5',
                  }}
                  onClick={() => {
                    setAddStep(CATEGORY_ADD_STEP[category]);
                  }}>
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mr-3"
                    style={{ backgroundColor: DEFAULT_ACTIVITY_COLORS[category] }}
                  />
                  {activityCategoryLabel(category)}
                </button>
              ))}
            </div>
            <Button
              className="w-full rounded-2xl py-3 font-800 text-sm"
              label={t('common.back')}
              style={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
              onClick={() => {
                setAddStep('idle');
              }}
            />
          </React.Fragment>
        )}

        {addStep === 'training' && (
          <React.Fragment>
            <p className="font-900 text-base mb-3">{t('programme.sheet.trainingCircuitsTitle')}</p>
            <div className="space-y-2 overflow-y-auto mb-3" style={{ maxHeight: 240 }}>
              {circuits.map((c) => (
                <button
                  key={c.id}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all active:opacity-70"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                  onClick={() => {
                    addActivity(createTrainingActivity(c));
                  }}>
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-800 text-sm">{c.name}</p>
                    <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                      {t('programme.sheet.circuitMeta', {
                        cycles: c.cycles,
                        duration: circuitDurationMin(c),
                        exercises: c.exerciseIds.length,
                        rounds: c.rounds,
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              className="w-full mb-2 rounded-2xl py-3 font-800 text-sm transition-all active:scale-95"
              icon={IconPlus}
              label={t('programme.sheet.newCircuit')}
              style={{
                backgroundColor: '#1a1a1a',
                border: `1px dashed ${withAlpha(accent, 0.3)}`,
                color: accent,
              }}
              onClick={onCreateCircuit}
            />
            <Button
              className="w-full rounded-2xl py-3 font-800 text-sm"
              label={t('common.back')}
              style={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
              onClick={() => {
                setAddStep('category');
              }}
            />
          </React.Fragment>
        )}

        {addStep === 'running' && (
          <React.Fragment>
            <p className="font-900 text-base mb-3">{t('programme.sheet.runningTitle')}</p>
            <div className="space-y-3 mb-3">
              <input
                className="w-full rounded-2xl px-4 py-3 font-700 outline-none"
                placeholder={t('common.name')}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  color: '#f5f5f5',
                }}
                type="text"
                value={runningName}
                onChange={(e) => {
                  setRunningName(e.target.value);
                }}
              />
              <div
                className="rounded-2xl px-4 py-3 space-y-3"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-800">{t('programme.sheet.distance')}</span>
                  <Stepper
                    min={0}
                    step={0.5}
                    unit="km"
                    value={runningDistance}
                    onChange={setRunningDistance}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-800">{t('programme.sheet.duration')}</span>
                  <Stepper
                    min={0}
                    step={5}
                    unit="min"
                    value={runningDuration}
                    onChange={setRunningDuration}
                  />
                </div>
              </div>
              <button
                className="w-full rounded-2xl px-4 py-3.5 font-800 flex items-center justify-between transition-all active:scale-95"
                style={{
                  backgroundColor: runningInterval ? withAlpha(accent, 0.15) : '#1a1a1a',
                  border: runningInterval
                    ? `1px solid ${withAlpha(accent, 0.4)}`
                    : '1px solid #2a2a2a',
                  color: runningInterval ? accent : '#ccc',
                }}
                onClick={() => {
                  setRunningInterval((v) => !v);
                }}>
                {t('activity.interval')}
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: runningInterval ? accent : '#2a2a2a',
                    color: runningInterval ? '#0d0d0d' : '#666',
                  }}>
                  {runningInterval ? '✓' : ''}
                </span>
              </button>
            </div>
            <Button
              className="w-full mb-2 rounded-2xl py-3.5 font-800 text-sm transition-all active:scale-95"
              label={t('common.add')}
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={() => {
                addActivity(
                  createRunningActivity({
                    distanceKm: runningDistance > 0 ? runningDistance : undefined,
                    durationMin: runningDuration > 0 ? runningDuration : undefined,
                    isInterval: runningInterval,
                    name: runningName.trim() || t('activity.runningDefaultName'),
                  }),
                );
              }}
            />
            <Button
              className="w-full rounded-2xl py-3 font-800 text-sm"
              label={t('common.back')}
              style={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
              onClick={() => {
                setAddStep('category');
              }}
            />
          </React.Fragment>
        )}

        {addStep === 'flow' && (
          <React.Fragment>
            <p className="font-900 text-base mb-3">{t('programme.sheet.flowTitle')}</p>
            <div className="space-y-3 mb-3">
              <input
                className="w-full rounded-2xl px-4 py-3 font-700 outline-none"
                placeholder={t('common.name')}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  color: '#f5f5f5',
                }}
                type="text"
                value={flowName}
                onChange={(e) => {
                  setFlowName(e.target.value);
                }}
              />
              <div
                className="rounded-2xl px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <span className="text-sm font-800">{t('programme.sheet.duration')}</span>
                <Stepper
                  min={0}
                  step={5}
                  unit="min"
                  value={flowDuration}
                  onChange={setFlowDuration}
                />
              </div>
              <div className="flex gap-2">
                {([FlowKind.YOGA, FlowKind.STRETCHING, FlowKind.STRENGTHENING] as const).map(
                  (kind) => (
                    <Button
                      key={kind}
                      className="flex-1 rounded-xl py-2.5 font-800 text-xs transition-all active:scale-95"
                      label={flowKindLabel(kind)}
                      style={{
                        backgroundColor: flowKind === kind ? accent : '#1a1a1a',
                        border: flowKind === kind ? '1px solid transparent' : '1px solid #2a2a2a',
                        color: flowKind === kind ? '#0d0d0d' : '#888',
                      }}
                      onClick={() => {
                        setFlowKind(kind);
                      }}
                    />
                  ),
                )}
              </div>
            </div>
            <Button
              className="w-full mb-2 rounded-2xl py-3.5 font-800 text-sm transition-all active:scale-95"
              label={t('common.add')}
              style={{ backgroundColor: accent, color: '#0d0d0d' }}
              onClick={() => {
                addActivity(
                  createFlowActivity({
                    durationMin: flowDuration > 0 ? flowDuration : undefined,
                    flowKind,
                    name: flowName.trim() || flowKindLabel(flowKind),
                  }),
                );
              }}
            />
            <Button
              className="w-full rounded-2xl py-3 font-800 text-sm"
              label={t('common.back')}
              style={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
              onClick={() => {
                setAddStep('category');
              }}
            />
          </React.Fragment>
        )}
      </div>

      {pendingAssign && (
        <div
          className="absolute inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 60 }}>
          <button
            aria-label={t('common.aria.cancel')}
            className="absolute inset-0"
            style={{ backgroundColor: '#000000a0' }}
            type="button"
            onClick={() => {
              setPendingAssign(null);
            }}
          />
          <div
            className="relative w-full rounded-2xl p-5"
            style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a' }}>
            <p className="font-900 text-lg mb-2">{t('programme.sheet.confirmPastEditTitle')}</p>
            <p className="text-sm font-600 mb-5" style={{ color: '#888' }}>
              {t('programme.sheet.confirmPastEditBody', {
                date: format(dayDate, 'EEEE dd MMM yyyy', { locale: dateFnsLocale }),
                label: pendingLabel,
              })}
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1 rounded-2xl py-3.5 font-800 text-sm transition-all active:scale-95"
                label={t('common.cancel')}
                style={{ backgroundColor: '#2a2a2a', color: '#ccc' }}
                onClick={() => {
                  setPendingAssign(null);
                }}
              />
              <Button
                className="flex-1 rounded-2xl py-3.5 font-800 text-sm transition-all active:scale-95"
                label={t('common.confirm')}
                style={{ backgroundColor: accent, color: '#0d0d0d' }}
                onClick={() => {
                  onAssign(pendingAssign);
                  setPendingAssign(null);
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProgrammePage({
  accent,
  circuits,
  defaultViewMode = ViewMode.MONTH,
  onCreateCircuit,
  onStartSession,
  onUpdateDay,
  weekPrograms,
}: {
  circuits: Circuit[];
  weekPrograms: Record<string, DayProgram[]>;
  onUpdateDay: (weekStart: Date, dayIndex: number, day: DayProgram) => void;
  onCreateCircuit: () => void;
  onStartSession: (payload: { circuitId: string; tabataMode: TabataMode }) => void;
  accent: string;
  defaultViewMode?: ViewMode;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const isCurrentWeek = weekOffset === 0;
  const isCurrentPeriod = weekOffset === 0 && monthOffset === 0;
  const weekStart = getWeekStart(weekOffset);
  const weekDays = resolveWeekDays(weekStart, weekPrograms);
  const weekStats = computeWeekStats(weekStart, weekPrograms, circuits);
  const weekLabel = formatWeekLabel(weekStart);
  const weekDateRange = formatDateRange(weekStart);
  const dayNumbers = getWeekDayNumbers(weekStart);

  const monthStart = getMonthStart(monthOffset);
  const monthGridDays = getMonthGridDays(monthStart);
  const monthStats = computeMonthStats(monthStart, weekPrograms, circuits);
  const today = new Date();
  const todayInMonth = isSameMonth(today, monthStart);
  const headerDayName = format(today, 'EEEE', { locale: dateFnsLocale });
  const headerDateTitle = format(today, 'd MMMM yyyy', { locale: dateFnsLocale });
  const todayIndex = getTodayIndex(today);
  const todayProgram = resolveWeekDays(getWeekStart(0), weekPrograms)[todayIndex];
  const todayTraining = firstTrainingActivity(todayProgram);
  const todayCircuitId = todayTraining?.meta.circuitId;
  const canStartToday = !todayProgram.isRest && todayCircuitId !== undefined;

  const selectedWeekStart = selectedDate ? startOfWeek(selectedDate, WEEK_START_OPTIONS) : null;
  const selectedDayIndex = selectedDate !== null ? getTodayIndex(selectedDate) : null;
  const selectedDayProgram =
    selectedDate !== null ? getDayProgram(selectedDate, weekPrograms) : null;

  const goToWeekOffset = (nextOffset: number) => {
    setWeekOffset(nextOffset);
    setMonthOffset(monthOffsetFromDate(getWeekStart(nextOffset)));
  };

  const goToMonthOffset = (nextOffset: number) => {
    const nextMonthStart = getMonthStart(nextOffset);
    setMonthOffset(nextOffset);
    if (!isSameMonth(weekStart, nextMonthStart)) {
      const anchor = isSameMonth(today, nextMonthStart) ? today : nextMonthStart;
      setWeekOffset(weekOffsetFromDate(anchor));
    }
  };

  const goToToday = () => {
    setWeekOffset(0);
    setMonthOffset(0);
  };

  const openDay = (date: Date) => {
    setSelectedDate(date);
  };

  const viewToggle = (
    <div
      className="inline-flex rounded-xl p-1 shrink-0"
      style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
      {(
        [
          { icon: <IconWeek />, id: ViewMode.WEEK, label: t('common.view.week') },
          { icon: <IconCalendar />, id: ViewMode.MONTH, label: t('common.view.month') },
        ] as const
      ).map((tab) => {
        const active = viewMode === tab.id;
        return (
          <button
            key={tab.id}
            aria-label={tab.label}
            className="min-w-11 min-h-11 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor: active ? accent : 'transparent',
              color: active ? '#0d0d0d' : '#888',
            }}
            onClick={() => {
              setViewMode(tab.id);
            }}>
            {tab.icon}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-3xl font-900">{t('programme.title')}</h1>
          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="min-w-0">
              <p
                className="text-sm font-800 tracking-wide capitalize leading-tight"
                style={{ color: accent }}>
                {headerDayName}
              </p>
              <p className="text-2xl font-900 capitalize leading-tight mt-0.5">{headerDateTitle}</p>
            </div>
            {viewToggle}
          </div>
        </div>

        {canStartToday && todayTraining && todayCircuitId ? (
          <div
            className="mx-5 mb-4 rounded-2xl overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)` }}>
            <div className="p-5 flex items-center justify-between">
              <div className="text-left flex-1 min-w-0">
                <p
                  className="text-xs font-800 tracking-widest uppercase"
                  style={{ color: '#0d0d0d90' }}>
                  {t('programme.todayCard.heading', { dayName: dayFullLabel(todayIndex) })}
                </p>
                <h2 className="text-2xl font-900 mt-1" style={{ color: '#0d0d0d' }}>
                  {dayPrimaryLabel(todayProgram)}
                </h2>
                <p className="text-sm font-700 mt-1" style={{ color: '#0d0d0d80' }}>
                  {daySummaryLabel(todayProgram)}
                </p>
              </div>
              <button
                aria-label={t('common.aria.startSession')}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                style={{ backgroundColor: '#0d0d0d' }}
                onClick={() => {
                  onStartSession({
                    circuitId: todayCircuitId,
                    tabataMode: todayTraining.meta.tabataMode,
                  });
                }}>
                <span style={{ color: accent, marginLeft: 3 }}>
                  <IconPlay />
                </span>
              </button>
            </div>
          </div>
        ) : null}

        {viewMode === ViewMode.WEEK && (
          <React.Fragment>
            <div
              className="mx-5 mb-4 flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <button
                aria-label={t('common.aria.previousWeek')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToWeekOffset(weekOffset + 1);
                }}>
                <IconChevronLeft />
              </button>
              <div className="text-center flex-1 px-2">
                <p
                  className="font-900 text-sm"
                  style={{ color: isCurrentWeek ? accent : '#f5f5f5' }}>
                  {weekLabel}
                </p>
                <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                  {weekDateRange}
                </p>
                <Button
                  className="mt-1.5 text-xs font-800 px-2.5 py-1 rounded-full transition-all active:scale-95 disabled:opacity-40"
                  disabled={isCurrentPeriod}
                  label={t('common.today')}
                  style={{ backgroundColor: '#2a2a2a', color: accent }}
                  onClick={goToToday}
                />
              </div>
              <button
                aria-label={t('common.aria.nextWeek')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToWeekOffset(weekOffset - 1);
                }}>
                <IconChevronRight />
              </button>
            </div>

            <PeriodStatsRow accent={accent} stats={weekStats} />

            <div className="px-5 space-y-2.5 pb-6">
              {weekDays.map((day, i) => {
                const dayDate = addDays(weekStart, i);
                const isToday = isSameDay(dayDate, new Date());
                const isPastDay = isPastCalendarDay(dayDate);
                const isDone = isPastDay && !day.isRest;
                return (
                  <button
                    key={`${day.day}-${day.short}`}
                    className="w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-left"
                    style={{
                      backgroundColor: isToday ? '#2a2a2a' : '#1a1a1a',
                      border: isToday
                        ? `1px solid ${withAlpha(accent, 0.25)}`
                        : '1px solid #2a2a2a',
                      opacity: isPastDay && day.isRest ? 0.45 : 1,
                    }}
                    type="button"
                    onClick={() => {
                      openDay(dayDate);
                    }}>
                    <div className="w-10 text-center">
                      <p
                        className="text-xs font-800 tracking-wider"
                        style={{
                          color: pickTone(isToday, isDone, accent, withAlpha(accent, 0.4), '#555'),
                        }}>
                        {day.short}
                      </p>
                      <p
                        className="text-lg font-900"
                        style={{ color: pickTone(isToday, isDone, '#fff', '#888', '#333') }}>
                        {dayNumbers[i]}
                      </p>
                    </div>
                    <div className="w-px self-stretch" style={{ backgroundColor: '#2a2a2a' }} />
                    {day.isRest ? (
                      <div className="flex items-center gap-3 flex-1">
                        <IconCouch />
                        <p className="font-700" style={{ color: '#555' }}>
                          {t('common.rest')}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-800 text-sm truncate"
                          style={{ color: pickTone(isToday, isDone, '#fff', '#ccc', '#888') }}>
                          {dayPrimaryLabel(day)}
                        </p>
                        <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                          {daySummaryLabel(day)}
                        </p>
                        {day.activities.length > 1 && (
                          <div className="flex gap-1 mt-1.5">
                            {day.activities.map((activity) => (
                              <span
                                key={activity.id}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: activity.color }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {isToday && (
                      <span
                        className="text-xs font-800 px-2.5 py-1 rounded-full shrink-0"
                        style={{ backgroundColor: withAlpha(accent, 0.12), color: accent }}>
                        {t('common.inProgress')}
                      </span>
                    )}
                    {isDone && (
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: withAlpha(accent, 0.12) }}>
                        <svg
                          fill="none"
                          height="12"
                          stroke={accent}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          width="12">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                    <span style={{ color: '#333', flexShrink: 0 }}>
                      <IconChevronRight />
                    </span>
                  </button>
                );
              })}
            </div>
          </React.Fragment>
        )}

        {viewMode === ViewMode.MONTH && (
          <React.Fragment>
            <div className="mx-5 mb-4 flex items-center justify-between">
              <button
                aria-label={t('common.aria.previousMonth')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToMonthOffset(monthOffset + 1);
                }}>
                <IconChevronLeft />
              </button>
              <div className="text-center flex-1 px-2">
                <p className="font-900 text-sm" style={{ color: '#f5f5f5' }}>
                  {formatMonthLabel(monthStart)}
                </p>
                <Button
                  className="mt-1.5 text-xs font-800 px-2.5 py-1 rounded-full transition-all active:scale-95 disabled:opacity-40"
                  disabled={isCurrentPeriod}
                  label={t('common.today')}
                  style={{ backgroundColor: '#2a2a2a', color: accent }}
                  onClick={goToToday}
                />
              </div>
              <button
                aria-label={t('common.aria.nextMonth')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: '#2a2a2a', color: '#aaa' }}
                onClick={() => {
                  goToMonthOffset(monthOffset - 1);
                }}>
                <IconChevronRight />
              </button>
            </div>

            <PeriodStatsRow accent={accent} stats={monthStats} />

            <div className="px-5 mb-6">
              <div className="grid gap-1" style={{ gridTemplateColumns: '28px repeat(7, 1fr)' }}>
                <div />
                {DAY_INDICES.map((i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-800 py-1"
                    style={{ color: '#555' }}>
                    {dayShortLabel(i)}
                  </div>
                ))}
                {Array.from({ length: 6 }, (_, weekRow) => {
                  const rowStart = monthGridDays[weekRow * 7];
                  const weekNumber = getISOWeek(rowStart);
                  return (
                    <div key={`week-row-${weekRow}`} className="contents">
                      <div className="flex items-center justify-center">
                        <span
                          className="text-[10px] font-800 px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: '#2a2a2a', color: '#555' }}>
                          {weekNumber}
                        </span>
                      </div>
                      {monthGridDays.slice(weekRow * 7, weekRow * 7 + 7).map((date) => {
                        const inMonth = isSameMonth(date, monthStart);
                        const isTodayCell = isSameDay(date, today);
                        const isSelected = isTodayCell && todayInMonth;
                        const program = getDayProgram(date, weekPrograms);
                        const dotColor = program.activities[0]?.color;
                        let dayNumberColor = '#ccc';
                        if (isSelected) dayNumberColor = '#0d0d0d';
                        else if (!inMonth) dayNumberColor = '#333';
                        return (
                          <button
                            key={date.toISOString()}
                            className="flex flex-col items-center justify-center py-1.5 gap-0.5"
                            onClick={() => {
                              openDay(date);
                            }}>
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-800"
                              style={{
                                backgroundColor: isSelected ? accent : 'transparent',
                                color: dayNumberColor,
                              }}>
                              {format(date, 'dd')}
                            </span>
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  !program.isRest && dotColor && inMonth ? dotColor : 'transparent',
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {selectedDate && selectedWeekStart && selectedDayIndex !== null && selectedDayProgram && (
        <DayActivitiesSheet
          key={selectedDate.toISOString()}
          accent={accent}
          circuits={circuits}
          day={selectedDayProgram}
          dayDate={selectedDate}
          dayIndex={selectedDayIndex}
          requiresConfirmation={isPastCalendarDay(selectedDate)}
          onAssign={(d) => {
            onUpdateDay(selectedWeekStart, selectedDayIndex, d);
          }}
          onClose={() => {
            setSelectedDate(null);
          }}
          onCreateCircuit={() => {
            setSelectedDate(null);
            onCreateCircuit();
          }}
        />
      )}
    </div>
  );
}
