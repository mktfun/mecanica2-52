
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrderService {
  id: string;
  service_order_id: string;
  service_id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  completed: boolean;
  created_at: string;
}

export interface OrderPart {
  id: string;
  service_order_id: string;
  part_id?: string;
  name: string;
  code?: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface OrderPhoto {
  id: string;
  service_order_id: string;
  url: string;
  description?: string;
  created_at: string;
}

export interface Order {
  id: string;
  number: number;
  organization_id: string;
  client_id: string;
  vehicle_id: string;
  appointment_id?: string;
  lead_id?: string;
  status: OrderStatus;
  description?: string;
  technician?: string;
  labor_cost: number;
  discount_percent: number;
  tax_percent: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  notes?: string;
  recommendations?: string;
  estimated_completion_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos expandidos
  client?: any;
  vehicle?: any;
  appointment?: any;
  lead?: any;
  
  // Arrays de serviços, peças e fotos
  services: OrderService[];
  parts: OrderPart[];
  photos: OrderPhoto[];
}

export type OrderStatus = 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled';

// Type for order filter options
export interface OrderFilters {
  status: OrderStatus | 'all';
  dateRange: 'today' | 'week' | 'month' | 'all';
  customerId?: string;
  vehicleId?: string;
  searchTerm: string;
  sortBy: 'date' | 'number' | 'customer' | 'total';
  sortOrder: 'asc' | 'desc';
}

// Type for pagination options
interface PaginationOptions {
  page: number;
  pageSize: number;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOrganizationId, setUserOrganizationId] = useState<string | null>(null);

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

