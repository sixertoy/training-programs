import { ApplicationRouter } from './application.router';
import { AppProvider } from './contexts';

export default function App() {
  return (
    <AppProvider>
      <ApplicationRouter />
    </AppProvider>
  );
}
