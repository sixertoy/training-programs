import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { resolveRoutePath } from '../../config';
import { BODY_PARTS, CIRCUIT_MUSCLES, TODAY_INDEX } from '../../constants/program.constants';
import { useApp } from '../../contexts';
import { computeGlobalStats, getNextSession } from '../../helpers';
import { WEEK_HISTORY } from '../../mocks';
import type { HomeScreenProps } from './home-screen.component';

export function useHomeScreen(): HomeScreenProps {
  const navigate = useNavigate();
  const { accent, currentWeekDays, profile } = useApp();

  const stats = useMemo(() => computeGlobalStats(WEEK_HISTORY, BODY_PARTS, CIRCUIT_MUSCLES), []);
  const nextSession = useMemo(
    () => getNextSession(currentWeekDays, TODAY_INDEX),
    [currentWeekDays],
  );
  const sparkData = useMemo(
    () =>
      WEEK_HISTORY.slice()
        .reverse()
        .map((week) => week.stats.totalMin),
    [],
  );
  const sparkMax = useMemo(() => Math.max(...sparkData), [sparkData]);
  const sortedParts = useMemo(
    () => [...BODY_PARTS].sort((a, b) => stats.bodyPartCount[b] - stats.bodyPartCount[a]),
    [stats.bodyPartCount],
  );
  const totalHours = Math.floor(stats.totalMin / 60);
  const totalMinsRem = stats.totalMin % 60;

  return {
    accent,
    bodyPartCount: stats.bodyPartCount,
    maxCount: stats.maxCount,
    nextSession,
    onGoToProfile: () => {
      void navigate(resolveRoutePath('profile'));
    },
    onGoToTimer: () => {
      void navigate(resolveRoutePath('timer'));
    },
    onGoToWeekly: () => {
      void navigate(resolveRoutePath('weekly'));
    },
    profile,
    sortedParts,
    sparkData,
    sparkMax,
    totalExerciseReps: stats.totalExerciseReps,
    totalHours,
    totalMinsRem,
    totalSessions: stats.totalSessions,
  };
}
