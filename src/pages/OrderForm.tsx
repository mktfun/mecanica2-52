
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Order, OrderStatus, Customer, Vehicle } from '@/types/order';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'sonner';
import ClientVehicleSelect from '@/components/orders/ClientVehicleSelect';
import AppointmentSelect from '@/components/orders/AppointmentSelect';
import ServicesList from '@/components/orders/ServicesList';
import PartsList from '@/components/orders/PartsList';
import PhotoUpload from '@/components/orders/PhotoUpload';

const OrderForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { createOrder, updateOrder, getOrderById } = useOrders();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Order>>(() => ({
    // Use snake_case properties to match the Order type
    client_id: '',
    vehicle_id: '',
    description: '',
    services: [],
    parts: [],
    photos: [],
    labor_cost: 0,
    discount_percent: 0,
    tax_percent: 0,
    status: 'open' as OrderStatus,
    technician: '',
    notes: '',
    recommendations: ''
  }));

  useEffect(() => {
    if (isEdit && id) {
      const fetchOrder = async () => {
        setIsLoading(true);
        try {
          const order = await getOrderById(id);
          if (order) {
            setFormData(order);
          }
        } catch (error) {
          console.error('Erro ao carregar ordem de serviço:', error);
          toast.error('Erro ao carregar ordem de serviço');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchOrder();
    }
  }, [id, isEdit, getOrderById]);

  // Calculate totals based on services, parts, labor, discount, and tax
  const calculateTotals = () => {
    const servicesTotal = formData.services?.reduce((total, service) => total + (service.price * service.quantity), 0) || 0;
    const partsTotal = formData.parts?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
    const subtotal = servicesTotal + partsTotal + (formData.labor_cost || 0);
    
    const discountAmount = subtotal * ((formData.discount_percent || 0) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((formData.tax_percent || 0) / 100);
    const total = taxableAmount + taxAmount;
    
    return {
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toast.error('Selecione um cliente');
      return;
    }
    
    if (!formData.vehicle_id) {
      toast.error('Selecione um veículo');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const totals = calculateTotals();
      const orderData = {
        client_id: formData.client_id!,
        vehicle_id: formData.vehicle_id!,
        description: formData.description || '',
        services: formData.services || [],
        parts: formData.parts || [],
        photos: formData.photos || [],
        labor_cost: formData.labor_cost || 0,
        discount_percent: formData.discount_percent || 0,
        tax_percent: formData.tax_percent || 0,
        status: formData.status as OrderStatus,
        technician: formData.technician || '',
        notes: formData.notes || '',
        recommendations: formData.recommendations || '',
        appointment_id: formData.appointment_id,
        lead_id: formData.lead_id,
        ...totals
      };
      
      if (isEdit && id) {
        await updateOrder(id, orderData);
        toast.success('Ordem de serviço atualizada com sucesso');
      } else {
        await createOrder(orderData);
        toast.success('Ordem de serviço criada com sucesso');
      }
      
      navigate('/orders');
    } catch (error) {
      console.error('Erro ao salvar ordem de serviço:', error);
      toast.error('Erro ao salvar ordem de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotals();

  if (isLoading && isEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Cliente e Veículo */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente e Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClientVehicleSelect
              selectedClientId={formData.client_id || ''}
              selectedVehicleId={formData.vehicle_id || ''}
              onClientChange={(clientId) => setFormData({ ...formData, client_id: clientId })}
              onVehicleChange={(vehicleId) => setFormData({ ...formData, vehicle_id: vehicleId })}
            />
          </CardContent>
        </Card>

        {/* Vinculação com Agendamento */}
        <Card>
          <CardHeader>
            <CardTitle>Vinculação (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentSelect
              selectedAppointmentId={formData.appointment_id || ''}
              onAppointmentChange={(appointmentId) => setFormData({ ...formData, appointment_id: appointmentId })}
            />
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Ordem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Em Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="waiting_parts">Aguardando Peças</SelectItem>
                    <SelectItem value="waiting_approval">Aguardando Aprovação</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="technician">Técnico Responsável</Label>
                <Input
                  id="technician"
                  value={formData.technician || ''}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  placeholder="Nome do técnico"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descrição do Problema</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o problema ou serviço solicitado"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Serviços */}
        <ServicesList
          services={formData.services || []}
          onServicesChange={(services) => setFormData({ ...formData, services })}
          isEditing={true}
        />

        {/* Peças */}
        <PartsList
          parts={formData.parts || []}
          onPartsChange={(parts) => setFormData({ ...formData, parts })}
          isEditing={true}
        />

        {/* Valores */}
        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="labor_cost">Mão de Obra (R$)</Label>
                <Input
                  id="labor_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.labor_cost || 0}
                  onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="discount_percent">Desconto (%)</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percent || 0}
                  onChange={(e) => setFormData({ ...formData, discount_percent: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="tax_percent">Impostos (%)</Label>
                <Input
                  id="tax_percent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax_percent || 0}
                  onChange={(e) => setFormData({ ...formData, tax_percent: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Resumo dos Totais */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{totals.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Desconto:</span>
                <span>-{totals.discount_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Impostos:</span>
                <span>{totals.tax_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{totals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações internas sobre a ordem"
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.recommendations || ''}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Recomendações para o cliente"
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Fotos */}
        <PhotoUpload
          photos={formData.photos || []}
          onPhotosChange={(photos) => setFormData({ ...formData, photos })}
        />

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Ordem
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
