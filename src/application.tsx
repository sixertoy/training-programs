import { ApplicationRouter } from './application.router';
import { ExerciseProvider } from './contexts/exercise';
import { ProgramProvider } from './contexts/program';

export function Application() {
  return (
    <ExerciseProvider>
      <ProgramProvider>
        <ApplicationRouter />
      </ProgramProvider>
    </ExerciseProvider>
  );
}
