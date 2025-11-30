import { useConfigByName } from '@nappr/nappr-config';
import { useCallback, useMemo, useState } from 'react';

import type { CalendarConfigInterface } from '../../interfaces';

export const useDayPage = () => {
  const [dayOffset, setDayOffset] = useState(0);

  const { endHour, maxDayOffset, minDayOffset, startHour } =
    useConfigByName<CalendarConfigInterface>('Calendar');

  const currentDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date;
  }, [dayOffset]);

  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    });
  }, [currentDate]);

  const formattedDateShort = useMemo(() => {
    return currentDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }, [currentDate]);

  const handlePrevious = useCallback(() => {
    if (dayOffset > minDayOffset) {
      setDayOffset(dayOffset - 1);
    }
  }, [dayOffset, minDayOffset]);

  const handleNext = useCallback(() => {
    if (dayOffset < maxDayOffset) {
      setDayOffset(dayOffset + 1);
    }
  }, [dayOffset, maxDayOffset]);

  const handleToday = useCallback(() => {
    setDayOffset(0);
  }, []);

  const isToday = dayOffset === 0;
  const canGoPrevious = dayOffset > minDayOffset;
  const canGoNext = dayOffset < maxDayOffset;

  const hours = useMemo(() => {
    const length = endHour - startHour;
    return Array.from({ length }, (_, i) => i + startHour);
  }, [endHour, startHour]);

  const currentHour = isToday ? new Date().getHours() : null;
  const currentMinute = isToday ? new Date().getMinutes() : null;

  return {
    canGoNext,
    canGoPrevious,
    currentDate,
    currentHour,
    currentMinute,
    formattedDate,
    formattedDateShort,
    handleNext,
    handlePrevious,
    handleToday,
    hours,
    isToday,
  };
};
