import React from 'react';

import styles from './event-slot.module.css';

interface EventSlotProps {
  isCurrentHour: boolean;
  currentHourOffset: number | null;
  children?: React.ReactNode;
}

export const EventSlot = React.memo(
  ({ isCurrentHour, currentHourOffset, children }: EventSlotProps) => {
    return (
      <div className={`${styles.eventSlot} ${isCurrentHour ? styles.currentHour : ''}`}>
        {isCurrentHour && currentHourOffset !== null && (
          <div
            className={styles.currentTimeIndicator}
            style={{ top: `${currentHourOffset}%` }}
          />
        )}
        <div className={styles.eventSlotContent}>{children}</div>
      </div>
    );
  },
);

EventSlot.displayName = 'EventSlot';
