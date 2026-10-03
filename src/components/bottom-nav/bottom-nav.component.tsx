import type { ReactNode } from 'react';

import { IconCalendar, IconDumbbell, IconFlash, IconHome } from '../../assets/icons';
import { Screen } from '../../enums';
import { t } from '../../i18n';

type NavTarget = Screen.HOME | Screen.WEEKLY | Screen.CIRCUITS | Screen.TABATA;

interface BottomNavProps {
  accent: string;
  screen: Screen;
  onNavigate: (s: NavTarget) => void;
}

export const BottomNav = ({ accent, onNavigate, screen }: BottomNavProps) => {
  const items: { id: NavTarget; label: string; icon: ReactNode }[] = [
    { icon: <IconHome />, id: Screen.HOME, label: t('nav.home') },
    { icon: <IconCalendar />, id: Screen.WEEKLY, label: t('nav.programme') },
    { icon: <IconDumbbell />, id: Screen.CIRCUITS, label: t('nav.circuits') },
    { icon: <IconFlash />, id: Screen.TABATA, label: t('nav.tabata') },
  ];
  return (
    <div
      className="flex items-center justify-around px-2 py-3 shrink-0"
      style={{ backgroundColor: '#111', borderTop: '1px solid #1f1f1f' }}>
      {items.map((item) => {
        const active = screen === item.id;
        return (
          <button
            key={item.id}
            className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
            onClick={() => {
              onNavigate(item.id);
            }}>
            <span style={{ color: active ? accent : '#444' }}>{item.icon}</span>
            <span className="text-xs font-800" style={{ color: active ? accent : '#444' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

BottomNav.displayName = 'BottomNav';
