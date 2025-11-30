export interface LayoutConfigInterface {
  navigation: {
    icon: React.ElementType;
    label: string;
    to: string;
  }[];
}

export interface CalendarConfigInterface {
  startHour: number;
  endHour: number;
  minDayOffset: number;
  maxDayOffset: number;
}
