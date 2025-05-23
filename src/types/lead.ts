
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
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
  organization_id?: string;
  client_id?: string;
  vehicle_id?: string;
  
  // Propriedades mantidas para compatibilidade, mas que não são mais usadas diretamente
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  
  // Dados expandidos de relacionamentos
  client?: any;
  vehicle?: any;
}

export type LeadStatus = 'new' | 'contacted' | 'negotiation' | 'scheduled' | 'converted' | 'lost';

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

export interface LeadColumn {
  id: LeadStatus;
  title: string;
  items: Lead[];
}

export interface LeadColumns {
  [key: string]: LeadColumn;
}
