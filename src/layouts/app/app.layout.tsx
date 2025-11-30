import React from 'react';
import { Outlet } from 'react-router';

import { AppHeaderComponent } from './header';
import { ApplicationMenu } from './menu';

export const ApplicationLayout = React.memo(() => {
  return (
    <div className="flex-rows is-viewport-height no-overflow no-flex-shrink">
      <AppHeaderComponent />
      <main className="flex-1 scroll-y-auto is-layout-width p-4v">
        <Outlet />
      </main>
      <ApplicationMenu />
    </div>
  );
});

ApplicationLayout.displayName = 'ApplicationLayout';
