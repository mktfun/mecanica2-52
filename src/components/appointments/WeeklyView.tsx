
import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentCard from './AppointmentCard';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';

interface WeeklyViewProps {
  selectedDate: Date;
}

// Horário de funcionamento da oficina
const BUSINESS_HOURS = {
  start: 8, // 8:00
  end: 18, // 18:00
};

const WeeklyView: React.FC<WeeklyViewProps> = ({ selectedDate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const { getDaysWithAppointments, getAppointmentsForDate } = useAppointments();
  
  // Array de horas do dia de funcionamento
  const hours = Array.from(
    { length: BUSINESS_HOURS.end - BUSINESS_HOURS.start },
    (_, i) => BUSINESS_HOURS.start + i
  );
  
  // Calcular dias da semana a partir da data selecionada
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
  
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);
  
  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      // Buscar agendamentos para todos os dias da semana
      let weekAppointments: Appointment[] = [];
      
      for (const day of weekDays) {
        const dayAppointments = getAppointmentsForDate(day);
        weekAppointments = [...weekAppointments, ...dayAppointments];
      }
      
      setAppointments(weekAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Não foi possível carregar os agendamentos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter(appointment => {
      const startTime = parseISO(appointment.start_time);
      const endTime = parseISO(appointment.end_time);
      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      return (
        isSameDay(startTime, day) && 
        (startTime < slotEnd && endTime > slotStart)
      );
    });
  };
  
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };
  
  const handleTimeSlotClick = (day: Date, hour: number) => {
    const date = new Date(day);
    date.setHours(hour, 0, 0, 0);
    setSelectedTimeSlot(date);
    setIsNewAppointmentDialogOpen(true);
  };

  return (
    <div className="weekly-view overflow-auto bg-gray-50/30 dark:bg-gray-900/30 rounded-lg">
      <div className="min-w-[1000px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
        {/* Header moderno com dias da semana */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] bg-gray-50/50 dark:bg-gray-800/50 rounded-t-lg border-b border-gray-100 dark:border-gray-700/50">
          <div className="p-4 border-r border-gray-100 dark:border-gray-700/50"></div>
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`p-4 text-center border-r border-gray-100 dark:border-gray-700/50 last:border-r-0 transition-colors duration-200 ${
                isSameDay(day, new Date()) 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className={`text-sm font-medium capitalize ${
                isSameDay(day, new Date()) ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {format(day, 'EEEE', { locale: ptBR })}
              </div>
              <div className={`text-xs mt-1 ${
                isSameDay(day, new Date()) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {format(day, 'dd/MM')}
              </div>
              {isSameDay(day, new Date()) && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-2"></div>
              )}
            </div>
          ))}
        </div>
        
        {hours.map((hour, hourIndex) => (
          <div 
            key={hour} 
            className={`grid grid-cols-[100px_repeat(7,1fr)] border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 transition-all duration-200 ${
              hourIndex === hours.length - 1 ? 'rounded-b-lg border-b-0' : ''
            }`}
          >
            <div className="p-4 text-sm text-center text-gray-400 dark:text-gray-500 border-r border-gray-50 dark:border-gray-700/30 font-mono">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            
            {weekDays.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className={`p-2 min-h-[80px] border-r border-gray-50 dark:border-gray-700/30 last:border-r-0 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 transition-all duration-200 cursor-pointer group ${
                  isSameDay(day, new Date()) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => handleTimeSlotClick(day, hour)}
              >
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <div className="space-y-1">
                    {getAppointmentsForDayAndHour(day, hour).map(appointment => (
                      <div
                        key={appointment.id}
                        className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-2 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-sm transition-all duration-200 cursor-pointer text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {appointment.client?.name || 'Cliente não especificado'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 truncate">
                          {appointment.service_type || 'Serviço'}
                        </div>
                      </div>
                    ))}
                    {getAppointmentsForDayAndHour(day, hour).length === 0 && (
                      <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        +
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
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

export default WeeklyView;
