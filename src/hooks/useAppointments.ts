import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Appointment, AppointmentStatus, AppointmentFilter } from '@/types/appointment';

export function useAppointments(filter?: AppointmentFilter) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
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

  // Buscar todos os agendamentos
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
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*)
        `)
        .eq('organization_id', orgId)
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

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
  }, [userOrganizationId, fetchUserOrganization]);

  // Aplicar filtros aos agendamentos
  const applyFilters = useCallback(() => {
    if (!filter) {
      setFilteredAppointments(appointments);
      return;
    }

    let filtered = [...appointments];

    // Filtro por intervalo de datas
    if (filter.startDate) {
      filtered = filtered.filter(appointment => 
        new Date(appointment.start_time) >= filter.startDate!
      );
    }
    
    if (filter.endDate) {
      filtered = filtered.filter(appointment => 
        new Date(appointment.start_time) <= filter.endDate!
      );
    }

    // Filtro por cliente
    if (filter.client) {
      filtered = filtered.filter(appointment => 
        appointment.client?.name.toLowerCase().includes(filter.client!.toLowerCase())
      );
    }

    // Filtro por veículo
    if (filter.vehicle) {
      filtered = filtered.filter(appointment => {
        const vehicleInfo = appointment.vehicle?.make + ' ' + appointment.vehicle?.model + ' ' + (appointment.vehicle?.plate || '');
        return vehicleInfo.toLowerCase().includes(filter.vehicle!.toLowerCase());
      });
    }

    // Filtro por tipo de serviço
    if (filter.service) {
      filtered = filtered.filter(appointment => 
        appointment.service_type.toLowerCase().includes(filter.service!.toLowerCase()) ||
        (appointment.service_description && appointment.service_description.toLowerCase().includes(filter.service!.toLowerCase()))
      );
    }

    // Filtro por mecânico
    if (filter.mechanic) {
      filtered = filtered.filter(appointment => 
        appointment.mechanic_name.toLowerCase().includes(filter.mechanic!.toLowerCase())
      );
    }

    // Filtro por status
    if (filter.status) {
      filtered = filtered.filter(appointment => 
        appointment.status === filter.status
      );
    }

    // Filtro por texto de busca
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.client?.name.toLowerCase().includes(searchLower) ||
        (appointment.client?.phone && appointment.client.phone.toLowerCase().includes(searchLower)) ||
        (appointment.vehicle?.make + ' ' + appointment.vehicle?.model).toLowerCase().includes(searchLower) ||
        (appointment.vehicle?.plate && appointment.vehicle.plate.toLowerCase().includes(searchLower)) ||
        appointment.service_type.toLowerCase().includes(searchLower) ||
        (appointment.service_description && appointment.service_description.toLowerCase().includes(searchLower)) ||
        appointment.mechanic_name.toLowerCase().includes(searchLower) ||
        (appointment.notes && appointment.notes.toLowerCase().includes(searchLower))
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, filter]);

  // Adicionar um novo agendamento
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      toast.error('Usuário não pertence a nenhuma organização');
      throw new Error('Usuário não pertence a nenhuma organização');
    }
    
    try {
      if (checkForTimeConflicts(appointment)) {
        toast.error("Conflito de horário", {
          description: "Já existe um agendamento para este mecânico neste horário"
        });
        return null;
      }
      
      const appointmentData = {
        ...appointment,
        organization_id: orgId
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*)
        `)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (appointment.lead_id) {
        await supabase
          .from('leads')
          .update({ 
            status: 'scheduled', 
            status_changed_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString()
          })
          .eq('id', appointment.lead_id);
      }
      
      const formattedAppointment: Appointment = {
        id: data.id,
        client_id: data.client_id,
        vehicle_id: data.vehicle_id,
        lead_id: data.lead_id,
        service_type: data.service_type,
        service_description: data.service_description,
        start_time: data.start_time,
        end_time: data.end_time,
        mechanic_name: data.mechanic_name,
        status: data.status as AppointmentStatus,
        notes: data.notes,
        estimated_cost: data.estimated_cost,
        organization_id: data.organization_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        client: data.client,
        vehicle: data.vehicle
      };
      
      setAppointments(prev => [...prev, formattedAppointment]);
      
      toast.success("Agendamento criado", {
        description: "O agendamento foi criado com sucesso"
      });
      
      return formattedAppointment;
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast.error("Erro", {
        description: "Não foi possível criar o agendamento"
      });
      throw error;
    }
  };

  // Atualizar um agendamento existente
  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      if ((updates.start_time || updates.end_time || updates.mechanic_name) && 
          checkForTimeConflicts(updates, id)) {
        toast.error("Conflito de horário", {
          description: "Já existe um agendamento para este mecânico neste horário"
        });
        return null;
      }

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
        throw error;
      }

      setAppointments(prev => 
        prev.map(appointment => appointment.id === id ? data : appointment)
      );

      toast.success("Agendamento atualizado", {
        description: "As alterações foram salvas com sucesso"
      });

      return data;
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro", {
        description: "Não foi possível atualizar o agendamento"
      });
      throw error;
    }
  };

  // Atualizar o status de um agendamento
  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      setAppointments(prev => 
        prev.map(appointment => appointment.id === id ? data : appointment)
      );
      
      toast.success("Status atualizado", {
        description: `O agendamento foi marcado como ${status === 'scheduled' ? 'agendado' : 
                                                     status === 'confirmed' ? 'confirmado' :
                                                     status === 'in-progress' ? 'em andamento' : 
                                                     status === 'completed' ? 'concluído' : 'cancelado'}`
      });
      
      return data;
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro", {
        description: "Não foi possível atualizar o status"
      });
      throw error;
    }
  };

  // Remover um agendamento
  const removeAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      
      toast.success("Agendamento removido", {
        description: "O agendamento foi removido com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao remover agendamento:", error);
      toast.error("Erro", {
        description: "Não foi possível remover o agendamento"
      });
      throw error;
    }
  };

  // Obter agendamentos para uma data específica
  const getAppointmentsForDate = useCallback((date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
    });
  }, [appointments]);

  // Verificar conflitos de horário
  const checkForTimeConflicts = (appointment: Partial<Appointment>, excludeId?: string): boolean => {
    if (!appointment.start_time || !appointment.end_time || !appointment.mechanic_name) {
      return false;
    }

    const appointmentStart = new Date(appointment.start_time);
    const appointmentEnd = new Date(appointment.end_time);
    
    return appointments.some(existing => {
      if (excludeId && existing.id === excludeId) return false;
      
      if (existing.mechanic_name !== appointment.mechanic_name || existing.status === 'cancelled') {
        return false;
      }
      
      const existingStart = new Date(existing.start_time);
      const existingEnd = new Date(existing.end_time);
      
      return (
        (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
        (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
        (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
      );
    });
  };

  // Obter dias com agendamentos
  const getDaysWithAppointments = useCallback((startDate: Date, endDate: Date) => {
    const daysMap: { [key: string]: number } = {};
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.start_time);
      
      if (date >= startDate && date <= endDate) {
        const dateStr = date.toISOString().split('T')[0];
        daysMap[dateStr] = (daysMap[dateStr] || 0) + 1;
      }
    });
    
    return daysMap;
  }, [appointments]);

  // Obter agendamento por ID
  const getAppointmentById = useCallback(async (id: string): Promise<Appointment | null> => {
    try {
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
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar agendamento por ID:', error);
      return null;
    }
  }, []);

  // Inicializar o hook buscando a organização do usuário e então os agendamentos
  useEffect(() => {
    const init = async () => {
      const orgId = await fetchUserOrganization();
      setUserOrganizationId(orgId);
      
      if (orgId) {
        await fetchAppointments();
      } else {
        setAppointments([]);
        setFilteredAppointments([]);
        setIsLoading(false);
        setError('Usuário não pertence a nenhuma organização');
      }
    };

    init();
    
    // Configurar a escuta em tempo real para atualizações
    const orgId = userOrganizationId;
    if (orgId) {
      const channel = supabase
        .channel('appointments-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `organization_id=eq.${orgId}`
        }, (payload) => {
          console.log('Alteração em tempo real detectada em agendamentos:', payload);
          fetchAppointments();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchUserOrganization]);

  // Aplicar filtros quando os agendamentos ou os filtros mudarem
  useEffect(() => {
    applyFilters();
  }, [appointments, filter, applyFilters]);

  return {
    appointments: filteredAppointments,
    allAppointments: appointments,
    isLoading,
    error,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    removeAppointment,
    getAppointmentsForDate,
    checkForTimeConflicts,
    getDaysWithAppointments,
    getAppointmentById
  };
}
