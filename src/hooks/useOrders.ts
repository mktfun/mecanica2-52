
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/order';
import { Lead, LeadStatus } from '@/types/lead';
import { toast } from 'sonner';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          appointment:appointment_id(*),
          lead:lead_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map and format the data with proper type casting
      const formattedOrders: Order[] = (data || []).map(order => ({
        id: order.id,
        number: order.number,
        client_id: order.client_id,
        vehicle_id: order.vehicle_id,
        organization_id: order.organization_id,
        status: order.status as OrderStatus,
        description: order.description || '',
        notes: order.notes || '',
        technician: order.technician || '',
        recommendations: order.recommendations || '',
        labor_cost: order.labor_cost || 0,
        subtotal: order.subtotal || 0,
        discount_percent: order.discount_percent || 0,
        discount_amount: order.discount_amount || 0,
        tax_percent: order.tax_percent || 0,
        tax_amount: order.tax_amount || 0,
        total: order.total || 0,
        estimated_completion_date: order.estimated_completion_date,
        completed_at: order.completed_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
        appointment_id: order.appointment_id || undefined,
        lead_id: order.lead_id || undefined,
        // Expanded relationships
        client: order.client,
        vehicle: order.vehicle,
        appointment: order.appointment,
        lead: order.lead ? {
          ...order.lead,
          status: order.lead.status as LeadStatus // Cast lead status properly
        } : undefined
      }));

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Erro ao buscar ordens:', err);
      setError(err.message || 'Erro ao carregar ordens');
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addOrder = async (newOrder: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .insert([newOrder])
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          appointment:appointment_id(*),
          lead:lead_id(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const formattedOrder: Order = {
          ...data,
          status: data.status as OrderStatus,
          description: data.description || '',
          notes: data.notes || '',
          technician: data.technician || '',
          recommendations: data.recommendations || '',
          labor_cost: data.labor_cost || 0,
          subtotal: data.subtotal || 0,
          discount_percent: data.discount_percent || 0,
          discount_amount: data.discount_amount || 0,
          tax_percent: data.tax_percent || 0,
          tax_amount: data.tax_amount || 0,
          total: data.total || 0,
          appointment_id: data.appointment_id || undefined,
          lead_id: data.lead_id || undefined,
          client: data.client,
          vehicle: data.vehicle,
          appointment: data.appointment,
          lead: data.lead ? {
            ...data.lead,
            status: data.lead.status as LeadStatus
          } : undefined
        };

        setOrders(prevOrders => [formattedOrder, ...prevOrders]);
        toast.success('Ordem de serviço criada com sucesso');
        return formattedOrder;
      }
    } catch (err: any) {
      console.error('Erro ao criar ordem:', err);
      toast.error('Erro ao criar ordem de serviço');
      throw err;
    }
  };

  const updateOrder = async (id: string, updatedData: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .update(updatedData)
        .eq('id', id)
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          appointment:appointment_id(*),
          lead:lead_id(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const formattedOrder: Order = {
          ...data,
          status: data.status as OrderStatus,
          description: data.description || '',
          notes: data.notes || '',
          technician: data.technician || '',
          recommendations: data.recommendations || '',
          labor_cost: data.labor_cost || 0,
          subtotal: data.subtotal || 0,
          discount_percent: data.discount_percent || 0,
          discount_amount: data.discount_amount || 0,
          tax_percent: data.tax_percent || 0,
          tax_amount: data.tax_amount || 0,
          total: data.total || 0,
          appointment_id: data.appointment_id || undefined,
          lead_id: data.lead_id || undefined,
          client: data.client,
          vehicle: data.vehicle,
          appointment: data.appointment,
          lead: data.lead ? {
            ...data.lead,
            status: data.lead.status as LeadStatus
          } : undefined
        };

        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === id ? formattedOrder : order
          )
        );

        toast.success('Ordem de serviço atualizada com sucesso');
        return formattedOrder;
      }
    } catch (err: any) {
      console.error('Erro ao atualizar ordem:', err);
      toast.error('Erro ao atualizar ordem de serviço');
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      toast.success('Ordem de serviço excluída com sucesso');
    } catch (err: any) {
      console.error('Erro ao excluir ordem:', err);
      toast.error('Erro ao excluir ordem de serviço');
      throw err;
    }
  };

  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
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

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return {
        ...data,
        status: data.status as OrderStatus,
        description: data.description || '',
        notes: data.notes || '',
        technician: data.technician || '',
        recommendations: data.recommendations || '',
        labor_cost: data.labor_cost || 0,
        subtotal: data.subtotal || 0,
        discount_percent: data.discount_percent || 0,
        discount_amount: data.discount_amount || 0,
        tax_percent: data.tax_percent || 0,
        tax_amount: data.tax_amount || 0,
        total: data.total || 0,
        appointment_id: data.appointment_id || undefined,
        lead_id: data.lead_id || undefined,
        client: data.client,
        vehicle: data.vehicle,
        appointment: data.appointment,
        lead: data.lead ? {
          ...data.lead,
          status: data.lead.status as LeadStatus
        } : undefined
      };
    } catch (err: any) {
      console.error('Erro ao buscar ordem por ID:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderById
  };
};
