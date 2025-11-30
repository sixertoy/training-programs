import React from 'react';

import styles from './time-column.module.css';

interface TimeColumnProps {
  hours: number[];
}

export const TimeColumn = React.memo(({ hours }: TimeColumnProps) => {
  return (
    <div className={styles.timeColumn}>
      {hours.map((hour) => (
        <div key={hour} className={styles.timeSlot}>
          <span className={styles.timeLabel}>{hour.toString().padStart(2, '0')}:00</span>
        </div>
      ))}
    </div>
  );
});

TimeColumn.displayName = 'TimeColumn';
