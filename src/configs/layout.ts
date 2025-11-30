import { FaCalendar, FaDumbbell, FaHome, FaList } from 'react-icons/fa';

import type { LayoutConfigInterface } from '../interfaces';

export const Layout: LayoutConfigInterface = {
  navigation: [
    {
      icon: FaHome,
      label: 'Accueil',
      to: '/',
    },
    {
      icon: FaList,
      label: 'Programmes',
      to: '/programs',
    },
    {
      icon: FaDumbbell,
      label: 'Exercices',
      to: '/exercices',
    },
    {
      icon: FaCalendar,
      label: 'Journée',
      to: '/day',
    },
  ],
};
