import { Route, Routes } from 'react-router';

import { ApplicationLayout } from './layouts';
import { CreateProgramPage } from './pages/create-program';
import { DayPage } from './pages/day';
import { ExercicesPage } from './pages/exercises';
import { Home } from './pages/home';
import { ProgramListPage } from './pages/program-list';
import { ProgramRunPage } from './pages/program-run';
import { ProgramViewPage } from './pages/program-view';

export function ApplicationRouter() {
  return (
    <Routes>
      <Route element={<ApplicationLayout />}>
        <Route element={<Home />} path="/" />
        <Route element={<DayPage />} path="/day" />
        <Route element={<ExercicesPage />} path="/exercices" />
        <Route path="/programs">
          <Route element={<CreateProgramPage />} path="create" />
          <Route element={<ProgramViewPage />} path=":id" />
          <Route element={<ProgramRunPage />} path=":id/run" />
          <Route index element={<ProgramListPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
