import classnames from 'classnames';
import React from 'react';

import styles from './event-slot.module.css';

interface EventSlotProps {
  isCurrentHour: boolean;
  currentHourOffset: number | null;
  children?: React.ReactNode;
}

export const EventSlot = React.memo(
  ({ children, currentHourOffset, isCurrentHour }: EventSlotProps) => {
    return (
      <div
        className={classnames(styles.eventSlot, {
          [styles.currentHour]: isCurrentHour,
        })}>
        {isCurrentHour && currentHourOffset !== null && (
          <div className={styles.currentTimeIndicator} style={{ top: `${currentHourOffset}%` }} />
        )}
        <div className={styles.eventSlotContent}>{children}</div>
      </div>
    );
  },
);

EventSlot.displayName = 'EventSlot';
