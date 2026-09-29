import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { IconCalendar, IconDumbbell, IconFlash, IconHome } from '../../assets/icons';
import { matchAppRoute, NAV_ROUTES, resolveRoutePath, type RouteNavConfig } from '../../config';

interface BottomNavProps {
  accent: string;
}

const NAV_ICONS: Record<RouteNavConfig['icon'], ReactNode> = {
  calendar: <IconCalendar />,
  dumbbell: <IconDumbbell />,
  flash: <IconFlash />,
  home: <IconHome />,
};

export function BottomNav({ accent }: BottomNavProps) {
  const { pathname } = useLocation();
  const activeRouteId = matchAppRoute(pathname)?.id;

  return (
    <div
      className="flex items-center justify-around px-2 py-3 shrink-0"
      style={{ backgroundColor: '#111', borderTop: '1px solid #1f1f1f' }}>
      {NAV_ROUTES.map((route) => {
        const active = activeRouteId === route.id;
        return (
          <Link
            key={route.id}
            className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
            style={{ textDecoration: 'none' }}
            to={resolveRoutePath(route.id)}>
            <span style={{ color: active ? accent : '#444' }}>{NAV_ICONS[route.nav.icon]}</span>
            <span className="text-xs font-800" style={{ color: active ? accent : '#444' }}>
              {route.nav.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
