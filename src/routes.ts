import { lazy } from 'react';

import { lazyNamed, type RouteConfigObjectInterface } from '@nappr/router';

import { MapPage } from './pages';

const GamesPage = lazyNamed(() => import('./pages/games'), 'GamesPage');
const TaskPage = lazyNamed(() => import('./pages/game/task'), 'TaskPage');
const GameLayout = lazyNamed(() => import('./layouts/game'), 'GameLayout');
const GroupPage = lazyNamed(() => import('./pages/game/group'), 'GroupPage');
const StoryPage = lazyNamed(() => import('./pages/game/story'), 'StoryPage');
const MetasPage = lazyNamed(() => import('./pages/game/metas'), 'MetasPage');
const PointsPage = lazyNamed(() => import('./pages/game/points'), 'PointsPage');

const ApplicationLayout = lazyNamed(
  () => import('./layouts/application'),
  'ApplicationLayout',
);

const CategoriesPage = lazyNamed(
  () => import('./pages/game/categories'),
  'CategoriesPage',
);

const CategoryPage = lazyNamed(
  () => import('./pages/game/category'),
  'CategoryPage',
);

const ErrorCatcherController = lazy(() =>
  import('@nappr/router').then((module) => {
    return { default: module.ErrorCatcherController };
  }),
);

const ErrorCatcherPage = lazy(() =>
  import('@nappr/router').then((module) => {
    return { default: module.ErrorCatcherPage };
  }),
);

export const routesConfigObject: RouteConfigObjectInterface[] = [
  {
    children: [
      {
        children: [
          {
            element: PointsPage,
            id: 'points',
            path: 'points',
          },
          {
            element: MapPage,
            id: 'map',
            path: 'map',
          },
          {
            element: StoryPage,
            id: 'story',
            path: 'story',
          },
          {
            element: CategoriesPage,
            id: 'categories',
            path: 'categories',
          },
          {
            element: CategoryPage,
            id: 'category',
            path: 'categories/:categoryslug',
          },
          {
            element: GroupPage,
            id: 'group',
            path: 'categories/:categoryslug/:groupslug',
          },
          {
            element: TaskPage,
            id: 'task',
            path: 'categories/:categoryslug/:groupslug/:taskuid',
          },
          {
            element: MetasPage,
            id: 'metas',
            path: 'metas',
          },
          {
            index: true,
            redirectTo: 'metas',
          },
        ],
        element: GameLayout,
        id: 'game',
        path: 'games/:gameslug',
      },
      {
        element: GamesPage,
        id: 'games',
        path: 'games',
      },
      {
        element: ErrorCatcherPage,
        path: 'error',
      },
      {
        index: true,
        redirectTo: '/games',
      },
    ],
    element: ApplicationLayout,
    errorElement: ErrorCatcherController,
    path: '/',
  },
];
