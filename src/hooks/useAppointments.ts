
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentStatus, AppointmentFilter } from '@/types/appointment';
import { toast } from 'sonner';
import { isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const useAppointments = (filter?: AppointmentFilter) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOrganizationId, setUserOrganizationId] = useState<string | null>(null);

  // Função para buscar a organização do usuário atual
  const fetchUserOrganization = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        if (membershipError.code !== 'PGRST116') {
          console.error('Erro ao buscar organização do usuário:', membershipError);
        }
        return null;
      }

      return memberships?.organization_id || null;
    } catch (err) {
      console.error('Erro ao buscar usuário ou organização:', err);
      return null;
    }
  }, []);

  // Função para buscar todos os agendamentos
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      setIsLoading(false);
      setError('Usuário não pertence a nenhuma organização');
      return;
    }

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:clients!inner(id, name, email, phone, address, city, state, postal_code),
          vehicle:vehicles!inner(id, make, model, year, plate, color)
        `)
        .eq('organization_id', orgId)
        .order('start_time', { ascending: true });

      // Aplicar filtros se fornecidos
      if (filter?.startDate) {
        query = query.gte('start_time', startOfDay(filter.startDate).toISOString());
      }
      
      if (filter?.endDate) {
        query = query.lte('start_time', endOfDay(filter.endDate).toISOString());
      }
      
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter?.mechanic) {
        query = query.ilike('mechanic_name', `%${filter.mechanic}%`);
      }
      
      if (filter?.searchText) {
        query = query.or(`
          service_type.ilike.%${filter.searchText}%,
          mechanic_name.ilike.%${filter.searchText}%,
          notes.ilike.%${filter.searchText}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Mapear os dados para o formato esperado
      const formattedAppointments: Appointment[] = (data || []).map(appointment => ({
        id: appointment.id,
        client_id: appointment.client_id,
        vehicle_id: appointment.vehicle_id,
        lead_id: appointment.lead_id,
        service_type: appointment.service_type,
        service_description: appointment.service_description,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        mechanic_name: appointment.mechanic_name,
        status: appointment.status as AppointmentStatus,
        notes: appointment.notes,
        estimated_cost: appointment.estimated_cost,
        organization_id: appointment.organization_id,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        client: appointment.client,
        vehicle: appointment.vehicle
      }));

      setAppointments(formattedAppointments);
    } catch (err: any) {
      console.error('Erro ao buscar agendamentos:', err);
      setError(err.message || 'Erro ao carregar agendamentos');
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  }, [userOrganizationId, fetchUserOrganization, filter]);

  // Função para adicionar um agendamento
  const addAppointment = async (newAppointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      toast.error('Usuário não pertence a nenhuma organização');
      throw new Error('Usuário não pertence a nenhuma organização');
    }

    try {
      const appointmentWithOrg = {
        ...newAppointment,
        organization_id: orgId
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentWithOrg])
        .select(`
          *,
          client:clients!inner(id, name, email, phone, address, city, state, postal_code),
          vehicle:vehicles!inner(id, make, model, year, plate, color)
        `);

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const formattedAppointment: Appointment = {
          id: data[0].id,
          client_id: data[0].client_id,
          vehicle_id: data[0].vehicle_id,
          lead_id: data[0].lead_id,
          service_type: data[0].service_type,
          service_description: data[0].service_description,
          start_time: data[0].start_time,
          end_time: data[0].end_time,
          mechanic_name: data[0].mechanic_name,
          status: data[0].status as AppointmentStatus,
          notes: data[0].notes,
          estimated_cost: data[0].estimated_cost,
          organization_id: data[0].organization_id,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          client: data[0].client,
          vehicle: data[0].vehicle
        };
        
        setAppointments(prev => [...prev, formattedAppointment]);
        toast.success('Agendamento criado com sucesso');
        return formattedAppointment;
      }
    } catch (err: any) {
      console.error('Erro ao adicionar agendamento:', err);
      toast.error('Erro ao adicionar agendamento');
      throw err;
    }
  };

  // Função para atualizar um agendamento
  const updateAppointment = (id: string, updatedData: Partial<Appointment>) => {
    try {
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? { ...appointment, ...updatedData } : appointment
        )
      );
      
      toast.success('Agendamento atualizado com sucesso');
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar agendamento:', err);
      toast.error('Erro ao atualizar agendamento');
      return false;
    }
  };

  // Função para atualizar status do agendamento
  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    return updateAppointment(id, { status });
  };

  // Função para remover um agendamento
  const removeAppointment = (id: string) => {
    try {
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      toast.success('Agendamento removido com sucesso');
      return true;
    } catch (err: any) {
      console.error('Erro ao remover agendamento:', err);
      toast.error('Erro ao remover agendamento');
      return false;
    }
  };

  // Função para obter agendamentos para uma data específica
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start_time), date)
    );
  };

  // Função para obter dias que têm agendamentos
  const getDaysWithAppointments = (startDate: Date, endDate: Date) => {
    const daysWithAppointments: Date[] = [];
    
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      if (isWithinInterval(appointmentDate, { start: startDate, end: endDate })) {
        // Verificar se a data já não está na lista
        const dateExists = daysWithAppointments.some(date => 
          isSameDay(date, appointmentDate)
        );
        
        if (!dateExists) {
          daysWithAppointments.push(appointmentDate);
        }
      }
    });
    
    return daysWithAppointments;
  };

  // Função para verificar conflitos de horário
  const checkForTimeConflicts = (startTime: Date, endTime: Date, excludeId?: string) => {
    return appointments.filter(appointment => {
      if (excludeId && appointment.id === excludeId) {
        return false;
      }
      
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      return (
        (startTime >= appointmentStart && startTime < appointmentEnd) ||
        (endTime > appointmentStart && endTime <= appointmentEnd) ||
        (startTime <= appointmentStart && endTime >= appointmentEnd)
      );
    });
  };

  // Inicializar o hook
  useEffect(() => {
    const init = async () => {
      const orgId = await fetchUserOrganization();
      setUserOrganizationId(orgId);
      
      if (orgId) {
        fetchAppointments();
        
        // Configurar escuta em tempo real
        const channel = supabase
          .channel('realtime_appointments')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'appointments',
            filter: `organization_id=eq.${orgId}`
          }, (payload) => {
            console.log('Alteração em tempo real detectada:', payload);
            fetchAppointments();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } else {
        setAppointments([]);
        setIsLoading(false);
        setError('Usuário não pertence a nenhuma organização');
      }
    };

    init();
  }, [fetchUserOrganization, filter]);

  return {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    removeAppointment,
    getAppointmentsForDate,
    getDaysWithAppointments,
    checkForTimeConflicts,
    userOrganizationId
  };
};
