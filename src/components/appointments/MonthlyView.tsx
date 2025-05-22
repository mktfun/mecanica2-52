import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  addDays,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';

interface MonthlyViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ selectedDate, setSelectedDate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [selectedDayForAppointment, setSelectedDayForAppointment] = useState<Date | null>(null);
  const { toast } = useToast();
  const { getDaysWithAppointments, getAppointmentsForDate } = useAppointments();
  
  // Gerar dias do mês para o calendário
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // Todos os dias a serem renderizados no calendário
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });
  
  // Dividir os dias em semanas
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  calendarDays.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);
  
  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      // Calcular o início e fim do mês para buscar agendamentos
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      
      // Buscar todos os dias com agendamentos no mês
      const daysWithAppts = getDaysWithAppointments(monthStart, monthEnd);
      
      // Buscar agendamentos para todos os dias
      let allMonthAppointments: Appointment[] = [];
      
      for (const day of daysWithAppts) {
        const dayAppointments = getAppointmentsForDate(day);
        allMonthAppointments = [...allMonthAppointments, ...dayAppointments];
      }
      
      setAppointments(allMonthAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => {
      const startTime = parseISO(appointment.start_time);
      return isSameDay(startTime, day);
    });
  };
  
  const handleAppointmentClick = (appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDayClick = (day: Date) => {
    setSelectedDayForAppointment(day);
    setIsNewAppointmentDialogOpen(true);
  };
  
  const handleDaySelect = (day: Date) => {
    setSelectedDate(day);
  };
  
  // Dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="monthly-view overflow-auto">
      <div className="grid grid-cols-7 border-b dark:border-gray-700">
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1 p-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b dark:border-gray-700">
              {week.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, selectedDate);
                
                return (
                  <div 
                    key={dayIndex}
                    className={`min-h-[120px] p-1 border-r last:border-r-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                    onDoubleClick={() => handleDaySelect(day)}
                  >
                    <div className="flex justify-between items-center p-1">
                      <span className={`text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday ? 'bg-blue-600 text-white' : ''
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="text-xs font-medium bg-gray-200 dark:bg-gray-800 rounded-full px-1.5 py-0.5">
                          {dayAppointments.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 space-y-1 overflow-hidden max-h-[80px]">
                      {dayAppointments.slice(0, 3).map(appointment => (
                        <div 
                          key={appointment.id}
                          className={`text-xs p-1 rounded truncate ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            appointment.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            appointment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                          onClick={(e) => handleAppointmentClick(appointment, e)}
                        >
                          {format(parseISO(appointment.start_time), 'HH:mm')} - {appointment.client_name}
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                          +{dayAppointments.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onUpdate={fetchAppointments}
        />
      )}

      {selectedDayForAppointment && (
        <CreateAppointmentDialog 
          selectedDate={selectedDayForAppointment}
          isOpen={isNewAppointmentDialogOpen}
          onClose={() => setIsNewAppointmentDialogOpen(false)}
          onCreated={fetchAppointments}
        />
      )}
    </div>
  );
};

export default MonthlyView;
