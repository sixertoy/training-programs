import { Route, Routes } from 'react-router-dom';

import { AppLayout } from './layouts/app';
import { CreateProgram } from './pages/create-program';
import { Exercises } from './pages/exercises';
import { Home } from './pages/home';
import { ProgramList } from './pages/program-list';
import { ProgramRun } from './pages/program-run';
import { ProgramView } from './pages/program-view';

export function ApplicationRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<Home />} path="/" />
        <Route element={<Exercises />} path="/exercises" />
        <Route element={<CreateProgram />} path="/programs/create" />
        <Route element={<ProgramList />} path="/programs" />
        <Route element={<ProgramView />} path="/programs/:id" />
        <Route element={<ProgramRun />} path="/programs/:id/run" />
      </Route>
    </Routes>
  );
}
