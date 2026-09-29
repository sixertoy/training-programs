import { Outlet, useLocation } from 'react-router';

import { BottomNav } from '../../components/bottom-nav';
import { routeShowsNav } from '../../config';
import styles from './application.layout.module.scss';

export function ApplicationLayout() {
  const { pathname } = useLocation();
  const showNav = routeShowsNav(pathname);

  return (
    <div className={`flex justify-center items-center min-h-screen ${styles.root}`}>
      <div className={`flex flex-col overflow-hidden relative ${styles.shell}`}>
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
