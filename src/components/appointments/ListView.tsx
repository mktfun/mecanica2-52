
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Search 
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';

interface Appointment {
  id: string;
  client_name: string;
  vehicle_info: string;
  service_type: string;
  start_time: string;
  end_time: string;
  mechanic_name: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

const ListView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    mechanic: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  });
  const { toast } = useToast();
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    setIsLoading(true);
    
    try {
      // Aguardamos 1 segundo para simular o loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados de exemplo para a lista
      const mockAppointments: Appointment[] = [];
      
      // Gerar agendamentos aleatórios
      for (let i = 0; i < 50; i++) {
        const id = `list-${i}-${Date.now()}`;
        const day = new Date();
        day.setDate(day.getDate() - Math.floor(Math.random() * 30) + 15); // Últimos 15 dias e próximos 15
        const hour = Math.floor(Math.random() * (17 - 8)) + 8;
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 horas
        
        const dateString = format(day, 'yyyy-MM-dd');
        
        mockAppointments.push({
          id,
          client_name: `Cliente ${i.toString().padStart(2, '0')}`,
          vehicle_info: `Veículo ${Math.floor(Math.random() * 1000)} - ${['ABC', 'DEF', 'GHI', 'JKL'][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`,
          service_type: ['Troca de Óleo', 'Revisão', 'Alinhamento', 'Freios', 'Elétrica', 'Motor', 'Suspensão'][Math.floor(Math.random() * 7)],
          start_time: `${dateString}T${hour.toString().padStart(2, '0')}:00:00`,
          end_time: `${dateString}T${(hour + duration).toString().padStart(2, '0')}:00:00`,
          mechanic_name: ['Carlos', 'André', 'Ricardo', 'Paulo', 'Marcos'][Math.floor(Math.random() * 5)],
          status: ['scheduled', 'in-progress', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as any
        });
      }
      
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.add({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };
  
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Filtro de pesquisa (cliente, veículo ou tipo de serviço)
    if (filters.search && !appointment.client_name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !appointment.vehicle_info.toLowerCase().includes(filters.search.toLowerCase()) &&
        !appointment.service_type.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filtro por status
    if (filters.status && appointment.status !== filters.status) {
      return false;
    }
    
    // Filtro por mecânico
    if (filters.mechanic && appointment.mechanic_name !== filters.mechanic) {
      return false;
    }
    
    // Filtro por data de início
    if (filters.dateFrom) {
      const startDate = parseISO(appointment.start_time);
      if (startDate < filters.dateFrom) {
        return false;
      }
    }
    
    // Filtro por data de fim
    if (filters.dateTo) {
      const startDate = parseISO(appointment.start_time);
      if (startDate > filters.dateTo) {
        return false;
      }
    }
    
    return true;
  });
  
  // Lista única de mecânicos para o filtro
  const mechanics = Array.from(new Set(appointments.map(a => a.mechanic_name))).sort();

  return (
    <div className="list-view p-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <Input 
            placeholder="Buscar por cliente, veículo ou serviço..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <Select 
          value={filters.status} 
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            <SelectItem value="scheduled">Agendados</SelectItem>
            <SelectItem value="in-progress">Em andamento</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.mechanic} 
          onValueChange={(value) => handleFilterChange('mechanic', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Mecânico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os mecânicos</SelectItem>
            {mechanics.map(mechanic => (
              <SelectItem key={mechanic} value={mechanic}>
                {mechanic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-left font-normal w-full sm:w-[160px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? (
                  format(filters.dateFrom, 'dd/MM/yyyy')
                ) : (
                  <span>Data Início</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => handleFilterChange('dateFrom', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-left font-normal w-full sm:w-[160px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? (
                  format(filters.dateTo, 'dd/MM/yyyy')
                ) : (
                  <span>Data Fim</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => handleFilterChange('dateTo', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Mecânico</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow 
                  key={appointment.id}
                  onClick={() => handleAppointmentClick(appointment)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="font-medium">
                      {format(parseISO(appointment.start_time), 'dd/MM/yyyy')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(appointment.start_time), 'HH:mm')} - {format(parseISO(appointment.end_time), 'HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>{appointment.client_name}</TableCell>
                  <TableCell>{appointment.vehicle_info}</TableCell>
                  <TableCell>{appointment.service_type}</TableCell>
                  <TableCell>{appointment.mechanic_name}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/30' :
                        appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/30' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/30' :
                        'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-800'
                      }
                    >
                      {appointment.status === 'scheduled' ? 'Agendado' :
                       appointment.status === 'in-progress' ? 'Em andamento' :
                       appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhum agendamento encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onUpdate={fetchAppointments}
        />
      )}
    </div>
  );
};

export default ListView;
