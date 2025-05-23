
export type OrderStatus = 'open' | 'in_progress' | 'awaiting_parts' | 'completed' | 'cancelled' | 'delivered';

interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

interface Customer extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Vehicle extends BaseEntity {
  make: string;
  model: string;
  year?: string;
  plate: string;
  color?: string;
  vin?: string;
  mileage?: number;
}

interface ServiceType extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  estimated_time?: number;
}

interface OrderService {
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

interface Part extends BaseEntity {
  name: string;
  code?: string;
  price: number;
  stock: number;
  minimum_stock?: number;
  category?: string;
  description?: string;
}

interface OrderPart {
  id: string;
  service_order_id: string;
  part_id?: string;
  name: string;
  code?: string;
  price: number;
  quantity: number;
  created_at: string;
}

interface OrderPhoto {
  id: string;
  service_order_id: string;
  url: string;
  description?: string;
  created_at: string;
}

export interface Order {
  id: string;
  number: number;
  client_id: string;
  vehicle_id: string;
  organization_id: string;
  status: OrderStatus;
  description?: string;
  notes?: string;
  technician?: string;
  recommendations?: string;
  labor_cost?: number;
  subtotal?: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_percent?: number;
  tax_amount?: number;
  total?: number;
  estimated_completion_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  appointment_id?: string;
  lead_id?: string;
  
  // Expanded relationships
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: string;
    plate: string;
    color?: string;
  };
  appointment?: any;
  lead?: any;
}

export type { Customer, Vehicle, ServiceType, OrderService, Part, OrderPart, OrderPhoto };
