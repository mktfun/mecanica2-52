
import { StorageService } from "@/core/storage/StorageService";
import { BaseSettings, Settings } from "@/types/settings";
import { eventBus, EVENTS } from "@/core/events/EventBus";

class SettingsService {
  private settingsStore: StorageService<BaseSettings>;
  private defaultSettings: Settings;

  constructor() {
    this.settingsStore = new StorageService<BaseSettings>("mecanicapro_settings");
    
    // Definir configurações padrão
    this.defaultSettings = {
      account: {
        profile: {
          name: '',
          email: '',
          phone: '',
          position: '',
          avatar: null
        },
        notifications: {
          email: true,
          browser: true,
          newLeads: true,
          appointments: true,
          completedOrders: true
        }
      },
      units: {
        units: []
      },
      app: {
        theme: {
          mode: 'light',
          primaryColor: '#0050b3',
          accentColor: '#1890ff'
        },
        display: {
          itemsPerPage: 10,
          dateFormat: 'dd/MM/yyyy',
          timeFormat: '24h',
          language: 'pt-BR'
        },
        security: {
          requirePasswordChange: false,
          passwordExpirationDays: 90,
          sessionTimeout: 30,
          useEncryption: true
        }
      },
      business: {
        serviceTypes: [],
        vehicleCategories: [],
        taxes: [],
        termsAndConditions: ''
      },
      users: {
        roles: [
          {
            id: 'admin',
            name: 'Administrador',
            permissions: [
              {
                module: 'all',
                create: true,
                read: true,
                update: true,
                delete: true
              }
            ]
          },
          {
            id: 'manager',
            name: 'Gerente',
            permissions: [
              {
                module: 'leads',
                create: true,
                read: true,
                update: true,
                delete: false
              },
              {
                module: 'appointments',
                create: true,
                read: true,
                update: true,
                delete: false
              },
              {
                module: 'orders',
                create: true,
                read: true,
                update: true,
                delete: false
              },
              {
                module: 'reports',
                create: false,
                read: true,
                update: false,
                delete: false
              }
            ]
          }
        ],
        users: []
      }
    };
  }

  // Inicializar configurações se não existirem
  public initialize(): void {
    const settings = this.settingsStore.getAll();
    
    if (settings.length === 0) {
      const now = new Date().toISOString();
      const settingsToStore: BaseSettings = {
        id: 'default',
        created_at: now,
        updated_at: now,
        ...this.defaultSettings
      };
      this.settingsStore.add(settingsToStore);
    }
  }

  // Obter todas as configurações
  public getSettings(): Settings {
    try {
      this.initialize();
      const settings = this.settingsStore.getAll();
      if (settings.length === 0) {
        return this.defaultSettings;
      }
      
      // Extract the settings data from the BaseSettings object
      const { id, created_at, updated_at, ...actualSettings } = settings[0];
      
      // Merge with default settings to ensure all properties exist
      return {
        ...this.defaultSettings,
        ...actualSettings
      };
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return this.defaultSettings;
    }
  }

  // Salvar seção específica das configurações
  public saveSection<K extends keyof Settings>(section: K, data: Partial<Settings[K]>): boolean {
    try {
      const settings = this.getSettings();
      const storageSettings = this.settingsStore.getAll();
      
      // Create the updated settings object
      const updatedSettings = {
        ...settings,
        [section]: {
          ...settings[section],
          ...data
        }
      };
      
      // Prepare the data for storage
      const now = new Date().toISOString();
      const baseSettings: BaseSettings = {
        id: storageSettings.length > 0 ? storageSettings[0].id : 'default',
        created_at: storageSettings.length > 0 ? storageSettings[0].created_at : now,
        updated_at: now,
        ...updatedSettings
      };

      if (storageSettings.length > 0) {
        this.settingsStore.update(baseSettings.id, baseSettings);
      } else {
        this.settingsStore.add(baseSettings);
      }

      eventBus.publish(EVENTS.STORAGE_UPDATED, {
        entity: this.settingsStore.getStorageKey(),
        action: 'updated',
        section
      });

      return true;
    } catch (error) {
      console.error(`Erro ao salvar configurações de ${String(section)}:`, error);
      return false;
    }
  }

  // Exportar todas as configurações
  public exportSettings(): string {
    try {
      return this.settingsStore.exportData();
    } catch (error) {
      console.error('Erro ao exportar configurações:', error);
      return '';
    }
  }

  // Importar configurações
  public importSettings(jsonData: string): boolean {
    try {
      return this.settingsStore.importData(jsonData);
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      return false;
    }
  }

  // Backup das configurações
  public backupSettings(): string {
    try {
      const settings = this.getSettings();
      const backup = {
        timestamp: new Date().toISOString(),
        settings: settings
      };
      return JSON.stringify(backup);
    } catch (error) {
      console.error('Erro ao fazer backup das configurações:', error);
      return '';
    }
  }

  // Restaurar configurações de backup
  public restoreFromBackup(backupData: string): boolean {
    try {
      const data = JSON.parse(backupData);
      
      if (!data.settings) {
        throw new Error('Dados de backup inválidos');
      }
      
      const settings = this.getSettings();
      const baseSettings = settings as unknown as BaseSettings;
      
      if (baseSettings.id) {
        this.settingsStore.update(baseSettings.id, {
          ...data.settings,
          id: baseSettings.id,
          updated_at: new Date().toISOString()
        } as unknown as BaseSettings);
        
        eventBus.publish(EVENTS.STORAGE_UPDATED, {
          entity: this.settingsStore.getStorageKey(),
          action: 'restored'
        });
        
        return true;
      }
      
      // Se não existir ID, criar novo
      const now = new Date().toISOString();
      this.settingsStore.add({
        ...data.settings,
        id: 'default',
        created_at: now,
        updated_at: now
      } as unknown as BaseSettings);
      
      eventBus.publish(EVENTS.STORAGE_UPDATED, {
        entity: this.settingsStore.getStorageKey(),
        action: 'restored'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error);
      return false;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
