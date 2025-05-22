import { StorageService } from '@/core/storage/StorageService';
import { Appointment, AppointmentFilter } from '@/types/appointment';

// Criar instância do serviço de armazenamento para agendamentos
export const appointmentStorage = new StorageService<Appointment>('appointments');

// Serviço com métodos específicos para agendamentos
export const appointmentService = {
  // Obter todos os agendamentos
  getAllAppointments(): Appointment[] {
    return appointmentStorage.getAll();
  },

  // Adicionar novo agendamento
  addAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Appointment {
    // Adicionar o campo updated_at automaticamente
    const now = new Date().toISOString();
    const appointmentToAdd: Omit<Appointment, 'id' | 'created_at'> = {
      ...appointment,
      updated_at: now
    };
    
    // Agora o objeto está compatível com o tipo esperado pelo StorageService
    return appointmentStorage.add(appointmentToAdd);
  },

  // Atualizar agendamento existente
  updateAppointment(id: string, appointment: Partial<Appointment>): Appointment {
    return appointmentStorage.update(id, appointment);
  },

  // Remover agendamento
  removeAppointment(id: string): boolean {
    return appointmentStorage.remove(id);
  },

  // Obter agendamento por ID
  getAppointmentById(id: string): Appointment | null {
    return appointmentStorage.getById(id);
  },

  // Atualizar status do agendamento
  updateAppointmentStatus(id: string, status: Appointment['status']): Appointment | null {
    const appointment = this.getAppointmentById(id);
    
    if (!appointment) {
      return null;
    }
    
    return this.updateAppointment(id, {
      status,
      updated_at: new Date().toISOString()
    });
  },

  // Filtrar agendamentos
  filterAppointments(filter: AppointmentFilter): Appointment[] {
    return appointmentStorage.query(appointment => {
      // Filtro por data de início
      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        startDate.setHours(0, 0, 0, 0);
        const appointmentDate = new Date(appointment.start_time);
        
        if (appointmentDate < startDate) {
          return false;
        }
      }
      
      // Filtro por data de término
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        const appointmentDate = new Date(appointment.start_time);
        
        if (appointmentDate > endDate) {
          return false;
        }
      }
      
      // Filtro por cliente
      if (filter.client && !appointment.client_name.toLowerCase().includes(filter.client.toLowerCase())) {
        return false;
      }
      
      // Filtro por veículo
      if (filter.vehicle && !appointment.vehicle_info.toLowerCase().includes(filter.vehicle.toLowerCase())) {
        return false;
      }
      
      // Filtro por serviço
      if (filter.service && !appointment.service_type.toLowerCase().includes(filter.service.toLowerCase())) {
        return false;
      }
      
      // Filtro por mecânico
      if (filter.mechanic && !appointment.mechanic_name.toLowerCase().includes(filter.mechanic.toLowerCase())) {
        return false;
      }
      
      // Filtro por status
      if (filter.status && appointment.status !== filter.status) {
        return false;
      }
      
      // Filtro por texto em qualquer campo
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        const searchFields = [
          appointment.client_name,
          appointment.phone,
          appointment.email,
          appointment.vehicle_info,
          appointment.service_type,
          appointment.service_description,
          appointment.mechanic_name,
          appointment.notes
        ];
        
        const hasMatch = searchFields.some(field => 
          field && field.toLowerCase().includes(searchText)
        );
        
        if (!hasMatch) {
          return false;
        }
      }
      
      return true;
    });
  },

  // Verificar conflitos de horário
  checkForTimeConflicts(appointment: Partial<Appointment>, excludeId?: string): boolean {
    if (!appointment.start_time || !appointment.end_time || !appointment.mechanic_name) {
      return false; // Dados insuficientes para verificar
    }

    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    
    // Verificar se há sobreposição com outros agendamentos
    return appointmentStorage.query(existing => {
      // Ignorar o próprio agendamento em caso de edição
      if (excludeId && existing.id === excludeId) {
        return false;
      }
      
      // Verificar se o mecânico é o mesmo
      if (existing.mechanic_name !== appointment.mechanic_name) {
        return false;
      }

      // Verificar se o status é cancelado (não gera conflito)
      if (existing.status === 'cancelled') {
        return false;
      }
      
      // Converter strings para objetos Date
      const existingStartTime = new Date(existing.start_time);
      const existingEndTime = new Date(existing.end_time);
      
      // Verificar sobreposição
      return (
        (startTime >= existingStartTime && startTime < existingEndTime) ||
        (endTime > existingStartTime && endTime <= existingEndTime) ||
        (startTime <= existingStartTime && endTime >= existingEndTime)
      );
    }).length > 0;
  },

  // Obter agendamentos para um dia específico
  getAppointmentsForDate(date: Date): Appointment[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    return appointmentStorage.query(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      return appointmentDate >= targetDate && appointmentDate < nextDate;
    });
  },

  // Obter dias únicos com agendamentos
  getDaysWithAppointments(startDate: Date, endDate: Date): Date[] {
    const appointments = this.getAllAppointments();
    const daysMap = new Map<string, Date>();
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.start_time);
      const dateKey = date.toISOString().split('T')[0];
      
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      if (appointmentDate >= startDate && appointmentDate <= endDate) {
        daysMap.set(dateKey, appointmentDate);
      }
    });
    
    return Array.from(daysMap.values()).sort((a, b) => a.getTime() - b.getTime());
  }
};
