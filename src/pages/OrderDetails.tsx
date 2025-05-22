
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Order } from '@/types/order';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { useOrders } from '@/hooks/useOrders';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import ServicesList from '@/components/orders/ServicesList';
import PartsList from '@/components/orders/PartsList';
import PhotoGallery from '@/components/orders/PhotoGallery';
import OrderActions from '@/components/orders/OrderActions';
import OrderTimeline from '@/components/orders/OrderTimeline';
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

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateOrderStatus, deleteOrder } = useOrders();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Get order data from localStorage
  useEffect(() => {
    if (!id) {
      setError('ID de ordem inválido');
      setLoading(false);
      return;
    }
    
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
  }, [id]);
  
  // Handle edit order
  const handleEdit = () => {
    navigate(`/orders/edit/${id}`);
  };
  
  // Handle delete order
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };
  
  // Confirm delete order
  const confirmDelete = () => {
    if (!id) return;
    
    try {
      deleteOrder(id);
      navigate('/orders', { replace: true });
    } catch (err) {
      console.error('Erro ao excluir ordem:', err);
    }
  };
  
  // Handle status change
  const handleStatusChange = (newStatus: any) => {
    if (!id || !order) return;
    
    try {
      const updatedOrder = updateOrderStatus(id, newStatus);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };
  
  // Print order
  const handlePrint = () => {
    window.print();
  };
  
  // Export as PDF
  const handleExportPDF = () => {
    alert('Em um sistema real, esta funcionalidade exportaria a O.S. em PDF');
  };
  
  // Send to customer
  const handleSendToCustomer = () => {
    alert('Em um sistema real, esta funcionalidade enviaria a O.S. por email ao cliente');
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
          <p className="mt-4 text-gray-500">Carregando ordem de serviço...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a lista
        </Button>
        
        <Card className="border-red-200">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro</h2>
            <p className="text-gray-600">{error || 'Ordem de serviço não encontrada'}</p>
            <Button onClick={handleBack} className="mt-4">
              Voltar para a lista de ordens
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
            <ArrowLeft className="h-5 w-5 mr-2" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Ordem de Serviço #{order.number}
            </h1>
            <div className="text-sm text-gray-500">
              Criada em {formatDateTime(new Date(order.created_at))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <OrderStatusBadge status={order.status} className="text-sm h-7" />
          <OrderActions 
            order={order} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onPrint={handlePrint}
            onExportPDF={handleExportPDF}
            onSendToCustomer={handleSendToCustomer}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                    <div className="text-lg font-medium">{order.customer?.name || 'N/A'}</div>
                    {order.customer?.phone && <div className="text-gray-600">{order.customer.phone}</div>}
                    {order.customer?.email && <div className="text-gray-600">{order.customer.email}</div>}
                  </div>
                  
                  {order.technician && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Técnico Responsável</h3>
                      <div className="text-base">{order.technician}</div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Veículo</h3>
                    <div className="text-lg font-medium">{order.vehicle?.model || 'N/A'}</div>
                    <div className="text-gray-600">
                      {order.vehicle?.plate && <span>Placa: {order.vehicle.plate}</span>}
                      {order.vehicle?.year && <span className="ml-2">Ano: {order.vehicle.year}</span>}
                    </div>
                    {order.vehicle?.color && <div className="text-gray-600">Cor: {order.vehicle.color}</div>}
                  </div>
                  
                  {order.completedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Data de Conclusão</h3>
                      <div className="text-base">{formatDateTime(new Date(order.completedAt))}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Descrição do Problema</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {order.description || 'Nenhuma descrição fornecida'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Serviços</h3>
              <ServicesList 
                services={order.services || []} 
                onAddService={() => {}} 
                onRemoveService={() => {}} 
                onUpdateQuantity={() => {}} 
                readOnly={true} 
              />
            </CardContent>
          </Card>
          
          {order.parts && order.parts.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Peças</h3>
                <PartsList 
                  parts={order.parts} 
                  onAddPart={() => {}} 
                  onRemovePart={() => {}} 
                  onUpdateQuantity={() => {}} 
                  readOnly={true} 
                />
              </CardContent>
            </Card>
          )}
          
          {order.photos && order.photos.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Fotos</h3>
                <PhotoGallery photos={order.photos} />
              </CardContent>
            </Card>
          )}
          
          {(order.notes || order.recommendations) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Observações e Recomendações</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {order.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Observações Internas</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {order.notes}
                      </div>
                    </div>
                  )}
                  
                  {order.recommendations && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Recomendações ao Cliente</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {order.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Resumo Financeiro</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviços:</span>
                  <span>
                    {formatCurrency(
                      (order.services || []).reduce(
                        (sum, service) => sum + (service.price * service.quantity),
                        0
                      )
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Peças:</span>
                  <span>
                    {formatCurrency(
                      (order.parts || []).reduce(
                        (sum, part) => sum + (part.price * part.quantity),
                        0
                      )
                    )}
                  </span>
                </div>
                
                {order.laborCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mão de obra:</span>
                    <span>{formatCurrency(order.laborCost)}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-medium">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({order.discount}%):</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Imposto ({order.tax}%):</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onClick={handlePrint} className="w-full">
                  Imprimir Ordem de Serviço
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Histórico de Status</h3>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir a Ordem de Serviço #{order.number}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetails;
