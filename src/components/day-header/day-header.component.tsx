import React from 'react';

import { DayNavigation } from '../day-navigation';
import styles from './day-header.module.css';

interface DayHeaderProps {
  formattedDate: string;
  formattedDateShort: string;
  isToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const DayHeader = React.memo(
  ({
    formattedDate,
    formattedDateShort,
    isToday,
    onPrevious,
    onNext,
    onToday,
    canGoPrevious,
    canGoNext,
  }: DayHeaderProps) => {
    return (
      <div className={styles.header}>
        <DayNavigation
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          onNext={onNext}
          onPrevious={onPrevious}
        />
        <div className={styles.dateContainer}>
          <h1 className={styles.dateTitle}>{formattedDate}</h1>
          <button
            className={styles.todayButton}
            disabled={isToday}
            type="button"
            onClick={onToday}>
            Aujourd&apos;hui
          </button>
        </div>
        <div className={styles.dateShort}>{formattedDateShort}</div>
      </div>
    );
  },
);

DayHeader.displayName = 'DayHeader';
