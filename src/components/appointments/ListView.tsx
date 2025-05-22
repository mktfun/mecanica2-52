
import React, { useState } from 'react';
import { Appointment, AppointmentFilter } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateTime } from '@/utils/formatters';

export default function ListView() {
  const [filter, setFilter] = useState<AppointmentFilter>({});
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState<keyof Appointment>('start_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { appointments } = useAppointments(filter);

  const handleFilterChange = (field: keyof AppointmentFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    handleFilterChange('startDate', date);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    handleFilterChange('endDate', date);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    handleFilterChange('searchText', value);
  };

  const handleSortChange = (field: keyof Appointment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setFilter({});
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchText('');
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const renderSortArrow = (field: keyof Appointment) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };

  const sortedAppointments = [...appointments].sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'in-progress': return 'Em andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchText}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date-from" className="text-xs">De</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-from"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP", { locale: ptBR }) : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="date-to" className="text-xs">Até</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-to"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PP", { locale: ptBR }) : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="status-filter" className="text-xs">Status</Label>
            <Select
              value={filter.status || 'all_statuses'}
              onValueChange={(value) => value === 'all_statuses' ? 
                handleFilterChange('status', undefined) : 
                handleFilterChange('status', value as Appointment['status'])}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">Todos</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in-progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleResetFilters} className="md:col-span-4 w-full md:w-auto">
            <X className="h-4 w-4 mr-1" /> Limpar filtros
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border dark:border-gray-700 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
          <table className="w-full">
            <thead className="border-b dark:border-gray-700">
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="py-3 px-4 text-left font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSortChange('client_name')}>
                  Cliente {renderSortArrow('client_name')}
                </th>
                <th className="py-3 px-4 text-left font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSortChange('vehicle_info')}>
                  Veículo {renderSortArrow('vehicle_info')}
                </th>
                <th className="py-3 px-4 text-left font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSortChange('service_type')}>
                  Serviço {renderSortArrow('service_type')}
                </th>
                <th className="py-3 px-4 text-left font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSortChange('start_time')}>
                  Data/Hora {renderSortArrow('start_time')}
                </th>
                <th className="py-3 px-4 text-left font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSortChange('mechanic_name')}>
                  Mecânico {renderSortArrow('mechanic_name')}
                </th>
                <th className="py-3 px-4 text-left font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSortChange('status')}>
                  Status {renderSortArrow('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.length > 0 ? (
                sortedAppointments.map((appointment) => (
                  <tr 
                    key={appointment.id} 
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <td className="py-3 px-4">{appointment.client_name}</td>
                    <td className="py-3 px-4">{appointment.vehicle_info}</td>
                    <td className="py-3 px-4">{appointment.service_type}</td>
                    <td className="py-3 px-4">{formatDateTime(new Date(appointment.start_time))}</td>
                    <td className="py-3 px-4">{appointment.mechanic_name}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "inline-block px-2 py-1 rounded-full text-xs font-medium",
                        appointment.status === 'scheduled' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                        appointment.status === 'in-progress' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                        appointment.status === 'completed' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                        appointment.status === 'cancelled' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      )}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onUpdate={() => {}} // Recarregar dados quando houver atualização
        />
      )}
    </div>
  );
}
