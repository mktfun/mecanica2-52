
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentStatus } from '@/types/appointment';

export interface AppointmentWithDetails extends Appointment {
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  } | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year?: string;
    plate: string;
    color?: string;
  } | null;
}

class AppointmentService {
  async getAppointments(organizationId: string): Promise<AppointmentWithDetails[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:client_id(*),
        vehicle:vehicle_id(*)
      `)
      .eq('organization_id', organizationId)
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Error fetching appointments: ${error.message}`);
    }

    return (data || []).map(appointment => ({
      ...appointment,
      status: appointment.status as AppointmentStatus,
      client: appointment.client,
      vehicle: appointment.vehicle
    }));
  }

  async getAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:client_id(*),
        vehicle:vehicle_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching appointment: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as AppointmentStatus,
      client: data.client,
      vehicle: data.vehicle
    };
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<AppointmentWithDetails> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select(`
        *,
        client:client_id(*),
        vehicle:vehicle_id(*)
      `)
      .single();

    if (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as AppointmentStatus,
      client: data.client,
      vehicle: data.vehicle
    };
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<AppointmentWithDetails> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        client:client_id(*),
        vehicle:vehicle_id(*)
      `)
      .single();

    if (error) {
      throw new Error(`Error updating appointment: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as AppointmentStatus,
      client: data.client,
      vehicle: data.vehicle
    };
  }

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting appointment: ${error.message}`);
    }
  }

  // Check for appointment conflicts
  async checkConflicts(
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = supabase
      .from('appointments')
      .select('id')
      .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error checking conflicts: ${error.message}`);
    }

    return (data || []).length > 0;
  }

  // Get appointments for a specific date range
  async getAppointmentsByDateRange(
    organizationId: string,
    startDate: string,
    endDate: string
  ): Promise<AppointmentWithDetails[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:client_id(*),
        vehicle:vehicle_id(*)
      `)
      .eq('organization_id', organizationId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Error fetching appointments: ${error.message}`);
    }

    return (data || []).map(appointment => ({
      ...appointment,
      status: appointment.status as AppointmentStatus,
      client: appointment.client,
      vehicle: appointment.vehicle
    }));
  }
}

export const appointmentService = new AppointmentService();
