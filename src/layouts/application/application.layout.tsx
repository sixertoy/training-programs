import { Outlet, useLocation } from 'react-router';

import { BottomNav } from '../../components/bottom-nav';
import { routeShowsNav } from '../../config';
import { useApp } from '../../contexts';

export function ApplicationLayout() {
  const { accent } = useApp();
  const { pathname } = useLocation();
  const showNav = routeShowsNav(pathname);

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ backgroundColor: '#050505' }}>
      <div
        className="flex flex-col overflow-hidden relative"
        style={{
          backgroundColor: '#0d0d0d',
          boxShadow: '0 0 80px #00000080',
          height: 'min(100vh, 844px)',
          width: 'min(100vw, 390px)',
        }}>
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
        {showNav && <BottomNav accent={accent} />}
      </div>
    </div>
  );
}
