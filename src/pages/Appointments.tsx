
import React, { useState } from 'react';
import { CalendarIcon, LayoutGrid, List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import DailyView from '@/components/appointments/DailyView';
import WeeklyView from '@/components/appointments/WeeklyView';
import MonthlyView from '@/components/appointments/MonthlyView';
import ListView from '@/components/appointments/ListView';

type ViewType = 'daily' | 'weekly' | 'monthly' | 'list';

const Appointments = () => {
  const [currentView, setCurrentView] = useState<ViewType>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const ViewComponent = {
    daily: DailyView,
    weekly: WeeklyView,
    monthly: MonthlyView,
    list: ListView
  }[currentView];

  const getViewTitle = () => {
    switch (currentView) {
      case 'daily':
        return 'Visualização Diária';
      case 'weekly':
        return 'Visualização Semanal';
      case 'monthly':
        return 'Visualização Mensal';
      case 'list':
        return 'Lista de Agendamentos';
      default:
        return 'Agendamentos';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        
        <div className="flex items-center gap-4">
          {currentView !== 'list' && (
            <DatePicker
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('daily')}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Dia
            </Button>
            
            <Button
              variant={currentView === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('weekly')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Semana
            </Button>
            
            <Button
              variant={currentView === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('monthly')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Mês
            </Button>
            
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{getViewTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ViewComponent 
            selectedDate={selectedDate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
