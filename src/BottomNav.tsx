import type { ReactNode } from 'react';

import { IconCalendar, IconDumbbell, IconFlash, IconHome } from './assets/icons';

type NavTarget = 'home' | 'weekly' | 'circuits' | 'tabata';

interface BottomNavProps {
  accent: string;
  screen: string;
  onNavigate: (s: NavTarget) => void;
}

export default function BottomNav({ accent, onNavigate, screen }: BottomNavProps) {
  const items: { id: NavTarget; label: string; icon: ReactNode }[] = [
    { icon: <IconHome />, id: 'home', label: 'Accueil' },
    { icon: <IconCalendar />, id: 'weekly', label: 'Programme' },
    { icon: <IconDumbbell />, id: 'circuits', label: 'Circuits' },
    { icon: <IconFlash />, id: 'tabata', label: 'Tabata' },
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
}
