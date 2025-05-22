// Define types for the settings service
export interface AccountProfile {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  avatar?: string | null;
}

export interface NotificationPreferences {
  email: boolean;
  browser: boolean;
  newLeads: boolean;
  appointments: boolean;
  completedOrders: boolean;
}

export interface AccountSettings {
  profile: AccountProfile;
  notifications: NotificationPreferences;
}

export interface Unit {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  isMain: boolean;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

export interface UnitSettings extends Array<Unit> {}

export interface DisplaySettings {
  itemsPerPage: number;
  dateFormat: string;
  timeFormat: "24h" | "12h";
  language: string;
}

export interface ThemeSettings {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
}

export interface SecuritySettings {
  requirePasswordChange: boolean;
  passwordExpirationDays: number;
  sessionTimeout: number;
  useEncryption: boolean;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  lastBackup?: string;
  keepBackups: number;
}

export interface AppSettings {
  security: SecuritySettings;
  display: DisplaySettings;
  theme: ThemeSettings;
  backup: BackupSettings;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedTime?: number;
}

export interface VehicleCategory {
  id: string;
  name: string;
  description?: string;
}

export interface TaxSettings {
  name: string;
  percentage: number;
  applies_to: string[];
}

export interface BusinessSettings {
  serviceTypes: ServiceType[];
  vehicleCategories: VehicleCategory[];
  taxes: TaxSettings[];
  termsAndConditions: string;
}

// Add Permission interface
export interface Permission {
  module: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin?: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export interface UserSettings {
  users: SystemUser[];
  roles: Role[];
}

export interface Settings {
  account: AccountSettings;
  units: Unit[];
  app: AppSettings;
  business: BusinessSettings;
  users: UserSettings;
}
