import { Route, Routes } from 'react-router-dom';

import { AppLayout } from './layouts/app';
import { CreateProgramPage } from './pages/create-program';
import { ExercisesPage } from './pages/exercises';
import { Home } from './pages/home';
import { ProgramListPage } from './pages/program-list';
import { ProgramRunPage } from './pages/program-run';
import { ProgramViewPage } from './pages/program-view';

export function ApplicationRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<Home />} path="/" />
        <Route element={<ExercisesPage />} path="/exercises" />
        <Route element={<CreateProgramPage />} path="/programs/create" />
        <Route element={<ProgramListPage />} path="/programs" />
        <Route element={<ProgramViewPage />} path="/programs/:id" />
        <Route element={<ProgramRunPage />} path="/programs/:id/run" />
      </Route>
    </Routes>
  );
}
