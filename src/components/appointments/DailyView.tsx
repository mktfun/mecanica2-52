
import React, { useState, useEffect } from 'react';
import { format, addHours, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentCard from './AppointmentCard';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { toast } from "sonner";
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';

interface DailyViewProps {
  selectedDate: Date;
}

const DailyView: React.FC<DailyViewProps> = ({ selectedDate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const { getAppointmentsForDate } = useAppointments();
  
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);
  
  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      const fetchedAppointments = getAppointmentsForDate(selectedDate);
      setAppointments(fetchedAppointments);
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
  
  const handleCreateAppointment = () => {
    const date = new Date(selectedDate);
    date.setHours(8, 0, 0, 0);
    setIsNewAppointmentDialogOpen(true);
  };

  // Obter horários únicos dos agendamentos
  const getUniqueHours = () => {
    const hoursSet = new Set<number>();
    appointments.forEach(appointment => {
      const startTime = new Date(appointment.start_time);
      hoursSet.add(startTime.getHours());
    });
    return Array.from(hoursSet).sort((a, b) => a - b);
  };

  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter(appointment => {
      const startTime = new Date(appointment.start_time);
      return startTime.getHours() === hour;
    });
  };

  if (isLoading) {
    return (
      <div className="daily-view overflow-auto bg-gray-50/30 dark:bg-gray-900/30 rounded-lg">
        <div className="min-w-[768px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
          <div className="grid grid-cols-[100px_1fr] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-lg">
            <div className="py-4 px-6 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Horário
            </div>
            <div className="py-4 px-6 font-medium text-sm text-gray-700 dark:text-gray-300">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Se não há agendamentos, mostrar mensagem e botão
  if (appointments.length === 0) {
    return (
      <div className="daily-view overflow-auto bg-gray-50/30 dark:bg-gray-900/30 rounded-lg">
        <div className="min-w-[768px] bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0">
          <div className="grid grid-cols-[100px_1fr] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-lg">
            <div className="py-4 px-6 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Horário
            </div>
            <div className="py-4 px-6 font-medium text-sm text-gray-700 dark:text-gray-300">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
          
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Nenhum agendamento para hoje
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Não há agendamentos para o dia {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              
              <Button 
                onClick={handleCreateAppointment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </div>

        <CreateAppointmentDialog 
          selectedDate={selectedDate}
          isOpen={isNewAppointmentDialogOpen}
          onClose={() => setIsNewAppointmentDialogOpen(false)}
          onCreated={fetchAppointments}
        />
      </div>
    );
  }

  // Se há agendamentos, mostrar apenas os horários com agendamentos
  const uniqueHours = getUniqueHours();

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

        {uniqueHours.map((hour, index) => (
          <div 
            key={hour} 
            className={`grid grid-cols-[100px_1fr] border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 transition-all duration-200 ${
              index === uniqueHours.length - 1 ? 'rounded-b-lg border-b-0' : ''
            }`}
          >
            <div className="p-4 text-sm text-center text-gray-400 dark:text-gray-500 border-r border-gray-50 dark:border-gray-700/30 font-mono">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            <div className="p-4 space-y-2">
              {getAppointmentsForHour(hour).map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => handleAppointmentClick(appointment)}
                />
              ))}
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

      <CreateAppointmentDialog 
        selectedDate={selectedDate}
        isOpen={isNewAppointmentDialogOpen}
        onClose={() => setIsNewAppointmentDialogOpen(false)}
        onCreated={fetchAppointments}
      />
    </div>
  );
};

export default DailyView;
