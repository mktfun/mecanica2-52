
import { StorageService } from "@/core/storage/StorageService";
import { BaseSettings, Settings } from "@/types/settings";
import { eventBus, EVENTS } from "@/core/events/EventBus";

class SettingsService {
  private settingsStore: StorageService<BaseSettings>;
  private defaultSettings: Settings;

  constructor() {
    this.settingsStore = new StorageService<BaseSettings>("settings");
    
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
      this.settingsStore.add({
        id: 'default',
        ...this.defaultSettings,
        created_at: now,
        updated_at: now
      });
    }
  }

  // Obter todas as configurações
  public getSettings(): Settings {
    try {
      this.initialize();
      const settings = this.settingsStore.getAll();
      return settings[0] as unknown as Settings;
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return this.defaultSettings;
    }
  }

  // Salvar seção específica das configurações
  public saveSection<K extends keyof Settings>(section: K, data: Partial<Settings[K]>): boolean {
    try {
      const settings = this.getSettings();
      const updated = {
        ...settings,
        [section]: {
          ...settings[section],
          ...data
        },
        updated_at: new Date().toISOString()
      };

      if (settings.id) {
        this.settingsStore.update(settings.id, updated);
      }

      eventBus.publish(EVENTS.STORAGE_UPDATED, {
        entity: this.settingsStore.getStorageKey(),
        action: 'updated',
        section
      });

      return true;
    } catch (error) {
      console.error(`Erro ao salvar configurações de ${section}:`, error);
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
      
      if (settings.id) {
        this.settingsStore.update(settings.id, {
          ...data.settings,
          id: settings.id,
          updated_at: new Date().toISOString()
        });
        
        eventBus.publish(EVENTS.STORAGE_UPDATED, {
          entity: this.settingsStore.getStorageKey(),
          action: 'restored'
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error);
      return false;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
