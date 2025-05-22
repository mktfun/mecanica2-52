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
    <div className="weekly-view overflow-auto">
      <div className="min-w-[1000px]">
        <div className="grid grid-cols-[80px_repeat(7,1fr)]">
          <div className="p-2 border-r dark:border-gray-700"></div>
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`p-3 text-center border-r last:border-r-0 dark:border-gray-700 ${
                isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="text-sm font-medium capitalize">
                {format(day, 'EEEE', { locale: ptBR })}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format(day, 'dd/MM')}
              </div>
            </div>
          ))}
        </div>
        
        {hours.map(hour => (
          <div 
            key={hour} 
            className="grid grid-cols-[80px_repeat(7,1fr)] border-t dark:border-gray-700"
          >
            <div className="p-2 text-xs text-center text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            
            {weekDays.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className={`p-1 min-h-[80px] border-r last:border-r-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                  isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleTimeSlotClick(day, hour)}
              >
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  getAppointmentsForDayAndHour(day, hour).map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => handleAppointmentClick(appointment)}
                      condensed
                    />
                  ))
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
