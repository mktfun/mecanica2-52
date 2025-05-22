
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
    <div className="monthly-view">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
          >
            &lt;
          </Button>
          <h2 className="text-xl font-semibold capitalize">{formattedMonthYear}</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            &gt;
          </Button>
        </div>
        <Button 
          variant="outline"
          onClick={handleToday}
        >
          Hoje
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day, i) => (
          <div 
            key={i}
            className="text-center py-2 text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
        
        {dates.map((week, weekIndex) => (
          <React.Fragment key={`week-${weekIndex}`}>
            {week.map((day, dayIndex) => (
              <div 
                key={`day-${day.getTime()}`}
                className={`
                  border p-1 min-h-[80px] hover:bg-gray-50 cursor-pointer
                  ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}
                  ${!isCurrentMonth(day) ? 'text-gray-400 bg-gray-50' : ''}
                `}
                onClick={() => onDateSelected(day)}
              >
                <div className="flex justify-between items-start h-full flex-col">
                  <div className="w-full flex justify-between">
                    <span className={`text-sm ${isToday(day) ? 'font-bold' : ''}`}>
                      {day.getDate()}
                    </span>
                    
                    {isLoading ? (
                      <Skeleton className="w-5 h-5 rounded-full" />
                    ) : (
                      hasAppointmentsOnDay(day) && (
                        <span className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full text-xs text-blue-800">
                          {getAppointmentCount(day)}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MonthlyView;
