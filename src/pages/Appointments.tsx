
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ListFilter, Grid3X3, LayoutList, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DailyView from '@/components/appointments/DailyView';
import WeeklyView from '@/components/appointments/WeeklyView';
import MonthlyView from '@/components/appointments/MonthlyView';
import ListViewAppointments from '@/components/appointments/ListView';
import CreateAppointmentDialog from '@/components/appointments/CreateAppointmentDialog';
import { Button } from '@/components/ui/button';
import { AppointmentFilter } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'list'>('week');
  const [filter, setFilter] = useState<AppointmentFilter>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Usar hook para acessar agendamentos com atualização automática
  const { appointments } = useAppointments(filter);
  
  const handlePreviousDate = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getDateRangeDisplay = () => {
    if (view === 'day') {
      return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } else if (view === 'week') {
      const firstDay = new Date(selectedDate);
      const dayOfWeek = selectedDate.getDay();
      firstDay.setDate(selectedDate.getDate() - dayOfWeek);
      
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      
      const firstDayMonth = format(firstDay, "dd", { locale: ptBR });
      const lastDayMonth = format(lastDay, "dd", { locale: ptBR });
      
      if (firstDay.getMonth() === lastDay.getMonth()) {
        return `${firstDayMonth} - ${lastDayMonth} de ${format(firstDay, "MMMM 'de' yyyy", { locale: ptBR })}`;
      } else {
        return `${firstDayMonth} ${format(firstDay, "MMM", { locale: ptBR })} - ${lastDayMonth} ${format(lastDay, "MMM 'de' yyyy", { locale: ptBR })}`;
      }
    } else if (view === 'month') {
      return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
    } else {
      return "Todos os agendamentos";
    }
  };

  const handleAppointmentCreated = () => {
    // Não precisamos recarregar os dados manualmente pois o hook useStorageData 
    // atualiza automaticamente quando os dados mudam
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Agendamentos</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie todos os agendamentos da oficina</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs 
            value={view} 
            onValueChange={(v) => setView(v as 'day' | 'week' | 'month' | 'list')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="day" className="flex items-center gap-1">
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dia</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-1">
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">Semana</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Mês</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousDate}
              className="px-2"
              disabled={view === 'list'}
            >
              &lt;
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToday}
              className="px-2 text-xs whitespace-nowrap"
              disabled={view === 'list'}
            >
              Hoje
            </Button>
            
            <span className="text-sm font-medium min-w-[180px] text-center">
              {getDateRangeDisplay()}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextDate}
              className="px-2"
              disabled={view === 'list'}
            >
              &gt;
            </Button>
          </div>
        </div>
        
        <div>
          {view === 'day' && <DailyView selectedDate={selectedDate} />}
          {view === 'week' && <WeeklyView selectedDate={selectedDate} />}
          {view === 'month' && <MonthlyView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
          {view === 'list' && <ListViewAppointments />}
        </div>
      </div>

      <CreateAppointmentDialog
        selectedDate={selectedDate}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreated={handleAppointmentCreated}
      />
    </div>
  );
};

export default Appointments;
