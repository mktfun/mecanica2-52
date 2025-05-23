
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentCard from './AppointmentCard';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from "sonner";
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';

interface MonthlyViewProps {
  selectedDate: Date;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ selectedDate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date>(new Date());
  const [daysWithAppointments, setDaysWithAppointments] = useState<Date[]>([]);
  const { getDaysWithAppointments } = useAppointments();

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);
      
      // Get days that have appointments
      const days = getDaysWithAppointments(startDate, endDate);
      setDaysWithAppointments(days);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Não foi possível carregar os agendamentos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setNewAppointmentDate(date);
    setIsNewAppointmentDialogOpen(true);
  };

  // Generate calendar days
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty cells for days before the month starts
  const startDayOfWeek = getDay(monthStart);
  const emptyCellsStart = Array(startDayOfWeek).fill(null);

  // Add empty cells for days after the month ends
  const endDayOfWeek = getDay(monthEnd);
  const emptyCellsEnd = Array(6 - endDayOfWeek).fill(null);

  const allCalendarCells = [...emptyCellsStart, ...calendarDays, ...emptyCellsEnd];

  const hasAppointments = (date: Date) => {
    return daysWithAppointments.some(day => isSameDay(day, date));
  };

  if (isLoading) {
    return (
      <div className="monthly-view overflow-auto bg-gray-50/30 dark:bg-gray-900/30 rounded-lg">
        <div className="min-w-[800px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="monthly-view overflow-auto bg-gray-50/30 dark:bg-gray-900/30 rounded-lg">
      <div className="min-w-[800px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {allCalendarCells.map((date, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border rounded-lg transition-all duration-200 ${
                  date 
                    ? `border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                        isSameDay(date, new Date()) 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                          : 'bg-white dark:bg-gray-800'
                      }`
                    : 'border-transparent'
                }`}
                onClick={() => date && handleDateClick(date)}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isSameDay(date, new Date()) 
                        ? 'text-blue-900 dark:text-blue-100' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    
                    {hasAppointments(date) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onUpdate={fetchAppointments}
        />
      )}

      <CreateAppointmentDialog 
        selectedDate={newAppointmentDate}
        isOpen={isNewAppointmentDialogOpen}
        onClose={() => setIsNewAppointmentDialogOpen(false)}
        onCreated={fetchAppointments}
      />
    </div>
  );
};

export default MonthlyView;
