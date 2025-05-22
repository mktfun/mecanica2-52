
import { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentFilter } from '@/types/appointment';
import { appointmentService } from '@/services/appointmentService';
import { useStorageData } from './useStorageData';
import { appointmentStorage } from '@/services/appointmentService';
import { useToast } from './use-toast';

export function useAppointments(filter?: AppointmentFilter) {
  // Usar o hook useStorageData para obter atualização automática
  const allAppointments = useStorageData<Appointment>(appointmentStorage);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();

  // Aplicar filtros quando os agendamentos ou os filtros mudarem
  useEffect(() => {
    if (filter) {
      const filtered = appointmentService.filterAppointments(filter);
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(allAppointments);
    }
  }, [allAppointments, filter]);

  // Função para adicionar um novo agendamento
  const addAppointment = useCallback((appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Verificar conflitos de horário
      if (appointmentService.checkForTimeConflicts(appointment)) {
        toast({
          title: "Conflito de horário",
          description: "Já existe um agendamento para este mecânico neste horário",
          variant: "destructive"
        });
        return null;
      }

      const newAppointment = appointmentService.addAppointment(appointment);
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso"
      });
      return newAppointment;
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Função para atualizar um agendamento existente
  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    try {
      // Verificar conflitos de horário (excluindo o próprio agendamento)
      if ((updates.start_time || updates.end_time || updates.mechanic_name) && 
          appointmentService.checkForTimeConflicts(updates, id)) {
        toast({
          title: "Conflito de horário",
          description: "Já existe um agendamento para este mecânico neste horário",
          variant: "destructive"
        });
        return null;
      }

      const updatedAppointment = appointmentService.updateAppointment(id, updates);
      toast({
        title: "Agendamento atualizado",
        description: "As alterações foram salvas com sucesso"
      });
      return updatedAppointment;
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Função para atualizar o status de um agendamento
  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    try {
      const updatedAppointment = appointmentService.updateAppointmentStatus(id, status);
      
      if (updatedAppointment) {
        toast({
          title: "Status atualizado",
          description: `O agendamento foi marcado como ${status === 'scheduled' ? 'agendado' : 
                                                         status === 'in-progress' ? 'em andamento' : 
                                                         status === 'completed' ? 'concluído' : 'cancelado'}`
        });
      }
      
      return updatedAppointment;
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Função para remover um agendamento
  const removeAppointment = useCallback((id: string) => {
    try {
      const result = appointmentService.removeAppointment(id);
      
      if (result) {
        toast({
          title: "Agendamento removido",
          description: "O agendamento foi removido com sucesso"
        });
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao remover agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Obter agendamentos para uma data específica
  const getAppointmentsForDate = useCallback((date: Date) => {
    return appointmentService.getAppointmentsForDate(date);
  }, []);

  // Verificar conflitos de horário
  const checkForTimeConflicts = useCallback((appointment: Partial<Appointment>, excludeId?: string) => {
    return appointmentService.checkForTimeConflicts(appointment, excludeId);
  }, []);

  // Obter dias com agendamentos
  const getDaysWithAppointments = useCallback((startDate: Date, endDate: Date) => {
    return appointmentService.getDaysWithAppointments(startDate, endDate);
  }, []);

  return {
    appointments: filteredAppointments,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    removeAppointment,
    getAppointmentsForDate,
    checkForTimeConflicts,
    getDaysWithAppointments
  };
}
