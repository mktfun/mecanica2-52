
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Grid3X3, LayoutList, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DailyView from '@/components/appointments/DailyView';
import WeeklyView from '@/components/appointments/WeeklyView';
import MonthlyView from '@/components/appointments/MonthlyView';
import ListViewAppointments from '@/components/appointments/ListView';
import CreateAppointmentDialog from '@/components/appointments/CreateAppointmentDialog';
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
    <div className="p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900/30 min-h-screen">
      {/* Header moderno */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Agendamentos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie todos os agendamentos da oficina</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>
      
      {/* Container principal com estilo moderno */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-0 overflow-hidden">
        {/* Barra de controles modernizada */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Tabs de visualização com estilo moderno */}
            <Tabs 
              value={view} 
              onValueChange={(v) => setView(v as 'day' | 'week' | 'month' | 'list')}
              className="w-full lg:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full lg:w-auto bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <TabsTrigger 
                  value="day" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Dia</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="week" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600"
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="hidden sm:inline">Semana</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="month" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Mês</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-600"
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="hidden sm:inline">Lista</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Controles de navegação modernos */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePreviousDate}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={view === 'list'}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium whitespace-nowrap"
                disabled={view === 'list'}
              >
                Hoje
              </Button>
              
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center capitalize">
                {getDateRangeDisplay()}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNextDate}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={view === 'list'}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Área de conteúdo */}
        <div className="p-6">
          {view === 'day' && <DailyView selectedDate={selectedDate} />}
          {view === 'week' && <WeeklyView selectedDate={selectedDate} />}
          {view === 'month' && <MonthlyView selectedDate={selectedDate} onDateSelected={setSelectedDate} />}
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
