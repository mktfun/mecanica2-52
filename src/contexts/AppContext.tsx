
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEventSubscription } from '../hooks/useEventSubscription';
import { EVENTS } from '../core/events/EventBus';
import { themeService, ThemeMode } from '../core/theme/ThemeService';

// App context state interface
interface AppContextState {
  theme: ThemeMode;
  toggleTheme: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  lastUpdated: {
    entity: string;
    action: string;
    timestamp: string;
  } | null;
}

// Create the context
const AppContext = createContext<AppContextState | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(themeService.getTheme());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<AppContextState['lastUpdated']>(null);

  // Initialize theme
  useEffect(() => {
    themeService.initialize();
  }, []);

  // Subscribe to theme changes
  useEventSubscription(EVENTS.THEME_CHANGED, (data) => {
    setTheme(data.theme);
  });

  // Subscribe to storage changes
  useEventSubscription(EVENTS.STORAGE_UPDATED, (data) => {
    setLastUpdated({
      entity: data.entity,
      action: data.action,
      timestamp: new Date().toISOString()
    });
  });

  const toggleTheme = () => {
    themeService.toggleTheme();
  };

  // Context value
  const value: AppContextState = {
    theme,
    toggleTheme,
    isLoading,
    setIsLoading,
    lastUpdated
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = (): AppContextState => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};
