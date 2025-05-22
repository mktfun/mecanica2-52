
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  service_interest: string;
  source: string;
  potential_value: number;
  assigned_to: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  status_changed_at: string;
  last_interaction_at: string;
}

export type LeadStatus = string;

export interface LeadHistory {
  id: string;
  lead_id: string;
  action: 'status_change' | 'comment' | 'interaction';
  old_value?: string;
  new_value?: string;
  comment?: string;
  user_id: string;
  created_at: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface LeadColumn {
  id: LeadStatus;
  title: string;
  color: string;
  order: number;
  items: Lead[];
}

export interface LeadColumns {
  [key: string]: LeadColumn;
}
