
// Tipos de dados para configurações

// Configurações de conta
export interface AccountProfile {
  name: string;
  email: string;
  phone: string;
  position: string;
  avatar: string | null;
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

// Configurações de unidades
export interface OpeningHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklyHours {
  monday: OpeningHours;
  tuesday: OpeningHours;
  wednesday: OpeningHours;
  thursday: OpeningHours;
  friday: OpeningHours;
  saturday: OpeningHours;
  sunday: OpeningHours;
}

export interface Unit {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  openingHours: WeeklyHours;
  isMain: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UnitSettings {
  units: Unit[];
}

// Configurações do aplicativo
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

export interface DisplaySettings {
  itemsPerPage: number;
  dateFormat: string;
  timeFormat: string;
  language: string;
}

export interface SecuritySettings {
  requirePasswordChange: boolean;
  passwordExpirationDays: number;
  sessionTimeout: number;
  useEncryption: boolean;
}

export interface AppSettings {
  theme: ThemeSettings;
  display: DisplaySettings;
  security: SecuritySettings;
}

// Configurações de negócio
export interface ServiceType {
  id: string;
  name: string;
  description: string;
  price?: number;
  estimatedTime?: number;
}

export interface VehicleCategory {
  id: string;
  name: string;
  description: string;
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

// Configurações de usuários
export interface Permission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  active: boolean;
  lastLogin?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSettings {
  roles: Role[];
  users: SystemUser[];
}

// Configurações completas
export interface Settings {
  id?: string;
  account: AccountSettings;
  units: UnitSettings;
  app: AppSettings;
  business: BusinessSettings;
  users: UserSettings;
  created_at?: string;
  updated_at?: string;
}

// Tipo para armazenar as configurações do sistema
export interface BaseSettings extends Record<string, any> {
  id: string;
  created_at: string;
  updated_at?: string;
}
