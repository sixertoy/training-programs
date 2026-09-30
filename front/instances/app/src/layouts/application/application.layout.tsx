import { Outlet, useLocation } from 'react-router';

import { BottomNav } from '../../components/bottom-nav';
import { routeShowsNav } from '../../config';
import styles from './application.layout.module.scss';

export function ApplicationLayout() {
  const { pathname } = useLocation();
  const showNav = routeShowsNav(pathname);

  return (
    <div className={`flex justify-center items-center min-h-screen ${styles.root}`}>
      <div className={styles.device} data-testid="device-frame">
        <div className={styles.shell} data-testid="app-shell">
          <div className={styles.content}>
            <Outlet />
          </div>
          {showNav && <BottomNav />}
        </div>
        <img alt="" aria-hidden="true" className={styles.frame} src="/frame_iphone-17.png" />
      </div>
    </div>
  );
}