  // Função para buscar a organização do usuário atual
  const fetchUserOrganization = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        if (membershipError.code !== 'PGRST116') { // PGRST116 é o código para "no rows found"
          console.error('Erro ao buscar organização do usuário:', membershipError);
        }
        return null;
      }

      return memberships?.organization_id || null;
    } catch (err) {
      console.error('Erro ao buscar usuário ou organização:', err);
      return null;
    }
  }, []);

  // Carregar ordens de serviço
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Verificar se temos uma organização
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      setIsLoading(false);
      setError('Usuário não pertence a nenhuma organização');
      return;
    }
    
    try {
      // Buscar ordens de serviço
      const { data: ordersData, error: ordersError } = await supabase
        .from('service_orders')
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          appointment:appointment_id(*),
          lead:lead_id(*)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Para cada ordem, buscar serviços, peças e fotos
      const ordersWithDetails = await Promise.all(ordersData.map(async (order) => {
        // Buscar serviços
        const { data: services, error: servicesError } = await supabase
          .from('service_order_services')
          .select('*')
          .eq('service_order_id', order.id);
        
        if (servicesError) throw servicesError;
        
        // Buscar peças
        const { data: parts, error: partsError } = await supabase
          .from('service_order_parts')
          .select('*')
          .eq('service_order_id', order.id);
        
        if (partsError) throw partsError;
        
        // Buscar fotos
        const { data: photos, error: photosError } = await supabase
          .from('service_order_photos')
          .select('*')
          .eq('service_order_id', order.id);
        
        if (photosError) throw photosError;
        
        // Montar a ordem completa
        return {
          ...order,
          services: services || [],
          parts: parts || [],
          photos: photos || []
        };
      }));
      
      setOrders(ordersWithDetails);
    } catch (err: any) {
      console.error('Erro ao buscar ordens de serviço:', err);
      setError(err.message || 'Erro ao carregar ordens de serviço');
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  }, [userOrganizationId, fetchUserOrganization]);

  // Filtrar ordens de serviço
  const getFilteredOrders = useCallback((): Order[] => {
    let filteredOrders = [...orders];

    // Filtro por status
    if (filters.status && filters.status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }

    // Filtro por período
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

    // Filtro por cliente
    if (filters.customerId) {
      filteredOrders = filteredOrders.filter(order => 
        order.client_id === filters.customerId
      );
    }

    // Filtro por veículo
    if (filters.vehicleId) {
      filteredOrders = filteredOrders.filter(order => 
        order.vehicle_id === filters.vehicleId
      );
    }

    // Filtro por termo de busca
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(order => {
        const orderNumber = order.number.toString();
        const customerName = order.client?.name?.toLowerCase() || '';
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

    // Ordenação
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
            comparison = (a.client?.name || '').localeCompare(b.client?.name || '');
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
  }, [orders, filters]);

  // Paginação
  const getPaginatedOrders = useCallback((): { orders: Order[], total: number } => {
    const filteredOrders = getFilteredOrders();
    const total = filteredOrders.length;
    
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const paginatedOrders = filteredOrders.slice(
      startIndex,
      startIndex + pagination.pageSize
    );
    
    return { orders: paginatedOrders, total };
  }, [getFilteredOrders, pagination]);

  // Calcular totais da ordem
  const calculateOrderTotals = (data: { 
    services?: OrderService[], 
    parts?: OrderPart[], 
    labor_cost?: number, 
    discount_percent?: number, 
    tax_percent?: number 
  }) => {
    // Calcular subtotal dos serviços
    const servicesTotal = (data.services || []).reduce(
      (sum, service) => sum + (service.price * service.quantity), 
      0
    );
    
    // Calcular subtotal das peças
    const partsTotal = (data.parts || []).reduce(
      (sum, part) => sum + (part.price * part.quantity), 
      0
    );
    
    // Calcular subtotal (serviços + peças + mão de obra)
    const laborCost = data.labor_cost || 0;
    const subtotal = servicesTotal + partsTotal + laborCost;
    
    // Aplicar desconto
    const discountPercent = data.discount_percent || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    
    // Aplicar imposto
    const taxPercent = data.tax_percent || 0;
    const taxAmount = ((subtotal - discountAmount) * taxPercent) / 100;
    
    // Calcular total
    const total = subtotal - discountAmount + taxAmount;
    
    return {
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total
    };
  };

  // Obter próximo número de ordem
  const getNextOrderNumber = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('number')
        .order('number', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      return data.length > 0 ? data[0].number + 1 : 1;
    } catch (err) {
      console.error('Erro ao buscar próximo número de ordem:', err);
      return 1; // Fallback para 1 se não conseguir obter o próximo número
    }
  };

  // Criar uma nova ordem
  const createOrder = async (orderData: {
    client_id: string;
    vehicle_id: string;
    appointment_id?: string;
    lead_id?: string;
    description?: string;
    technician?: string;
    labor_cost?: number;
    discount_percent?: number;
    tax_percent?: number;
    notes?: string;
    recommendations?: string;
    estimated_completion_date?: string;
    status?: OrderStatus;
    services?: OrderService[];
    parts?: OrderPart[];
  }): Promise<Order | null> => {
    try {
      // Verificar se temos uma organização
      const orgId = userOrganizationId || await fetchUserOrganization();
      
      if (!orgId) {
        toast.error('Usuário não pertence a nenhuma organização');
        throw new Error('Usuário não pertence a nenhuma organização');
      }
      
      // Calcular totais
      const totals = calculateOrderTotals({
        services: orderData.services,
        parts: orderData.parts,
        labor_cost: orderData.labor_cost,
        discount_percent: orderData.discount_percent,
        tax_percent: orderData.tax_percent
      });
      
      // Obter próximo número de ordem
      const orderNumber = await getNextOrderNumber();
      
      // Criar a ordem
      const { data: order, error: orderError } = await supabase
        .from('service_orders')
        .insert([{
          number: orderNumber,
          organization_id: orgId,
          client_id: orderData.client_id,
          vehicle_id: orderData.vehicle_id,
          appointment_id: orderData.appointment_id,
          lead_id: orderData.lead_id,
          description: orderData.description,
          technician: orderData.technician,
          labor_cost: orderData.labor_cost || 0,
          discount_percent: orderData.discount_percent || 0,
          tax_percent: orderData.tax_percent || 0,
          subtotal: totals.subtotal,
          discount_amount: totals.discount_amount,
          tax_amount: totals.tax_amount,
          total: totals.total,
          notes: orderData.notes,
          recommendations: orderData.recommendations,
          estimated_completion_date: orderData.estimated_completion_date,
          status: orderData.status || 'open'
        }])
        .select('*')
        .single();
      
      if (orderError) throw orderError;
      
      // Inserir serviços
      if (orderData.services && orderData.services.length > 0) {
        const servicesWithOrderId = orderData.services.map(service => ({
          service_order_id: order.id,
          name: service.name,
          description: service.description,
          price: service.price,
          quantity: service.quantity,
          completed: service.completed || false,
          service_id: service.service_id
        }));
        
        const { error: servicesError } = await supabase
          .from('service_order_services')
          .insert(servicesWithOrderId);
        
        if (servicesError) throw servicesError;
      }
      
      // Inserir peças
      if (orderData.parts && orderData.parts.length > 0) {
        const partsWithOrderId = orderData.parts.map(part => ({
          service_order_id: order.id,
          name: part.name,
          code: part.code,
          price: part.price,
          quantity: part.quantity,
          part_id: part.part_id
        }));
        
        const { error: partsError } = await supabase
          .from('service_order_parts')
          .insert(partsWithOrderId);
        
        if (partsError) throw partsError;
      }
      
      // Se a ordem está sendo criada a partir de um agendamento, atualizar status do agendamento
      if (orderData.appointment_id) {
        await supabase
          .from('appointments')
          .update({ status: 'in-progress' })
          .eq('id', orderData.appointment_id);
      }
      
      // Se a ordem está sendo criada a partir de um lead ou de um agendamento que tem lead, atualizar status do lead
      if (orderData.lead_id) {
        await supabase
          .from('leads')
          .update({ 
            status: 'converted', 
            status_changed_at: new Date().toISOString(),
            last_interaction_at: new Date().toISOString()
          })
          .eq('id', orderData.lead_id);
      } else if (orderData.appointment_id) {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('lead_id')
          .eq('id', orderData.appointment_id)
          .single();
        
        if (appointment && appointment.lead_id) {
          await supabase
            .from('leads')
            .update({ 
              status: 'converted', 
              status_changed_at: new Date().toISOString(),
              last_interaction_at: new Date().toISOString()
            })
            .eq('id', appointment.lead_id);
        }
      }
      
      // Buscar a ordem completa com todas as relações
      const completeOrder = await getOrderById(order.id);
      
      if (completeOrder) {
        toast.success(`Ordem de serviço #${orderNumber} criada com sucesso`);
        return completeOrder;
      } else {
        throw new Error('Erro ao buscar ordem criada');
      }
    } catch (err: any) {
      console.error('Erro ao criar ordem de serviço:', err);
      toast.error('Erro ao criar ordem de serviço');
      throw err;
    }
  };

  // Atualizar uma ordem existente
  const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order | null> => {
    try {
      // Verificar se a ordem existe
      const existingOrder = await getOrderById(id);
      
      if (!existingOrder) {
        toast.error('Ordem de serviço não encontrada');
        throw new Error('Ordem de serviço não encontrada');
      }
      
      const updateData: Record<string, any> = {};
      
      // Campos que podem ser atualizados diretamente
      const directFields = [
        'status', 'description', 'technician', 'notes', 
        'recommendations', 'estimated_completion_date'
      ];
      
      directFields.forEach(field => {
        if (updates[field as keyof Order] !== undefined) {
          updateData[field] = updates[field as keyof Order];
        }
      });
      
      // Se status alterado para completed, adicionar completed_at
      if (updates.status === 'completed' && existingOrder.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      // Recalcular totais se necessário
      if (
        updates.services !== undefined || 
        updates.parts !== undefined || 
        updates.labor_cost !== undefined || 
        updates.discount_percent !== undefined || 
        updates.tax_percent !== undefined
      ) {
        const calculationData = {
          services: updates.services || existingOrder.services,
          parts: updates.parts || existingOrder.parts,
          labor_cost: updates.labor_cost !== undefined ? updates.labor_cost : existingOrder.labor_cost,
          discount_percent: updates.discount_percent !== undefined ? updates.discount_percent : existingOrder.discount_percent,
          tax_percent: updates.tax_percent !== undefined ? updates.tax_percent : existingOrder.tax_percent
        };
        
        const totals = calculateOrderTotals(calculationData);
        
        updateData.labor_cost = calculationData.labor_cost;
        updateData.discount_percent = calculationData.discount_percent;
        updateData.tax_percent = calculationData.tax_percent;
        updateData.subtotal = totals.subtotal;
        updateData.discount_amount = totals.discount_amount;
        updateData.tax_amount = totals.tax_amount;
        updateData.total = totals.total;
      }
      
      // Atualizar a ordem
      const { error: updateError } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Atualizar serviços se necessário
      if (updates.services) {
        // Remover serviços existentes
        const { error: deleteServicesError } = await supabase
          .from('service_order_services')
          .delete()
          .eq('service_order_id', id);
        
        if (deleteServicesError) throw deleteServicesError;
        
        // Adicionar novos serviços
        if (updates.services.length > 0) {
          const servicesWithOrderId = updates.services.map(service => ({
            service_order_id: id,
            name: service.name,
            description: service.description,
            price: service.price,
            quantity: service.quantity,
            completed: service.completed || false,
            service_id: service.service_id
          }));
          
          const { error: insertServicesError } = await supabase
            .from('service_order_services')
            .insert(servicesWithOrderId);
          
          if (insertServicesError) throw insertServicesError;
        }
      }
      
      // Atualizar peças se necessário
      if (updates.parts) {
        // Remover peças existentes
        const { error: deletePartsError } = await supabase
          .from('service_order_parts')
          .delete()
          .eq('service_order_id', id);
        
        if (deletePartsError) throw deletePartsError;
        
        // Adicionar novas peças
        if (updates.parts.length > 0) {
          const partsWithOrderId = updates.parts.map(part => ({
            service_order_id: id,
            name: part.name,
            code: part.code,
            price: part.price,
            quantity: part.quantity,
            part_id: part.part_id
          }));
          
          const { error: insertPartsError } = await supabase
            .from('service_order_parts')
            .insert(partsWithOrderId);
          
          if (insertPartsError) throw insertPartsError;
        }
      }
      
      // Atualizar fotos se necessário (adicionando novas, mantendo as existentes)
      if (updates.photos) {
        const photosToAdd = updates.photos.filter(photo => !photo.id.includes(id));
        
        if (photosToAdd.length > 0) {
          const photosWithOrderId = photosToAdd.map(photo => ({
            service_order_id: id,
            url: photo.url,
            description: photo.description
          }));
          
          const { error: insertPhotosError } = await supabase
            .from('service_order_photos')
            .insert(photosWithOrderId);
          
          if (insertPhotosError) throw insertPhotosError;
        }
      }
      
      // Se ordem está sendo criada a partir de um agendamento, atualizar status do agendamento
      if (updates.status === 'completed' && existingOrder.appointment_id) {
        await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .eq('id', existingOrder.appointment_id);
      }
      
      // Buscar a ordem atualizada
      const updatedOrder = await getOrderById(id);
      
      if (updatedOrder) {
        toast.success(`Ordem de serviço #${updatedOrder.number} atualizada com sucesso`);
        return updatedOrder;
      } else {
        throw new Error('Erro ao buscar ordem atualizada');
      }
    } catch (err: any) {
      console.error('Erro ao atualizar ordem de serviço:', err);
      toast.error('Erro ao atualizar ordem de serviço');
      throw err;
    }
  };

  // Atualizar apenas o status de uma ordem
  const updateOrderStatus = async (id: string, status: OrderStatus, notes?: string): Promise<Order | null> => {
    try {
      const updateData: { status: OrderStatus; notes?: string; completed_at?: string } = { status };
      
      if (notes) {
        updateData.notes = notes;
      }
      
      // Se status alterado para completed, adicionar completed_at
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      // Atualizar a ordem
      const { error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Se status alterado para completed e ordem está associada a um agendamento, atualizar status do agendamento
      const { data: orderWithAppointment } = await supabase
        .from('service_orders')
        .select('appointment_id')
        .eq('id', id)
        .single();
      
      if (status === 'completed' && orderWithAppointment?.appointment_id) {
        await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .eq('id', orderWithAppointment.appointment_id);
      }
      
      // Buscar a ordem atualizada
      const updatedOrder = await getOrderById(id);
      
      if (updatedOrder) {
        toast.success(`Status da ordem atualizado para ${getStatusLabel(status)}`);
        return updatedOrder;
      } else {
        throw new Error('Erro ao buscar ordem atualizada');
      }
    } catch (err: any) {
      console.error('Erro ao atualizar status da ordem:', err);
      toast.error('Erro ao atualizar status da ordem');
      return null;
    }
  };

  // Remover uma ordem
  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      // Buscar a ordem para verificar se existe
      const order = await getOrderById(id);
      
      if (!order) {
        toast.error('Ordem de serviço não encontrada');
        throw new Error('Ordem de serviço não encontrada');
      }
      
      // Remover a ordem (as chaves estrangeiras cascateiam)
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remover da lista local
      setOrders(prev => prev.filter(o => o.id !== id));
      
      toast.success(`Ordem de serviço #${order.number} excluída com sucesso`);
      return true;
    } catch (err: any) {
      console.error('Erro ao remover ordem de serviço:', err);
      toast.error('Erro ao excluir ordem de serviço');
      return false;
    }
  };

  // Obter uma ordem por ID
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      // Buscar a ordem com suas relações
      const { data: order, error: orderError } = await supabase
        .from('service_orders')
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          appointment:appointment_id(*),
          lead:lead_id(*)
        `)
        .eq('id', id)
        .single();
      
      if (orderError) throw orderError;
      
      // Buscar serviços da ordem
      const { data: services, error: servicesError } = await supabase
        .from('service_order_services')
        .select('*')
        .eq('service_order_id', id);
      
      if (servicesError) throw servicesError;
      
      // Buscar peças da ordem
      const { data: parts, error: partsError } = await supabase
        .from('service_order_parts')
        .select('*')
        .eq('service_order_id', id);
      
      if (partsError) throw partsError;
      
      // Buscar fotos da ordem
      const { data: photos, error: photosError } = await supabase
        .from('service_order_photos')
        .select('*')
        .eq('service_order_id', id);
      
      if (photosError) throw photosError;
      
      // Montar a ordem completa
      return {
        ...order,
        services: services || [],
        parts: parts || [],
        photos: photos || []
      };
    } catch (err: any) {
      console.error('Erro ao buscar ordem de serviço por ID:', err);
      return null;
    }
  };

  // Obter rótulo para status
  const getStatusLabel = (status: OrderStatus): string => {
    const statusLabels: Record<OrderStatus, string> = {
      open: 'Em Aberto',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      waiting_parts: 'Aguardando Peças',
      waiting_approval: 'Aguardando Aprovação'
    };
    
    return statusLabels[status] || status;
  };

  // Obter cor para status
  const getStatusColor = (status: OrderStatus): string => {
    const statusColors: Record<OrderStatus, string> = {
      open: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      waiting_parts: 'bg-purple-500',
      waiting_approval: 'bg-yellow-500'
    };
    
    return statusColors[status] || 'bg-gray-500';
  };

  // Inicializar o hook
  useEffect(() => {
    const init = async () => {
      const orgId = await fetchUserOrganization();
      setUserOrganizationId(orgId);
      
      if (orgId) {
        await fetchOrders();
      } else {
        setOrders([]);
        setIsLoading(false);
        setError('Usuário não pertence a nenhuma organização');
      }
    };
    
    init();
    
    // Configurar a escuta em tempo real para atualizações
    const orgId = userOrganizationId;
    if (orgId) {
      const channel = supabase
        .channel('service-orders-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'service_orders',
          filter: `organization_id=eq.${orgId}`
        }, (payload) => {
          console.log('Alteração em tempo real detectada em ordens:', payload);
          fetchOrders();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchUserOrganization]);

  return {
    orders,
    isLoading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    fetchOrders,
    getFilteredOrders,
    getPaginatedOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getStatusLabel,
    getStatusColor,
    calculateOrderTotals,
    getNextOrderNumber
  };
};
