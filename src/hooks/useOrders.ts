
import { useState } from 'react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus, Customer, Vehicle, OrderService, OrderPart, OrderPhoto } from '@/types/order';
import { useStorageData } from './useStorageData';
import { toast } from '@/components/ui/sonner';
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import { eventBus, EVENTS } from '@/core/events/EventBus';

// Type for order filter options
interface OrderFilters {
  status?: OrderStatus | 'all';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  customerId?: string;
  vehicleId?: string;
  searchTerm?: string;
  sortBy?: 'date' | 'number' | 'customer' | 'total';
  sortOrder?: 'asc' | 'desc';
}

// Type for pagination options
interface PaginationOptions {
  page: number;
  pageSize: number;
}

export const useOrders = () => {
  // Get all orders from storage
  const orders = useStorageData<Order>(orderService);

  // State for filters and pagination
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    dateRange: 'all',
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    pageSize: 10
  });

  // Filter and sort orders
  const getFilteredOrders = (): Order[] => {
    let filteredOrders = [...orders];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        
        if (filters.dateRange === 'today') {
          return orderDate >= today;
        } 
        else if (filters.dateRange === 'week') {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return orderDate >= weekStart;
        }
        else if (filters.dateRange === 'month') {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return orderDate >= monthStart;
        }
        
        return true;
      });
    }

    // Filter by customer
    if (filters.customerId) {
      filteredOrders = filteredOrders.filter(order => 
        order.customer && order.customer.id === filters.customerId
      );
    }

    // Filter by vehicle
    if (filters.vehicleId) {
      filteredOrders = filteredOrders.filter(order => 
        order.vehicle && order.vehicle.id === filters.vehicleId
      );
    }

    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(order => {
        const orderNumber = order.number.toString();
        const customerName = order.customer?.name?.toLowerCase() || '';
        const vehiclePlate = order.vehicle?.plate?.toLowerCase() || '';
        const vehicleModel = order.vehicle?.model?.toLowerCase() || '';
        
        return (
          orderNumber.includes(term) ||
          customerName.includes(term) ||
          vehiclePlate.includes(term) ||
          vehicleModel.includes(term)
        );
      });
    }

    // Sort orders
    if (filters.sortBy) {
      filteredOrders.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'date':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case 'number':
            comparison = a.number - b.number;
            break;
          case 'customer':
            comparison = (a.customer?.name || '').localeCompare(b.customer?.name || '');
            break;
          case 'total':
            comparison = a.total - b.total;
            break;
          default:
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filteredOrders;
  };

  // Get paginated orders
  const getPaginatedOrders = (): { orders: Order[], total: number } => {
    const filteredOrders = getFilteredOrders();
    const total = filteredOrders.length;
    
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const paginatedOrders = filteredOrders.slice(
      startIndex,
      startIndex + pagination.pageSize
    );
    
    return { orders: paginatedOrders, total };
  };

  // Create a new order
  const createOrder = (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'number'>): Order => {
    try {
      // Calculate order totals
      const totals = orderService.calculateOrderTotals(orderData);
      
      // Get next order number
      const orderNumber = orderService.getNextOrderNumber();
      
      // Create order with calculated fields
      const order = orderService.add({
        ...orderData,
        number: orderNumber,
        ...totals,
        statusHistory: [
          {
            status: orderData.status,
            timestamp: new Date().toISOString()
          }
        ]
      });

      // Publish event
      eventBus.publish(EVENTS.ORDER_CREATED, {
        orderId: order.id,
        order
      });
      
      toast.success(`Ordem de serviço #${orderNumber} criada com sucesso`);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar ordem de serviço');
      throw error;
    }
  };

  // Update an existing order
  const updateOrder = (id: string, orderData: Partial<Order>): Order => {
    try {
      const existingOrder = orderService.getById(id);
      
      if (!existingOrder) {
        throw new Error('Ordem de serviço não encontrada');
      }
      
      // If services, parts, labor cost, discount, or tax changed, recalculate totals
      let updatedTotals = {};
      
      if (
        orderData.services !== undefined || 
        orderData.parts !== undefined || 
        orderData.laborCost !== undefined || 
        orderData.discount !== undefined || 
        orderData.tax !== undefined
      ) {
        const calculationData = {
          services: orderData.services || existingOrder.services,
          parts: orderData.parts || existingOrder.parts,
          laborCost: orderData.laborCost !== undefined ? orderData.laborCost : existingOrder.laborCost,
          discount: orderData.discount !== undefined ? orderData.discount : existingOrder.discount,
          tax: orderData.tax !== undefined ? orderData.tax : existingOrder.tax
        };
        
        updatedTotals = orderService.calculateOrderTotals(calculationData);
      }
      
      // Add status history if status changed
      let statusHistoryUpdate = {};
      
      if (orderData.status && orderData.status !== existingOrder.status) {
        const statusHistory = existingOrder.statusHistory || [];
        statusHistoryUpdate = {
          statusHistory: [
            ...statusHistory,
            {
              status: orderData.status,
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        // If status changed to completed, add completion date
        if (orderData.status === 'completed' && existingOrder.status !== 'completed') {
          statusHistoryUpdate = {
            ...statusHistoryUpdate,
            completedAt: new Date().toISOString()
          };
        }
      }
      
      // Update order
      const updatedOrder = orderService.update(id, {
        ...orderData,
        ...updatedTotals,
        ...statusHistoryUpdate
      });
      
      // Publish event
      eventBus.publish(EVENTS.ORDER_UPDATED, {
        orderId: id,
        order: updatedOrder
      });
      
      toast.success(`Ordem de serviço #${updatedOrder.number} atualizada com sucesso`);
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar ordem de serviço');
      throw error;
    }
  };

  // Delete an order
  const deleteOrder = (id: string): boolean => {
    try {
      const order = orderService.getById(id);
      
      if (!order) {
        throw new Error('Ordem de serviço não encontrada');
      }
      
      const success = orderService.remove(id);
      
      if (success) {
        eventBus.publish(EVENTS.ORDER_DELETED, { orderId: id });
        toast.success(`Ordem de serviço #${order.number} excluída com sucesso`);
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir ordem de serviço');
      throw error;
    }
  };

  // Update order status
  const updateOrderStatus = (id: string, status: OrderStatus, notes?: string): Order | null => {
    try {
      const updatedOrder = orderService.updateStatus(id, status, notes);
      
      if (updatedOrder) {
        toast.success(`Status da ordem atualizado para ${getStatusLabel(status)}`);
      }
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status da ordem');
      return null;
    }
  };

  // Get status label
  const getStatusLabel = (status: OrderStatus): string => {
    const statusLabels: Record<OrderStatus, string> = {
      open: 'Em Aberto',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      canceled: 'Cancelada',
      waiting_parts: 'Aguardando Peças',
      waiting_approval: 'Aguardando Aprovação'
    };
    
    return statusLabels[status] || status;
  };

  // Get status color
  const getStatusColor = (status: OrderStatus): string => {
    const statusColors: Record<OrderStatus, string> = {
      open: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      completed: 'bg-green-500',
      canceled: 'bg-red-500',
      waiting_parts: 'bg-purple-500',
      waiting_approval: 'bg-yellow-500'
    };
    
    return statusColors[status] || 'bg-gray-500';
  };

  return {
    orders,
    filters,
    setFilters,
    pagination,
    setPagination,
    getFilteredOrders,
    getPaginatedOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getStatusLabel,
    getStatusColor
  };
};
