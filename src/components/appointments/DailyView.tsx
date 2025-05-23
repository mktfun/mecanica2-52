
import React, { useState, useEffect } from 'react';
import { format, addHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentCard from './AppointmentCard';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';

interface DailyViewProps {
  selectedDate: Date;
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
  const { getAppointmentsForDate } = useAppointments();
  
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
      // Usar o hook useAppointments para obter agendamentos
      const fetchedAppointments = getAppointmentsForDate(selectedDate);
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Não foi possível carregar os agendamentos. Tente novamente mais tarde.');
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
    <div className="daily-view overflow-auto bg-gray-50/30 dark:bg-gray-900/30 rounded-lg">
      <div className="min-w-[768px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
        {/* Header com estilo moderno */}
        <div className="grid grid-cols-[100px_1fr] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-lg">
          <div className="py-4 px-6 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Horário
          </div>
          <div className="py-4 px-6 font-medium text-sm text-gray-700 dark:text-gray-300">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </div>
        </div>

        {hours.map((hour, index) => (
          <div 
            key={hour} 
            className={`grid grid-cols-[100px_1fr] border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 transition-all duration-200 cursor-pointer group ${
              index === hours.length - 1 ? 'rounded-b-lg border-b-0' : ''
            }`}
          >
            <div className="p-4 text-sm text-center text-gray-400 dark:text-gray-500 border-r border-gray-50 dark:border-gray-700/30 font-mono">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            <div 
              className="p-4 min-h-[80px] flex items-start" 
              onClick={() => handleTimeSlotClick(hour)}
            >
              {isLoading ? (
                <div className="space-y-2 w-full">
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  {getAppointmentsForHour(hour).map(appointment => (
                    <div
                      key={appointment.id}
                      className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group-hover:shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(appointment);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {appointment.client_name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {appointment.service_type || 'Serviço geral'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {format(new Date(appointment.start_time), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getAppointmentsForHour(hour).length === 0 && (
                    <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Clique para agendar
                    </div>
                  )}
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
