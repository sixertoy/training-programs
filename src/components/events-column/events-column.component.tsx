import React from 'react';

import { EventSlot } from '../event-slot';
import styles from './events-column.module.css';

interface EventsColumnProps {
  hours: number[];
  isToday: boolean;
  currentHour: number | null;
  currentMinute: number | null;
  children?: (hour: number) => React.ReactNode;
}

export const EventsColumn = React.memo(
  ({ hours, isToday, currentHour, currentMinute, children }: EventsColumnProps) => {
    return (
      <div className={styles.eventsColumn}>
        {hours.map((hour) => {
          const isCurrentHour = isToday && currentHour === hour;
          const currentHourOffset =
            isCurrentHour && currentMinute !== null ? (currentMinute / 60) * 100 : null;

          return (
            <EventSlot
              currentHourOffset={currentHourOffset}
              isCurrentHour={isCurrentHour}
              key={hour}>
              {children?.(hour)}
            </EventSlot>
          );
        })}
      </div>
    );
  },
);

EventsColumn.displayName = 'EventsColumn';
