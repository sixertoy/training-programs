import { type ComponentType, createElement } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { CircuitsScreenPage } from './components/circuits-screen/circuits-screen.page';
import { CreateCircuitScreenPage } from './components/create-circuit-screen/create-circuit-screen.page';
import { HomeScreenPage } from './components/home-screen/home-screen.page';
import { ProfileScreenPage } from './components/profile-screen/profile-screen.page';
import { TimerScreenPage } from './components/timer-screen/timer-screen.page';
import { WeeklyScreenPage } from './components/weekly-screen/weekly-screen.page';
import { APP_ROUTES, type RouteComponentKey } from './config';
import { ApplicationLayout } from './layouts';

const ROUTE_PAGES: Record<RouteComponentKey, ComponentType> = {
  CircuitsScreen: CircuitsScreenPage,
  CreateCircuitScreen: CreateCircuitScreenPage,
  HomeScreen: HomeScreenPage,
  ProfileScreen: ProfileScreenPage,
  TimerScreen: TimerScreenPage,
  WeeklyScreen: WeeklyScreenPage,
};

const router = createBrowserRouter([
  {
    children: APP_ROUTES.map((route) => ({
      element: createElement(ROUTE_PAGES[route.component]),
      ...(route.index ? { index: true } : { path: route.path }),
    })),
    element: createElement(ApplicationLayout),
    path: '/',
  },
]);

export function ApplicationRouter() {
  return <RouterProvider router={router} />;
}
