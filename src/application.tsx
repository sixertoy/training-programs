import { ConfigProvider } from '@nappr/nappr-config';

import { ApplicationRouter } from './application.router';
import { AppConfig } from './configs';
import { ExerciseProvider } from './contexts/exercise';
import { ProgramProvider } from './contexts/program';

export function Application() {
  return (
    <ConfigProvider appConfig={AppConfig}>
      <ExerciseProvider>
        <ProgramProvider>
          <ApplicationRouter />
        </ProgramProvider>
      </ExerciseProvider>
    </ConfigProvider>
  );
}
