import { toast } from '@/components/ui/sonner';
import { eventBus, EVENTS } from '@/core/events/EventBus';
import { Settings } from '@/types/settings';

class SettingsService {
  private storage: Storage;
  private storageKey: string;
  private settings: Settings;
  private defaultSettings: Settings;

  constructor() {
    this.storage = localStorage;
    this.storageKey = 'mecanicapro_settings';
    
    // Define default settings
    this.defaultSettings = {
      account: {
        profile: {
          name: '',
          email: '',
          phone: '',
          position: '',
          avatar: null,
        },
        notifications: {
          email: true,
          browser: true,
          newLeads: true,
          appointments: true,
          completedOrders: true,
        },
      },
      units: [],
      app: {
        security: {
          requirePasswordChange: false,
          passwordExpirationDays: 90,
          sessionTimeout: 30,
          useEncryption: false,
        },
        display: {
          itemsPerPage: 10,
          dateFormat: 'dd/MM/yyyy',
          timeFormat: '24h',
          language: 'pt-BR',
        },
        theme: {
          mode: 'light',
          primaryColor: '#1890ff',
          accentColor: '#722ed1',
        },
        backup: {
          autoBackup: false,
          backupFrequency: 'weekly',
          keepBackups: 5,
        },
      },
      business: {
        serviceTypes: [],
        vehicleCategories: [],
        taxes: [],
        termsAndConditions: '',
      },
      users: {
        users: [],
        roles: [],
      },
    };
    
    // Load settings from storage or use defaults
    this.settings = this.loadSettings();
  }

  private loadSettings(): Settings {
    try {
      const storedSettings = this.storage.getItem(this.storageKey);
      
      if (storedSettings) {
        return {
          ...this.defaultSettings,
          ...JSON.parse(storedSettings)
        };
      }
      
      return { ...this.defaultSettings };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { ...this.defaultSettings };
    }
  }

  private saveToStorage(): boolean {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.settings));
      
      // Publish event for other components to listen to
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: 'mecanicapro_settings',
        action: 'updated'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  public getSettings(): Settings {
    // Return a deep copy to prevent accidental mutations
    return JSON.parse(JSON.stringify(this.settings));
  }

  public saveSection<T extends keyof Settings>(
    sectionName: T,
    data: Partial<Settings[T]>
  ): boolean {
    try {
      if (sectionName === 'units' || sectionName === 'users') {
        // For array sections, simply replace the array
        this.settings[sectionName] = data as Settings[T];
      } else {
        // For object sections, merge with existing data
        this.settings[sectionName] = {
          ...this.settings[sectionName],
          ...data
        };
      }
      
      return this.saveToStorage();
    } catch (error) {
      console.error(`Error saving settings section ${String(sectionName)}:`, error);
      return false;
    }
  }

  public exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  public importSettings(jsonData: string): boolean {
    try {
      const parsedSettings = JSON.parse(jsonData);
      
      // Validate structure
      if (
        typeof parsedSettings !== 'object' ||
        parsedSettings === null ||
        Array.isArray(parsedSettings)
      ) {
        throw new Error('Invalid settings format');
      }
      
      // Merge with default settings to ensure all required fields
      this.settings = {
        ...this.defaultSettings,
        ...parsedSettings
      };
      
      const success = this.saveToStorage();
      
      if (success) {
        eventBus.publish(EVENTS.STORAGE_UPDATED, { 
          entity: 'mecanicapro_settings', 
          action: 'imported' 
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  public backupSettings(): string {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: 1,
        data: this.settings
      };
      
      const backupStr = JSON.stringify(backup);
      
      // Store in a dedicated backup storage
      const backups = this.getBackups();
      backups.unshift(backup);
      
      // Keep only the latest N backups
      const maxBackups = this.settings.app.backup.keepBackups || 5;
      const trimmedBackups = backups.slice(0, maxBackups);
      
      this.storage.setItem('mecanicapro_settings_backups', JSON.stringify(trimmedBackups));
      
      // Update last backup date
      this.settings.app.backup.lastBackup = backup.timestamp;
      this.saveToStorage();
      
      return backupStr;
    } catch (error) {
      console.error('Error creating backup:', error);
      return '';
    }
  }

  public restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      
      if (
        !backup ||
        !backup.timestamp ||
        !backup.data ||
        typeof backup.data !== 'object'
      ) {
        throw new Error('Invalid backup format');
      }
      
      // Merge with default settings to ensure all required fields
      this.settings = {
        ...this.defaultSettings,
        ...backup.data
      };
      
      const success = this.saveToStorage();
      
      if (success) {
        eventBus.publish(EVENTS.STORAGE_UPDATED, { 
          entity: 'mecanicapro_settings', 
          action: 'restored' 
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  private getBackups(): any[] {
    try {
      const backupsStr = this.storage.getItem('mecanicapro_settings_backups');
      return backupsStr ? JSON.parse(backupsStr) : [];
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }
}

export const settingsService = new SettingsService();
