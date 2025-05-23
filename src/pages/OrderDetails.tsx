
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Save, X, Calendar, User, Car, Wrench, FileText, DollarSign } from 'lucide-react';
import { Order } from '@/types/order';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import ServicesList from '@/components/orders/ServicesList';
import PartsList from '@/components/orders/PartsList';
import PhotoGallery from '@/components/orders/PhotoGallery';
import OrderTimeline from '@/components/orders/OrderTimeline';
import OrderActions from '@/components/orders/OrderActions';
import { toast } from 'sonner';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { getOrderById, updateOrder } = useOrders();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (error) {
        console.error('Erro ao carregar ordem de serviço:', error);
        toast.error('Erro ao carregar ordem de serviço');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, getOrderById]);

  const handleSave = async () => {
    if (!order) return;
    
    try {
      await updateOrder(order.id, order);
      setIsEditing(false);
      toast.success('Ordem de serviço atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar ordem de serviço:', error);
      toast.error('Erro ao atualizar ordem de serviço');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Ordem de Serviço não encontrada</h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">A ordem de serviço solicitada não foi encontrada.</p>
            <Button className="mt-4" onClick={() => navigate('/orders')}>
              Voltar para Ordens de Serviço
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">OS #{order.number}</h1>
            <p className="text-gray-500">
              Criada em {formatDateTime(new Date(order.created_at))}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{order.client?.name || 'Cliente não especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p>{order.client?.phone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{order.client?.email || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Veículo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Veículo</p>
                <p className="font-medium">
                  {order.vehicle 
                    ? `${order.vehicle.make} ${order.vehicle.model} ${order.vehicle.year || ''}` 
                    : 'Veículo não especificado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Placa</p>
                <p>{order.vehicle?.plate || 'Não informada'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cor</p>
                <p>{order.vehicle?.color || 'Não informada'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status e Datas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Status e Datas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <OrderStatusBadge status={order.status} />
              </div>
              {order.completed_at && (
                <div>
                  <p className="text-sm text-gray-500">Concluída em</p>
                  <p>{formatDateTime(new Date(order.completed_at))}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Técnico</p>
                <p>{order.technician || 'Não atribuído'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mão de obra</p>
              <p className="text-lg font-semibold">{formatCurrency(order.labor_cost || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-lg font-semibold">{formatCurrency(order.subtotal || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Desconto ({order.discount_percent || 0}%)</p>
              <p className="text-lg font-semibold text-red-600">-{formatCurrency(order.discount_amount || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Impostos ({order.tax_percent || 0}%)</p>
              <p className="text-lg font-semibold">{formatCurrency(order.tax_amount || 0)}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold">Total</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(order.total || 0)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Serviços */}
      <ServicesList
        services={order.services}
        onServicesChange={(services) => setOrder({ ...order, services })}
        isEditing={isEditing}
      />

      {/* Peças */}
      <PartsList
        parts={order.parts}
        onPartsChange={(parts) => setOrder({ ...order, parts })}
        isEditing={isEditing}
      />

      {/* Fotos */}
      <PhotoGallery
        photos={order.photos}
        onPhotosChange={(photos) => setOrder({ ...order, photos })}
        isEditing={isEditing}
      />

      {/* Observações e Recomendações */}
      {(order.notes || order.recommendations) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {order.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{order.recommendations}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Ações da Ordem */}
      <OrderActions order={order} onOrderUpdate={(updatedOrder) => setOrder(updatedOrder)} />
    </div>
  );
};

export default OrderDetails;
