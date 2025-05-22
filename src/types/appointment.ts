
export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'confirmed';

export interface Appointment {
  id: string;
  client_name: string;
  client_id?: string;
  phone: string;
  email?: string;
  vehicle_info: string;
  vehicle_id?: string;
  service_type: string;
  service_description?: string;
  start_time: string;
  end_time: string;
  mechanic_name: string;
  mechanic_id?: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  estimated_cost?: number;
  description?: string;
  customer?: any; // Add customer property
  vehicle?: any; // Add vehicle property
}

export interface AppointmentFilter {
  startDate?: Date;
  endDate?: Date;
  client?: string;
  vehicle?: string;
  service?: string;
  mechanic?: string;
  status?: AppointmentStatus;
  searchText?: string;
}
