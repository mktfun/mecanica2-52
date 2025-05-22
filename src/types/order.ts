
import { BaseEntity } from "@/core/storage/StorageService";
import { Lead } from "./lead";

// Customer type
export interface Customer extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  notes?: string;
  leadSource?: string;
  lead?: Lead;
}

// Vehicle type
export interface Vehicle extends BaseEntity {
  customerId: string;
  make: string;
  model: string;
  year?: string;
  plate: string;
  color?: string;
  vin?: string;
  mileage?: number;
  notes?: string;
}

// Service type
export interface ServiceType extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  estimatedTime?: number;
  category?: string;
}

// OrderService type (service in an order)
export interface OrderService {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  completed: boolean;
}

// Part type
export interface Part extends BaseEntity {
  name: string;
  code?: string;
  description?: string;
  price: number;
  category?: string;
  stock?: number;
  minimumStock?: number;
}

// OrderPart type (part in an order)
export interface OrderPart {
  id: string;
  name: string;
  code?: string;
  price: number;
  quantity: number;
}

// Photo type for order
export interface OrderPhoto {
  id: string;
  url: string;
  description?: string;
  added_at: string;
}

// Status history entry
export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  user?: string;
  notes?: string;
}

// Tax settings
export interface TaxSettings {
  name: string;
  percentage: number;
  applies_to: string[]; // 'services', 'parts', etc.
}

// Vehicle category
export interface VehicleCategory extends BaseEntity {
  name: string;
  description?: string;
}

// Order status type
export type OrderStatus = 'open' | 'in_progress' | 'completed' | 'canceled' | 'waiting_parts' | 'waiting_approval';

// Main Order interface
export interface Order extends BaseEntity {
  number: number;
  customer: Customer;
  vehicle: Vehicle;
  status: OrderStatus;
  description: string;
  services: OrderService[];
  parts: OrderPart[];
  laborCost: number;
  discount: number;
  tax: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  technician?: string;
  photos: OrderPhoto[];
  notes?: string;
  recommendations?: string;
  appointmentId?: string;
  statusHistory?: StatusHistoryEntry[];
  estimatedCompletionDate?: string;
  completedAt?: string;
}
