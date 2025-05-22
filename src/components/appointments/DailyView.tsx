
import React, { useState, useEffect } from 'react';
import { format, addHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentCard from './AppointmentCard';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface DailyViewProps {
  selectedDate: Date;
}

interface Appointment {
  id: string;
  client_name: string;
  vehicle_info: string;
  service_type: string;
  start_time: string;
  end_time: string;
  mechanic_name: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

// Horário de funcionamento da oficina
const BUSINESS_HOURS = {
  start: 8, // 8:00
  end: 18, // 18:00
};

const DailyView: React.FC<DailyViewProps> = ({ selectedDate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Array de horas do dia de funcionamento
  const hours = Array.from(
    { length: BUSINESS_HOURS.end - BUSINESS_HOURS.start },
    (_, i) => BUSINESS_HOURS.start + i
  );
  
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);
  
  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      // Formatamos a data para filtrar os agendamentos
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Simulamos a obtenção dos dados (em um app real, isso seria uma chamada ao Supabase)
      // Aguardamos 1 segundo para simular o loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados de exemplo
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          client_name: 'João Silva',
          vehicle_info: 'Honda Civic 2018 - ABC1234',
          service_type: 'Troca de Óleo',
          start_time: `${dateString}T09:00:00`,
          end_time: `${dateString}T10:00:00`,
          mechanic_name: 'Carlos Ferreira',
          status: 'scheduled'
        },
        {
          id: '2',
          client_name: 'Maria Santos',
          vehicle_info: 'Toyota Corolla 2020 - DEF5678',
          service_type: 'Revisão Completa',
          start_time: `${dateString}T11:00:00`,
          end_time: `${dateString}T14:00:00`,
          mechanic_name: 'André Sousa',
          status: 'in-progress'
        },
        {
          id: '3',
          client_name: 'Pedro Oliveira',
          vehicle_info: 'Fiat Uno 2015 - GHI9012',
          service_type: 'Troca de Pastilhas',
          start_time: `${dateString}T14:30:00`,
          end_time: `${dateString}T16:00:00`,
          mechanic_name: 'Ricardo Almeida',
          status: 'completed'
        }
      ];
      
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.add({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(appointment => {
      const startTime = new Date(appointment.start_time);
      const endTime = new Date(appointment.end_time);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      return (
        (startTime < slotEnd && endTime > slotStart)
      );
    });
  };
  
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };
  
  const handleTimeSlotClick = (hour: number) => {
    const date = new Date(selectedDate);
    date.setHours(hour, 0, 0, 0);
    setSelectedTimeSlot(date);
    setIsNewAppointmentDialogOpen(true);
  };

  return (
    <div className="daily-view overflow-auto">
      <div className="min-w-[768px]">
        <div className="grid grid-cols-[80px_1fr] border-b dark:border-gray-700">
          <div className="py-2 px-4 font-medium text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
            Horário
          </div>
          <div className="py-2 px-4 font-medium text-sm">
            Agendamentos
          </div>
        </div>

        {hours.map(hour => (
          <div 
            key={hour} 
            className="grid grid-cols-[80px_1fr] border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
          >
            <div className="p-2 text-xs text-center text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            <div 
              className="p-2 min-h-[100px]" 
              onClick={() => handleTimeSlotClick(hour)}
            >
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {getAppointmentsForHour(hour).map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => handleAppointmentClick(appointment)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onUpdate={fetchAppointments}
        />
      )}

      {selectedTimeSlot && (
        <CreateAppointmentDialog 
          selectedDate={selectedTimeSlot}
          isOpen={isNewAppointmentDialogOpen}
          onClose={() => setIsNewAppointmentDialogOpen(false)}
          onCreated={fetchAppointments}
        />
      )}
    </div>
  );
};

export default DailyView;
