import cn from 'classnames';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { IconCalendar, IconDumbbell, IconFlash, IconHome } from '../../assets/icons';
import { matchAppRoute, NAV_ROUTES, resolveRoutePath, type RouteNavConfig } from '../../config';
import styles from './bottom-nav.module.scss';

const NAV_ICONS: Record<RouteNavConfig['icon'], ReactNode> = {
  calendar: <IconCalendar />,
  dumbbell: <IconDumbbell />,
  flash: <IconFlash />,
  home: <IconHome />,
};

export function BottomNav() {
  const { pathname } = useLocation();
  const activeRouteId = matchAppRoute(pathname)?.id;

  return (
    <div className={`flex items-center justify-around px-2 py-3 shrink-0 ${styles.root}`}>
      {NAV_ROUTES.map((route) => {
        const active = activeRouteId === route.id;
        const tone = active ? styles.labelActive : styles.labelInactive;
        return (
          <Link
            key={route.id}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 py-1 transition-all',
              styles.link,
            )}
            to={resolveRoutePath(route.id)}>
            <span className={tone}>{NAV_ICONS[route.nav.icon]}</span>
            <span className={cn('text-xs font-800', tone)}>{route.nav.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
