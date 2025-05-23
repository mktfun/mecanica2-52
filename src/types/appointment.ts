
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  client_id: string;
  vehicle_id: string;
  lead_id?: string;
  service_type: string;
  service_description?: string;
  start_time: string;
  end_time: string;
  mechanic_name: string;
  status: AppointmentStatus;
  notes?: string;
  estimated_cost?: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Propriedades expandidas para relacionamentos
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
