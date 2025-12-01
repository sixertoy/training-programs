import classnames from 'classnames';
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
  ({ children, currentHour, currentMinute, hours, isToday }: EventsColumnProps) => {
    return (
      <div className={classnames('is-relative pt-0-5v', styles.eventsColumn)}>
        {hours.map((hour) => {
          const isCurrentHour = isToday && currentHour === hour;
          const currentHourOffset =
            isCurrentHour && currentMinute !== null ? (currentMinute / 60) * 100 : null;

          return (
            <EventSlot
              key={hour}
              currentHourOffset={currentHourOffset}
              isCurrentHour={isCurrentHour}>
              {children?.(hour)}
            </EventSlot>
          );
        })}
      </div>
    );
  },
);

EventsColumn.displayName = 'EventsColumn';
