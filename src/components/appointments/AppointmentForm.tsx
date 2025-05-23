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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Appointment } from '@/types/appointment';
import { Lead } from '@/types/lead';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import CustomerSelect from "@/components/orders/CustomerSelect";
import VehicleSelect from "@/components/orders/VehicleSelect";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  onSubmit: (appointment: Partial<Appointment>) => void;
  onCancel: () => void;
  checkConflicts?: (appointment: Partial<Appointment>, excludeId?: string) => boolean;
  leads?: Lead[];
}

export function AppointmentForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  checkConflicts,
  leads = []
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<Partial<Appointment>>({
    service_type: '',
    service_description: '',
    start_time: '',
    end_time: '',
    mechanic_name: '',
    status: 'scheduled',
    notes: '',
    estimated_cost: 0
  });
  
  const [selectedLeadId, setSelectedLeadId] = useState<string>('none');
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [vehicleId, setVehicleId] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_time ? new Date(initialData.start_time) : undefined
  );
  
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_time ? new Date(initialData.end_time) : undefined
  );
  
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userOrganizationId, setUserOrganizationId] = useState<string | null>(null);

  // Buscar a organização do usuário
  useEffect(() => {
    const fetchUserOrganization = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberships, error } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar organização:', error);
          return;
        }

        setUserOrganizationId(memberships?.organization_id || null);
      } catch (err) {
        console.error('Erro ao buscar usuário ou organização:', err);
      }
    };

    fetchUserOrganization();
  }, []);

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
      
      if (initialData.client_id) {
        setClientId(initialData.client_id);
      }
      
      if (initialData.vehicle_id) {
        setVehicleId(initialData.vehicle_id);
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

  // Verificar se lead tem cliente ou veículo associado, caso contrário criar novos
  const processSelectedLead = async (lead: Lead) => {
    try {
      if (lead.client_id) {
        setClientId(lead.client_id);
        
        if (lead.vehicle) {
          setVehicleId(lead.vehicle.id);
        } else if (lead.vehicle_id) {
          setVehicleId(lead.vehicle_id);
        }
        
        return;
      }
      
      if (!userOrganizationId) {
        toast.error('Usuário não pertence a nenhuma organização');
        return;
      }
      
      // Criar um novo cliente baseado nos dados do lead
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([{
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          organization_id: userOrganizationId
        }])
        .select()
        .single();
      
      if (clientError) {
        console.error('Erro ao criar cliente a partir do lead:', clientError);
        toast.error('Erro ao criar cliente para o lead');
        return;
      }
      
      // Atualizar lead com o novo client_id
      const { error: updateLeadError } = await supabase
        .from('leads')
        .update({ client_id: client.id })
        .eq('id', lead.id);
      
      if (updateLeadError) {
        console.error('Erro ao atualizar lead com clientId:', updateLeadError);
      }
      
      // Setar o client_id para o formulário
      setClientId(client.id);
      
      // Se o lead tem veículo associado, usar os dados dele
      if (lead.vehicle) {
        setVehicleId(lead.vehicle.id);
      } else if (lead.vehicle_id) {
        setVehicleId(lead.vehicle_id);
      }
      
    } catch (error) {
      console.error('Erro ao processar lead:', error);
      toast.error('Erro ao processar informações do lead');
    }
  };

  // Preencher dados do formulário quando um lead for selecionado
  const handleLeadSelect = async (leadId: string) => {
    setSelectedLeadId(leadId);
    
    if (leadId === 'none') {
      setClientId(undefined);
      setVehicleId(undefined);
      setFormData(prev => ({
        ...prev,
        service_type: '',
        service_description: '',
        lead_id: undefined
      }));
      return;
    }
    
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*, client:client_id(*), vehicle:vehicle_id(*)')
        .eq('id', leadId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar lead:', error);
        toast.error('Erro ao buscar informações do lead');
        return;
      }
      
      // Processar o lead para criar cliente/veículo se necessário
      await processSelectedLead(lead as Lead);
      
      // Atualizar dados do formulário com informações do lead
      setFormData(prev => ({
        ...prev,
        service_type: lead.service_interest || prev.service_type,
        lead_id: lead.id
      }));
    } catch (err) {
      console.error('Erro ao processar seleção de lead:', err);
      toast.error('Erro ao processar lead selecionado');
    }
  };

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

  const handleClientChange = (value: string | undefined) => {
    setClientId(value);
    if (value) {
      setFormData(prev => ({
        ...prev,
        client_id: value
      }));
      
      // Limpar veículo se o cliente mudar
      setVehicleId(undefined);
      setFormData(prev => ({
        ...prev,
        vehicle_id: undefined
      }));
      
      if (errors.client_id) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.client_id;
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        client_id: undefined
      }));
    }
  };

  const handleVehicleChange = (value: string | undefined) => {
    setVehicleId(value);
    if (value) {
      setFormData(prev => ({
        ...prev,
        vehicle_id: value
      }));
      
      if (errors.vehicle_id) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.vehicle_id;
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        vehicle_id: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.client_id) {
      newErrors.client_id = 'Cliente é obrigatório';
    }
    
    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 'Veículo é obrigatório';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (formData.lead_id && formData.status === 'scheduled') {
        try {
          await supabase.from('leads')
            .update({ status: 'scheduled', status_changed_at: new Date().toISOString() })
            .eq('id', formData.lead_id);
        } catch (err) {
          console.error('Erro ao atualizar status do lead:', err);
        }
      }
      
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
      <Accordion type="single" collapsible className="w-full" defaultValue="cliente-veiculo">
        {/* Seção de Cliente e Veículo */}
        <AccordionItem value="cliente-veiculo">
          <AccordionTrigger className="text-lg font-medium">
            Cliente e Veículo
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Seleção de lead */}
              {leads && leads.length > 0 && (
                <div className="space-y-2 mb-4">
                  <Label>Selecionar Lead</Label>
                  <Select 
                    value={selectedLeadId} 
                    onValueChange={handleLeadSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um lead (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem lead</SelectItem>
                      {leads.map(lead => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name} - {lead.phone} - {lead.vehicle ? `${lead.vehicle.make} ${lead.vehicle.model}` : "Sem veículo"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="client" className={errors.client_id ? 'text-red-500' : ''}>
                  Cliente *
                </Label>
                <CustomerSelect 
                  value={clientId} 
                  onChange={handleClientChange}
                />
                {errors.client_id && <p className="text-xs text-red-500">{errors.client_id}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicle" className={errors.vehicle_id ? 'text-red-500' : ''}>
                  Veículo *
                </Label>
                <VehicleSelect 
                  clientId={clientId} 
                  value={vehicleId} 
                  onChange={handleVehicleChange}
                  disabled={!clientId}
                />
                {errors.vehicle_id && <p className="text-xs text-red-500">{errors.vehicle_id}</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Seção de Detalhes do Serviço */}
        <AccordionItem value="detalhes-servico">
          <AccordionTrigger className="text-lg font-medium">
            Detalhes do Serviço
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_type" className={errors.service_type ? 'text-red-500' : ''}>
                  Tipo de Serviço *
                </Label>
                <Select
                  value={formData.service_type || ''}
                  onValueChange={(value) => handleInputChange('service_type', value)}
                >
                  <SelectTrigger className={errors.service_type ? 'border-red-500' : ''}>
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
                <Label htmlFor="mechanic_name" className={errors.mechanic_name ? 'text-red-500' : ''}>
                  Mecânico *
                </Label>
                <Input
                  id="mechanic_name"
                  value={formData.mechanic_name || ''}
                  onChange={(e) => handleInputChange('mechanic_name', e.target.value)}
                  placeholder="Nome do mecânico"
                  className={errors.mechanic_name ? 'border-red-500' : ''}
                />
                {errors.mechanic_name && <p className="text-xs text-red-500">{errors.mechanic_name}</p>}
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || 'scheduled'}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
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
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Seção de Data e Hora */}
        <AccordionItem value="data-hora">
          <AccordionTrigger className="text-lg font-medium">
            Data e Hora
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className={errors.start_time ? 'text-red-500' : ''}>
                  Data de Início *
                </Label>
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
                <Label htmlFor="start_time" className={errors.start_time ? 'text-red-500' : ''}>
                  Hora de Início *
                </Label>
                <Select
                  value={startTime}
                  onValueChange={setStartTime}
                >
                  <SelectTrigger className={errors.start_time ? 'border-red-500' : ''}>
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
                <Label htmlFor="end_date" className={errors.end_time ? 'text-red-500' : ''}>
                  Data de Término *
                </Label>
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
                <Label htmlFor="end_time" className={errors.end_time ? 'text-red-500' : ''}>
                  Hora de Término *
                </Label>
                <Select
                  value={endTime}
                  onValueChange={setEndTime}
                >
                  <SelectTrigger className={errors.end_time ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Seção de Observações */}
        <AccordionItem value="observacoes">
          <AccordionTrigger className="text-lg font-medium">
            Observações
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
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
              <div className="mt-4">
                <p className="text-sm bg-red-100 text-red-800 p-2 rounded">{errors.time_conflict}</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-3 pt-4">
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
