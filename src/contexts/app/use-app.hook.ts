import { useContext } from 'react';

import { AppContext, type AppContextValue } from './app.context';

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
