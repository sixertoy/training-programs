import { matchPath } from 'react-router';

import routesJson from './routes.json';

export interface RouteNavConfig {
  icon: 'calendar' | 'dumbbell' | 'flash' | 'home';
  label: string;
  order: number;
}

export interface AppRouteConfig {
  component: RouteComponentKey;
  id: RouteId;
  index?: boolean;
  nav?: RouteNavConfig;
  path: string;
  showNav: boolean;
}

export type RouteComponentKey =
  | 'CircuitsScreen'
  | 'CreateCircuitScreen'
  | 'HomeScreen'
  | 'ProfileScreen'
  | 'TimerScreen'
  | 'WeeklyScreen';

export type RouteId =
  | 'circuits'
  | 'create-circuit'
  | 'edit-circuit'
  | 'home'
  | 'profile'
  | 'timer'
  | 'weekly';

export const APP_ROUTES: AppRouteConfig[] = routesJson.routes as AppRouteConfig[];

export const NAV_ROUTES = APP_ROUTES.filter(
  (route): route is AppRouteConfig & { nav: RouteNavConfig } =>
    route.showNav && route.nav !== undefined,
).sort((a, b) => a.nav.order - b.nav.order);

export function getRouteById(id: RouteId): AppRouteConfig {
  const route = APP_ROUTES.find((entry) => entry.id === id);
  if (!route) {
    throw new Error(`Unknown route id: ${id}`);
  }
  return route;
}

export function resolveRoutePath(id: RouteId, params?: Record<string, string>): string {
  const route = getRouteById(id);
  let path = route.index ? '/' : `/${route.path}`;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    });
  }
  return path;
}

export function matchAppRoute(pathname: string): AppRouteConfig | undefined {
  return APP_ROUTES.find((route) => {
    const pattern = route.index ? '/' : `/${route.path}`;
    return matchPath({ end: true, path: pattern }, pathname) !== null;
  });
}

export function routeShowsNav(pathname: string): boolean {
  return matchAppRoute(pathname)?.showNav ?? false;
}
