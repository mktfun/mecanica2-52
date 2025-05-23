
import { BaseEntity } from "@/core/storage/StorageService";
import { Lead } from "./lead";

// Customer type
export interface Customer extends BaseEntity {
  id: string;
  organization_id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Vehicle type
export interface Vehicle extends BaseEntity {
  id: string;
  organization_id?: string;
  client_id: string;
  make: string;
  model: string;
  year?: string;
  plate: string;
  color?: string;
  vin?: string;
  mileage?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ServiceType type
export interface ServiceType extends BaseEntity {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  price: number;
  estimated_time?: number;
  category?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// OrderService type (service in an order)
export interface OrderService {
  id: string;
  service_order_id: string;
  service_id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  completed: boolean;
  created_at: string;
}

// Part type
export interface Part extends BaseEntity {
  id: string;
  organization_id?: string;
  name: string;
  code?: string;
  description?: string;
  price: number;
  category?: string;
  stock?: number;
  minimum_stock?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// OrderPart type (part in an order)
export interface OrderPart {
  id: string;
  service_order_id: string;
  part_id?: string;
  name: string;
  code?: string;
  price: number;
  quantity: number;
  created_at: string;
}

// Photo type for order
export interface OrderPhoto {
  id: string;
  service_order_id: string;
  url: string;
  description?: string;
  created_at: string;
}

// Order status type
export type OrderStatus = 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled';

// Main Order interface
export interface Order extends BaseEntity {
  id: string;
  number: number;
  organization_id: string;
  client_id: string;
  vehicle_id: string;
  appointment_id?: string;
  lead_id?: string;
  status: OrderStatus;
  description?: string;
  technician?: string;
  labor_cost: number;
  discount_percent: number;
  tax_percent: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  notes?: string;
  recommendations?: string;
  estimated_completion_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos expandidos
  client?: Customer;
  vehicle?: Vehicle;
  appointment?: any;
  lead?: Lead;
  
  // Arrays de serviços, peças e fotos
  services: OrderService[];
  parts: OrderPart[];
  photos: OrderPhoto[];
}
