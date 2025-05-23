import React, { useState, useEffect } from 'react';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  isSameDay,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
import { useAppointments } from '@/hooks/useAppointments';

interface MonthlyViewProps {
  selectedDate: Date;
  onDateSelected: (date: Date) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ 
  selectedDate, 
  onDateSelected
}) => {
  const [dates, setDates] = useState<Date[][]>([]);
  const [daysWithAppointments, setDaysWithAppointments] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getDaysWithAppointments } = useAppointments();
  
  // Gerar calendário do mês
  useEffect(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    
    // Começar da primeira semana completa
    const firstDay = startOfWeek(start);
    const lastDay = endOfWeek(end);
    
    const calendar: Date[][] = [];
    let week: Date[] = [];
    
    // Preencher calendário
    let day = firstDay;
    while (day <= lastDay) {
      week.push(day);
      
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
      
      day = addDays(day, 1);
    }
    
    setDates(calendar);
    
    // Carregar dias com agendamentos
    fetchDaysWithAppointments(firstDay, lastDay);
  }, [selectedDate]);
  
  // Buscar dias com agendamentos
  const fetchDaysWithAppointments = (start: Date, end: Date) => {
    setIsLoading(true);
    
    try {
      const days = getDaysWithAppointments(start, end);
      setDaysWithAppointments(days);
    } catch (error) {
      console.error('Erro ao carregar dias com agendamentos:', error);
      toast.error('Não foi possível carregar os agendamentos');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verificar se um dia possui agendamentos
  const hasAppointmentsOnDay = (day: Date) => {
    return daysWithAppointments.some(d => isSameDay(d, day));
  };
  
  // Obter número de agendamentos para um dia
  const getAppointmentCount = (day: Date) => {
    return daysWithAppointments.filter(d => isSameDay(d, day)).length;
  };
  
  // Verificar se um dia é hoje
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };
  
  // Verificar se um dia é do mês atual
  const isCurrentMonth = (date: Date) => {
    return isSameMonth(date, selectedDate);
  };
  
  // Formatar mês e ano
  const formattedMonthYear = format(selectedDate, 'MMMM yyyy', { locale: ptBR });
  
  // Ir para o mês anterior
  const handlePreviousMonth = () => {
    const prevMonth = new Date(selectedDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onDateSelected(prevMonth);
  };
  
  // Ir para o próximo mês
  const handleNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onDateSelected(nextMonth);
  };
  
  // Ir para o mês atual
  const handleToday = () => {
    onDateSelected(new Date());
  };

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="monthly-view bg-gray-50/30 dark:bg-gray-900/30 rounded-lg p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden">
        {/* Header moderno com navegação */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-gray-100 min-w-[180px]">
              {formattedMonthYear}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium"
          >
            Hoje
          </Button>
        </div>

        {/* Calendário */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day, i) => (
              <div 
                key={i}
                className="text-center py-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {dates.map((week, weekIndex) => (
              <React.Fragment key={`week-${weekIndex}`}>
                {week.map((day, dayIndex) => (
                  <div 
                    key={`day-${day.getTime()}`}
                    className={`
                      relative p-2 min-h-[80px] hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer rounded-lg transition-all duration-200 border-2 border-transparent
                      ${isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''}
                      ${!isCurrentMonth(day) ? 'opacity-40' : ''}
                      hover:border-gray-200 dark:hover:border-gray-600
                    `}
                    onClick={() => onDateSelected(day)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-medium ${
                          isToday(day) 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : isCurrentMonth(day) 
                              ? 'text-gray-900 dark:text-gray-100' 
                              : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {day.getDate()}
                        </span>
                        
                        {isLoading ? (
                          <Skeleton className="w-4 h-4 rounded-full" />
                        ) : (
                          hasAppointmentsOnDay(day) && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {getAppointmentCount(day)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                      
                      {/* Indicador visual para agendamentos */}
                      {!isLoading && hasAppointmentsOnDay(day) && (
                        <div className="flex-1 flex items-end">
                          <div className="w-full h-1 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full opacity-60"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;
