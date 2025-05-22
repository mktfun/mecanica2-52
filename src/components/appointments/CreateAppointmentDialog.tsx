
import React, { useState } from 'react';
import { format, addHours } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus } from 'lucide-react';

interface CreateAppointmentDialogProps {
  selectedDate?: Date;
  isOpen?: boolean;
  onClose?: () => void;
  onCreated?: () => void;
}

const serviceTypes = [
  { id: 'oil-change', name: 'Troca de Óleo', duration: 1 },
  { id: 'full-review', name: 'Revisão Completa', duration: 3 },
  { id: 'alignment', name: 'Alinhamento e Balanceamento', duration: 2 },
  { id: 'brake-repair', name: 'Reparo de Freios', duration: 2 },
  { id: 'electronic', name: 'Diagnóstico Eletrônico', duration: 1 },
  { id: 'suspension', name: 'Manutenção de Suspensão', duration: 3 },
  { id: 'engine-repair', name: 'Reparo de Motor', duration: 4 },
];

const mechanics = [
  { id: '1', name: 'Carlos Ferreira' },
  { id: '2', name: 'André Sousa' },
  { id: '3', name: 'Ricardo Almeida' },
  { id: '4', name: 'Paulo Mendes' },
  { id: '5', name: 'Marcos Lima' },
];

const resources = [
  { id: '1', name: 'Elevador A' },
  { id: '2', name: 'Elevador B' },
  { id: '3', name: 'Elevador C' },
  { id: '4', name: 'Scanner Eletrônico' },
  { id: '5', name: 'Equipamento Alinhamento' },
];

// Mock de clientes para o exemplo
const clients = [
  { id: '1', name: 'João Silva', phone: '(11) 98765-4321' },
  { id: '2', name: 'Maria Santos', phone: '(11) 91234-5678' },
  { id: '3', name: 'Pedro Oliveira', phone: '(11) 99876-5432' },
  { id: '4', name: 'Ana Sousa', phone: '(11) 94321-8765' },
  { id: '5', name: 'Roberto Alves', phone: '(11) 92345-6789' },
];

// Mock de veículos para o exemplo
const vehicles = [
  { id: '1', client_id: '1', brand: 'Honda', model: 'Civic', year: '2018', license_plate: 'ABC1234' },
  { id: '2', client_id: '2', brand: 'Toyota', model: 'Corolla', year: '2020', license_plate: 'DEF5678' },
  { id: '3', client_id: '3', brand: 'Fiat', model: 'Uno', year: '2015', license_plate: 'GHI9012' },
  { id: '4', client_id: '4', brand: 'Volkswagen', model: 'Gol', year: '2019', license_plate: 'JKL3456' },
  { id: '5', client_id: '5', brand: 'Chevrolet', model: 'Onix', year: '2021', license_plate: 'MNO7890' },
  { id: '6', client_id: '1', brand: 'Ford', model: 'Ka', year: '2017', license_plate: 'PQR1234' },
];

const CreateAppointmentDialog: React.FC<CreateAppointmentDialogProps> = ({
  selectedDate,
  isOpen,
  onClose,
  onCreated
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const initialDate = selectedDate || new Date();
  initialDate.setMinutes(0, 0, 0);
  
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    service_type: '',
    start_date: format(initialDate, 'yyyy-MM-dd'),
    start_time: format(initialDate, 'HH:mm'),
    end_date: format(initialDate, 'yyyy-MM-dd'),
    end_time: format(addHours(initialDate, 1), 'HH:mm'),
    mechanic_id: '',
    resources: [] as string[],
    notes: ''
  });
  
  const handleOpenChange = (open: boolean) => {
    if (onClose && !open) {
      onClose();
    } else {
      setInternalOpen(open);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'service_type') {
      // Atualizar o horário de fim com base na duração do serviço
      const selectedService = serviceTypes.find(type => type.id === value);
      if (selectedService) {
        const startDate = new Date(`${formData.start_date}T${formData.start_time}`);
        const endDate = addHours(startDate, selectedService.duration);
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          end_date: format(endDate, 'yyyy-MM-dd'),
          end_time: format(endDate, 'HH:mm')
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleResourceToggle = (resourceId: string) => {
    setFormData(prev => {
      if (prev.resources.includes(resourceId)) {
        return { ...prev, resources: prev.resources.filter(id => id !== resourceId) };
      } else {
        return { ...prev, resources: [...prev.resources, resourceId] };
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verificar campos obrigatórios
      if (!formData.client_id || !formData.vehicle_id || !formData.service_type || !formData.mechanic_id) {
        toast.add({
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha todos os campos obrigatórios.',
          variant: 'destructive'
        });
        return;
      }
      
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.add({
        title: 'Agendamento criado',
        description: 'O agendamento foi criado com sucesso!'
      });
      
      // Fechar o modal e atualizar a lista
      if (onClose) {
        onClose();
      } else {
        setInternalOpen(false);
      }
      
      if (onCreated) {
        onCreated();
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.add({
        title: 'Erro',
        description: 'Não foi possível criar o agendamento. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrar veículos com base no cliente selecionado
  const filteredVehicles = vehicles.filter(vehicle => 
    formData.client_id ? vehicle.client_id === formData.client_id : true
  );
  
  const dialogContent = (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Novo Agendamento</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        {/* Seção Cliente/Veículo */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Informações do Cliente</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => handleSelectChange('client_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Veículo</Label>
              <Select 
                value={formData.vehicle_id} 
                onValueChange={(value) => handleSelectChange('vehicle_id', value)}
                disabled={!formData.client_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.client_id ? "Selecione um veículo" : "Selecione um cliente primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Seção Serviço */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Detalhes do Serviço</h3>
          
          <div className="space-y-2">
            <Label htmlFor="service_type">Tipo de Serviço</Label>
            <Select 
              value={formData.service_type} 
              onValueChange={(value) => handleSelectChange('service_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.duration}h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input 
                type="date" 
                id="start_date" 
                name="start_date" 
                value={formData.start_date} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora de Início</Label>
              <Input 
                type="time" 
                id="start_time" 
                name="start_time" 
                value={formData.start_time} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Fim</Label>
              <Input 
                type="date" 
                id="end_date" 
                name="end_date" 
                value={formData.end_date} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_time">Hora de Fim</Label>
              <Input 
                type="time" 
                id="end_time" 
                name="end_time" 
                value={formData.end_time} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mechanic_id">Mecânico Responsável</Label>
            <Select 
              value={formData.mechanic_id} 
              onValueChange={(value) => handleSelectChange('mechanic_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mecânico" />
              </SelectTrigger>
              <SelectContent>
                {mechanics.map(mechanic => (
                  <SelectItem key={mechanic.id} value={mechanic.id}>
                    {mechanic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Recursos Necessários</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {resources.map(resource => (
                <label 
                  key={resource.id}
                  className={`flex items-center p-2 border rounded cursor-pointer ${
                    formData.resources.includes(resource.id) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={formData.resources.includes(resource.id)}
                    onChange={() => handleResourceToggle(resource.id)}
                  />
                  <span className="text-sm">{resource.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Informações adicionais sobre o serviço..." 
              value={formData.notes}
              onChange={handleInputChange}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Agendar Serviço'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
  
  // Se for usado como um componente independente com trigger
  if (isOpen === undefined) {
    return (
      <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Novo Agendamento
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }
  
  // Se for usado dentro de outro componente que controla a abertura
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
};

export default CreateAppointmentDialog;
