
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  onSubmit: (appointment: Partial<Appointment>) => void;
  onCancel: () => void;
  checkConflicts?: (appointment: Partial<Appointment>, excludeId?: string) => boolean;
}

export function AppointmentForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  checkConflicts
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<Partial<Appointment>>({
    client_name: '',
    phone: '',
    email: '',
    vehicle_info: '',
    service_type: '',
    service_description: '',
    start_time: '',
    end_time: '',
    mechanic_name: '',
    status: 'scheduled' as AppointmentStatus,
    notes: '',
    estimated_cost: 0
  });
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_time ? new Date(initialData.start_time) : undefined
  );
  
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_time ? new Date(initialData.end_time) : undefined
  );
  
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar dados do formulário com os dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
      
      if (initialData.start_time) {
        const start = new Date(initialData.start_time);
        setStartDate(start);
        setStartTime(format(start, 'HH:mm'));
      }
      
      if (initialData.end_time) {
        const end = new Date(initialData.end_time);
        setEndDate(end);
        setEndTime(format(end, 'HH:mm'));
      }
    }
  }, [initialData]);

  // Atualizar horários de início e fim quando as datas ou horários mudarem
  useEffect(() => {
    if (startDate && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const newDate = new Date(startDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      setFormData(prev => ({
        ...prev,
        start_time: newDate.toISOString()
      }));
    }
    
    if (endDate && endTime) {
      const [hours, minutes] = endTime.split(':').map(Number);
      const newDate = new Date(endDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      setFormData(prev => ({
        ...prev,
        end_time: newDate.toISOString()
      }));
    }
  }, [startDate, startTime, endDate, endTime]);

  // Atualizar a data final quando a data inicial mudar
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const handleInputChange = (field: keyof Appointment, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro quando o campo for preenchido
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.client_name?.trim()) {
      newErrors.client_name = 'Nome do cliente é obrigatório';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    if (!formData.vehicle_info?.trim()) {
      newErrors.vehicle_info = 'Informações do veículo são obrigatórias';
    }
    
    if (!formData.service_type?.trim()) {
      newErrors.service_type = 'Tipo de serviço é obrigatório';
    }
    
    if (!formData.mechanic_name?.trim()) {
      newErrors.mechanic_name = 'Nome do mecânico é obrigatório';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Data e hora de início são obrigatórias';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'Data e hora de término são obrigatórias';
    }
    
    // Verificar se a data de término é posterior à data de início
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      
      if (end <= start) {
        newErrors.end_time = 'A data/hora de término deve ser posterior à de início';
      }
    }
    
    // Verificar conflitos de horário
    if (formData.start_time && formData.end_time && formData.mechanic_name && checkConflicts) {
      if (checkConflicts(formData, initialData?.id)) {
        newErrors.time_conflict = 'Há um conflito com outro agendamento para este mecânico';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Gerar opções de horário (de 30 em 30 minutos)
  const timeOptions = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_name">Nome do Cliente</Label>
          <Input
            id="client_name"
            value={formData.client_name || ''}
            onChange={(e) => handleInputChange('client_name', e.target.value)}
            placeholder="Nome do cliente"
            className={errors.client_name ? 'border-red-500' : ''}
          />
          {errors.client_name && <p className="text-xs text-red-500">{errors.client_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(00) 00000-0000"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle_info">Veículo</Label>
          <Input
            id="vehicle_info"
            value={formData.vehicle_info || ''}
            onChange={(e) => handleInputChange('vehicle_info', e.target.value)}
            placeholder="Marca, modelo e ano"
            className={errors.vehicle_info ? 'border-red-500' : ''}
          />
          {errors.vehicle_info && <p className="text-xs text-red-500">{errors.vehicle_info}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="service_type">Tipo de Serviço</Label>
          <Select
            value={formData.service_type || ''}
            onValueChange={(value) => handleInputChange('service_type', value)}
          >
            <SelectTrigger id="service_type" className={errors.service_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione o tipo de serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="troca_oleo">Troca de Óleo</SelectItem>
              <SelectItem value="revisao">Revisão</SelectItem>
              <SelectItem value="alinhamento">Alinhamento</SelectItem>
              <SelectItem value="balanceamento">Balanceamento</SelectItem>
              <SelectItem value="freios">Freios</SelectItem>
              <SelectItem value="motor">Motor</SelectItem>
              <SelectItem value="eletrica">Elétrica</SelectItem>
              <SelectItem value="suspensao">Suspensão</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          {errors.service_type && <p className="text-xs text-red-500">{errors.service_type}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mechanic_name">Mecânico</Label>
          <Input
            id="mechanic_name"
            value={formData.mechanic_name || ''}
            onChange={(e) => handleInputChange('mechanic_name', e.target.value)}
            placeholder="Nome do mecânico"
            className={errors.mechanic_name ? 'border-red-500' : ''}
          />
          {errors.mechanic_name && <p className="text-xs text-red-500">{errors.mechanic_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Data de Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                  errors.start_time && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  if (date && (!endDate || endDate < date)) {
                    setEndDate(date);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Hora de Início</Label>
          <Select
            value={startTime}
            onValueChange={setStartTime}
          >
            <SelectTrigger id="start_time" className={errors.start_time ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione um horário" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Data de Término</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                  errors.end_time && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => (startDate ? date < startDate : false)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.end_time && <p className="text-xs text-red-500">{errors.end_time}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">Hora de Término</Label>
          <Select
            value={endTime}
            onValueChange={setEndTime}
          >
            <SelectTrigger id="end_time" className={errors.end_time ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione um horário" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || 'scheduled'}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="in-progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_cost">Valor Estimado</Label>
          <Input
            id="estimated_cost"
            type="number"
            value={formData.estimated_cost || ''}
            onChange={(e) => handleInputChange('estimated_cost', parseFloat(e.target.value))}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="service_description">Descrição do Serviço</Label>
          <Textarea
            id="service_description"
            value={formData.service_description || ''}
            onChange={(e) => handleInputChange('service_description', e.target.value)}
            placeholder="Detalhes sobre o serviço a ser realizado"
            rows={2}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Observações adicionais"
            rows={3}
          />
        </div>

        {errors.time_conflict && (
          <div className="md:col-span-2">
            <p className="text-sm bg-red-100 text-red-800 p-2 rounded">{errors.time_conflict}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData?.id ? "Atualizar Agendamento" : "Criar Agendamento"}
        </Button>
      </div>
    </form>
  );
}
