
import { useState, useEffect } from 'react';
import { themeService, ThemeMode } from '../core/theme/ThemeService';
import { useEventSubscription } from './useEventSubscription';
import { EVENTS } from '../core/events/EventBus';

interface UseThemeReturn {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

/**
 * Hook for using the theme service
 * @returns Theme controls
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeMode>(themeService.getTheme());
  
  // Subscribe to theme changes
  useEventSubscription(EVENTS.THEME_CHANGED, (data) => {
    setThemeState(data.theme);
  });
  
  useEffect(() => {
    // Initialize theme on first mount
    themeService.initialize();
  }, []);
  
  const setTheme = (newTheme: ThemeMode) => {
    themeService.setTheme(newTheme);
  };
  
  const toggleTheme = () => {
    themeService.toggleTheme();
  };
  
  return { theme, setTheme, toggleTheme };
}
