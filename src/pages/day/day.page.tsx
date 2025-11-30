import { useConfigByName } from '@nappr/nappr-config';
import React, { useMemo } from 'react';

import { DayHeader, EventsColumn, TimeColumn } from '../../components';
import type { CalendarConfigInterface } from '../../interfaces';
import styles from './day.module.css';

const MIN_DAY_OFFSET = -5;
const MAX_DAY_OFFSET = 5;

export const DayPage = React.memo(() => {
  const [dayOffset, setDayOffset] = React.useState(0);

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

  const handlePrevious = () => {
    if (dayOffset > MIN_DAY_OFFSET) {
      setDayOffset(dayOffset - 1);
    }
  };

  const handleNext = () => {
    if (dayOffset < MAX_DAY_OFFSET) {
      setDayOffset(dayOffset + 1);
    }
  };

  const handleToday = () => {
    setDayOffset(0);
  };

  const isToday = dayOffset === 0;
  const canGoPrevious = dayOffset > MIN_DAY_OFFSET;
  const canGoNext = dayOffset < MAX_DAY_OFFSET;

  // Générer les heures de la journée (8h à 22h)
  const { endHour, startHour } = useConfigByName<CalendarConfigInterface>('Calendar');

  const length = endHour - startHour;
  const hours = Array.from({ length }, (_, i) => i + startHour);

  // Obtenir l'heure actuelle si on est sur aujourd'hui
  const currentHour = isToday ? new Date().getHours() : null;
  const currentMinute = isToday ? new Date().getMinutes() : null;

  return (
    <div className={styles.container}>
      <DayHeader
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        formattedDate={formattedDate}
        formattedDateShort={formattedDateShort}
        isToday={isToday}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onToday={handleToday}
      />

      <div className={styles.calendar}>
        <TimeColumn hours={hours} />
        <EventsColumn
          currentHour={currentHour}
          currentMinute={currentMinute}
          hours={hours}
          isToday={isToday}
        />
      </div>
    </div>
  );
});

DayPage.displayName = 'DayPage';
