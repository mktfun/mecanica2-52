
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import CustomerSelect from '@/components/orders/CustomerSelect';
import VehicleSelect from '@/components/orders/VehicleSelect';
import ServicesList from '@/components/orders/ServicesList';
import PartsList from '@/components/orders/PartsList';
import AppointmentSelect from '@/components/orders/AppointmentSelect';
import PhotoUpload from '@/components/orders/PhotoUpload';
import { 
  Order, 
  OrderStatus, 
  Customer, 
  Vehicle, 
  OrderService, 
  OrderPart, 
  OrderPhoto 
} from '@/types/order';
import { Appointment } from '@/types/appointment';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/formatters';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const OrderForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const { createOrder, updateOrder } = useOrders();
  
  // State for order data
  const [order, setOrder] = useState<Partial<Order>>({
    customer: null as any,
    vehicle: null as any,
    description: '',
    services: [],
    parts: [],
    laborCost: 0,
    discount: 0,
    tax: 0,
    status: 'open',
    photos: [],
    notes: '',
    recommendations: ''
  });
  
  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    servicesTotal: 0,
    partsTotal: 0,
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0
  });
  
  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Load existing order data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      try {
        const orderData = localStorage.getItem('mecanicapro_orders');
        if (orderData) {
          const orders = JSON.parse(orderData);
          const foundOrder = orders.find((o: Order) => o.id === id);
          
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Ordem de serviço não encontrada');
          }
        } else {
          setError('Nenhuma ordem de serviço cadastrada');
        }
      } catch (err) {
        console.error('Erro ao carregar ordem de serviço:', err);
        setError('Erro ao carregar ordem de serviço');
      } finally {
        setLoading(false);
      }
    }
  }, [id, isEditMode]);
  
  // Calculate totals whenever relevant values change
  useEffect(() => {
    calculateTotals();
  }, [order.services, order.parts, order.laborCost, order.discount, order.tax]);
  
  // Calculate order totals
  const calculateTotals = () => {
    // Services total
    const servicesTotal = (order.services || []).reduce(
      (sum, service) => sum + (service.price * service.quantity),
      0
    );
    
    // Parts total
    const partsTotal = (order.parts || []).reduce(
      (sum, part) => sum + (part.price * part.quantity),
      0
    );
    
    // Subtotal
    const laborCost = Number(order.laborCost) || 0;
    const subtotal = servicesTotal + partsTotal + laborCost;
    
    // Discount
    const discountPercent = Number(order.discount) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    
    // Tax
    const taxPercent = Number(order.tax) || 0;
    const taxAmount = ((subtotal - discountAmount) * taxPercent) / 100;
    
    // Total
    const total = subtotal - discountAmount + taxAmount;
    
    setCalculatedValues({
      servicesTotal,
      partsTotal,
      subtotal,
      discountAmount,
      taxAmount,
      total
    });
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrder(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle number input changes
  const handleNumberChange = (name: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setOrder(prev => ({ ...prev, [name]: numValue }));
  };
  
  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    // If the customer changes, reset the vehicle
    if (order.customer?.id !== customer.id) {
      setOrder(prev => ({ 
        ...prev, 
        customer,
        vehicle: null
      }));
    } else {
      setOrder(prev => ({ ...prev, customer }));
    }
  };
  
  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setOrder(prev => ({ ...prev, vehicle }));
  };
  
  // Handle service actions
  const handleAddService = (service: OrderService) => {
    setOrder(prev => ({ 
      ...prev, 
      services: [...(prev.services || []), service]
    }));
  };
  
  const handleRemoveService = (index: number) => {
    setOrder(prev => ({
      ...prev,
      services: (prev.services || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleUpdateServiceQuantity = (index: number, quantity: number) => {
    setOrder(prev => {
      const services = [...(prev.services || [])];
      services[index] = { ...services[index], quantity };
      return { ...prev, services };
    });
  };
  
  // Handle part actions
  const handleAddPart = (part: OrderPart) => {
    setOrder(prev => ({ 
      ...prev, 
      parts: [...(prev.parts || []), part]
    }));
  };
  
  const handleRemovePart = (index: number) => {
    setOrder(prev => ({
      ...prev,
      parts: (prev.parts || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleUpdatePartQuantity = (index: number, quantity: number) => {
    setOrder(prev => {
      const parts = [...(prev.parts || [])];
      parts[index] = { ...parts[index], quantity };
      return { ...prev, parts };
    });
  };
  
  // Handle photo actions
  const handleAddPhoto = (photo: OrderPhoto) => {
    setOrder(prev => ({ 
      ...prev, 
      photos: [...(prev.photos || []), photo]
    }));
  };
  
  const handleRemovePhoto = (index: number) => {
    setOrder(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };
  
  // Handle appointment selection
  const handleAppointmentSelect = (appointment: Appointment | null) => {
    if (!appointment) return;
    
    setOrder(prev => ({
      ...prev,
      customer: appointment.customer || null as any,
      vehicle: appointment.vehicle || null as any,
      description: appointment.description || prev.description || '',
      appointmentId: appointment.id
    }));
  };
  
  // Handle save
  const handleSave = async () => {
    // Validate required fields
    if (!order.customer) {
      setError('É necessário selecionar um cliente');
      return;
    }
    
    if (!order.vehicle) {
      setError('É necessário selecionar um veículo');
      return;
    }
    
    // Clear error
    setError(null);
    setSaving(true);
    
    try {
      // Create or update order
      if (isEditMode && id) {
        updateOrder(id, { 
          ...order,
          status: order.status as OrderStatus,
        });
        navigate(`/orders/${id}`);
      } else {
        const newOrder = createOrder({
          customer: order.customer as Customer,
          vehicle: order.vehicle as Vehicle,
          description: order.description || '',
          services: order.services || [],
          parts: order.parts || [],
          laborCost: Number(order.laborCost) || 0,
          discount: Number(order.discount) || 0,
          tax: Number(order.tax) || 0,
          status: order.status as OrderStatus,
          photos: order.photos || [],
          notes: order.notes || '',
          recommendations: order.recommendations || '',
          appointmentId: order.appointmentId
        });
        navigate(`/orders/${newOrder.id}`);
      }
    } catch (err) {
      console.error('Erro ao salvar ordem:', err);
      setError('Erro ao salvar ordem de serviço');
      setSaving(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Check if there are changes to confirm
    if (
      order.customer || 
      order.vehicle || 
      order.description || 
      (order.services && order.services.length > 0) || 
      (order.parts && order.parts.length > 0)
    ) {
      setShowCancelDialog(true);
    } else {
      navigate('/orders');
    }
  };
  
  // Confirm cancel
  const confirmCancel = () => {
    navigate('/orders');
  };
  
  // Go back to orders list
  const handleBack = () => {
    navigate('/orders');
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
            <ArrowLeft className="h-5 w-5 mr-2" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </h1>
        </div>
        
        {isEditMode && order.number && (
          <div className="text-lg font-medium">
            Ordem #{order.number}
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-medium">Informações Básicas</h2>
              
              {!isEditMode && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Carregar de Agendamento</h3>
                  <AppointmentSelect onSelect={handleAppointmentSelect} />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Cliente</label>
                  <CustomerSelect 
                    selectedCustomer={order.customer} 
                    onSelect={handleCustomerSelect} 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">Veículo</label>
                  <VehicleSelect 
                    selectedVehicle={order.vehicle} 
                    customerId={order.customer?.id} 
                    onSelect={handleVehicleSelect} 
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="text-sm font-medium block mb-2">
                  Descrição do Problema
                </label>
                <Textarea 
                  id="description"
                  name="description"
                  value={order.description || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Descreva o problema relatado pelo cliente"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="technician" className="text-sm font-medium block mb-2">
                    Técnico Responsável
                  </label>
                  <Input 
                    id="technician"
                    name="technician"
                    value={order.technician || ''}
                    onChange={handleChange}
                    placeholder="Nome do técnico responsável"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="text-sm font-medium block mb-2">
                    Status
                  </label>
                  <Select 
                    value={order.status} 
                    onValueChange={(value) => setOrder({ ...order, status: value as OrderStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Em Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="waiting_parts">Aguardando Peças</SelectItem>
                      <SelectItem value="waiting_approval">Aguardando Aprovação</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="canceled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-medium">Serviços</h2>
              
              <ServicesList 
                services={order.services || []} 
                onAddService={handleAddService} 
                onRemoveService={handleRemoveService} 
                onUpdateQuantity={handleUpdateServiceQuantity} 
              />
              
              <div>
                <label htmlFor="laborCost" className="text-sm font-medium block mb-2">
                  Custo de Mão de Obra
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                  <Input 
                    id="laborCost"
                    type="number"
                    value={order.laborCost?.toString() || '0'}
                    onChange={(e) => handleNumberChange('laborCost', e.target.value)}
                    className="pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-medium">Peças</h2>
              
              <PartsList 
                parts={order.parts || []} 
                onAddPart={handleAddPart} 
                onRemovePart={handleRemovePart} 
                onUpdateQuantity={handleUpdatePartQuantity} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-medium">Fotos</h2>
              
              <PhotoUpload 
                photos={order.photos || []} 
                onAddPhoto={handleAddPhoto} 
                onRemovePhoto={handleRemovePhoto} 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-medium">Observações e Recomendações</h2>
              
              <div>
                <label htmlFor="notes" className="text-sm font-medium block mb-2">
                  Observações Internas
                </label>
                <Textarea 
                  id="notes"
                  name="notes"
                  value={order.notes || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observações internas sobre o serviço"
                />
              </div>
              
              <div>
                <label htmlFor="recommendations" className="text-sm font-medium block mb-2">
                  Recomendações ao Cliente
                </label>
                <Textarea 
                  id="recommendations"
                  name="recommendations"
                  value={order.recommendations || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Recomendações para o cliente"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="lg:sticky lg:top-6 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-medium">Resumo Financeiro</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Serviços:</span>
                    <span>{formatCurrency(calculatedValues.servicesTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Peças:</span>
                    <span>{formatCurrency(calculatedValues.partsTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mão de obra:</span>
                    <span>{formatCurrency(Number(order.laborCost) || 0)}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculatedValues.subtotal)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="discount" className="text-sm font-medium block mb-1">
                        Desconto (%)
                      </label>
                      <Input 
                        id="discount"
                        type="number"
                        value={order.discount?.toString() || '0'}
                        onChange={(e) => handleNumberChange('discount', e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tax" className="text-sm font-medium block mb-1">
                        Imposto (%)
                      </label>
                      <Input 
                        id="tax"
                        type="number"
                        value={order.tax?.toString() || '0'}
                        onChange={(e) => handleNumberChange('tax', e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  {(calculatedValues.discountAmount > 0 || calculatedValues.taxAmount > 0) && (
                    <>
                      {calculatedValues.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Desconto:</span>
                          <span>-{formatCurrency(calculatedValues.discountAmount)}</span>
                        </div>
                      )}
                      
                      {calculatedValues.taxAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Imposto:</span>
                          <span>{formatCurrency(calculatedValues.taxAmount)}</span>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                    </>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(calculatedValues.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="h-12"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>{isEditMode ? 'Salvando...' : 'Criando...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    <span>{isEditMode ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}</span>
                  </div>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                disabled={saving}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar {isEditMode ? 'Edição' : 'Criação'}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar? Todas as alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderForm;
