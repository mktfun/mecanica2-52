
import { eventBus, EVENTS } from '../events/EventBus';

export type ThemeMode = 'light' | 'dark';

/**
 * Service for managing application theme
 */
class ThemeService {
  private storageKey = 'mecanicapro_theme';
  
  /**
   * Get current theme
   * @returns Current theme mode
   */
  getTheme(): ThemeMode {
    try {
      const storedTheme = localStorage.getItem(this.storageKey);
      return (storedTheme as ThemeMode) || this.getSystemPreference();
    } catch (error) {
      console.error('Error getting theme:', error);
      return 'light';
    }
  }
  
  /**
   * Set theme
   * @param theme Theme mode to set
   */
  setTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(this.storageKey, theme);
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      eventBus.publish(EVENTS.THEME_CHANGED, { theme });
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }
  
  /**
   * Toggle between light and dark theme
   * @returns New theme mode
   */
  toggleTheme(): ThemeMode {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }
  
  /**
   * Get system color scheme preference
   * @returns Preferred theme mode
   */
  private getSystemPreference(): ThemeMode {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  /**
   * Initialize theme service
   */
  initialize(): void {
    const theme = this.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add(theme);
    
    // Watch for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(this.storageKey)) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.setTheme(newTheme);
        }
      });
    }
  }
}

// Export singleton instance
export const themeService = new ThemeService();
