import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import styles from './day-navigation.module.css';

interface DayNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const DayNavigation = React.memo(
  ({ canGoNext, canGoPrevious, onNext, onPrevious }: DayNavigationProps) => {
    return (
      <div className={styles.navigation}>
        <button
          aria-label="Jour précédent"
          className={styles.navButton}
          disabled={!canGoPrevious}
          type="button"
          onClick={onPrevious}>
          <FaChevronLeft aria-hidden="true" />
        </button>
        <button
          aria-label="Jour suivant"
          className={styles.navButton}
          disabled={!canGoNext}
          type="button"
          onClick={onNext}>
          <FaChevronRight aria-hidden="true" />
        </button>
      </div>
    );
  },
);

DayNavigation.displayName = 'DayNavigation';
