import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/order';
import { toast } from 'sonner';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOrganizationId, setUserOrganizationId] = useState<string | null>(null);

  // Function to fetch user organization
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
        if (membershipError.code !== 'PGRST116') {
          console.error('Error fetching user organization:', membershipError);
        }
        return null;
      }

      return memberships?.organization_id || null;
    } catch (err) {
      console.error('Error fetching user or organization:', err);
      return null;
    }
  }, []);

  // Function to fetch all orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      setIsLoading(false);
      setError('User does not belong to any organization');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          services:service_order_services(*),
          parts:service_order_parts(*),
          photos:service_order_photos(*),
          lead:lead_id(*)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map and type the data correctly
      const formattedOrders: Order[] = (data || []).map(order => ({
        id: order.id,
        number: order.number,
        client_id: order.client_id,
        vehicle_id: order.vehicle_id,
        organization_id: order.organization_id,
        status: order.status as OrderStatus, // Cast to correct enum type
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
        lead_id: order.lead_id || undefined,
        appointment_id: order.appointment_id || undefined,
        // Expanded data
        client: order.client,
        vehicle: order.vehicle,
        services: order.services || [],
        parts: order.parts || [],
        photos: order.photos || [],
        lead: order.lead
      }));

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Error loading orders');
      toast.error('Error loading orders');
    } finally {
      setIsLoading(false);
    }
  }, [userOrganizationId, fetchUserOrganization]);

  // Function to add a new order
  const addOrder = async (newOrder: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      toast.error('User does not belong to any organization');
      throw new Error('User does not belong to any organization');
    }

    try {
      const orderWithOrg = {
        ...newOrder,
        organization_id: orgId
      };

      const { data, error } = await supabase
        .from('service_orders')
        .insert([orderWithOrg])
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          services:service_order_services(*),
          parts:service_order_parts(*),
          photos:service_order_photos(*),
          lead:lead_id(*)
        `);

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const formattedOrder: Order = {
          id: data[0].id,
          number: data[0].number,
          client_id: data[0].client_id,
          vehicle_id: data[0].vehicle_id,
          organization_id: data[0].organization_id,
          status: data[0].status as OrderStatus,
          description: data[0].description || '',
          notes: data[0].notes || '',
          technician: data[0].technician || '',
          recommendations: data[0].recommendations || '',
          labor_cost: data[0].labor_cost || 0,
          subtotal: data[0].subtotal || 0,
          discount_percent: data[0].discount_percent || 0,
          discount_amount: data[0].discount_amount || 0,
          tax_percent: data[0].tax_percent || 0,
          tax_amount: data[0].tax_amount || 0,
          total: data[0].total || 0,
          estimated_completion_date: data[0].estimated_completion_date,
          completed_at: data[0].completed_at,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          lead_id: data[0].lead_id || undefined,
          appointment_id: data[0].appointment_id || undefined,
          client: data[0].client,
          vehicle: data[0].vehicle,
          services: data[0].services || [],
          parts: data[0].parts || [],
          photos: data[0].photos || [],
          lead: data[0].lead
        };
        
        setOrders(prevOrders => [formattedOrder, ...prevOrders]);
        toast.success('Order added successfully');
        return formattedOrder;
      }
    } catch (err: any) {
      console.error('Error adding order:', err);
      toast.error('Error adding order');
      throw err;
    }
  };

  // Function to update an order
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
          services:service_order_services(*),
          parts:service_order_parts(*),
          photos:service_order_photos(*),
          lead:lead_id(*)
        `);

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const formattedOrder: Order = {
          id: data[0].id,
          number: data[0].number,
          client_id: data[0].client_id,
          vehicle_id: data[0].vehicle_id,
          organization_id: data[0].organization_id,
          status: data[0].status as OrderStatus,
          description: data[0].description || '',
          notes: data[0].notes || '',
          technician: data[0].technician || '',
          recommendations: data[0].recommendations || '',
          labor_cost: data[0].labor_cost || 0,
          subtotal: data[0].subtotal || 0,
          discount_percent: data[0].discount_percent || 0,
          discount_amount: data[0].discount_amount || 0,
          tax_percent: data[0].tax_percent || 0,
          tax_amount: data[0].tax_amount || 0,
          total: data[0].total || 0,
          estimated_completion_date: data[0].estimated_completion_date,
          completed_at: data[0].completed_at,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          lead_id: data[0].lead_id || undefined,
          appointment_id: data[0].appointment_id || undefined,
          client: data[0].client,
          vehicle: data[0].vehicle,
          services: data[0].services || [],
          parts: data[0].parts || [],
          photos: data[0].photos || [],
          lead: data[0].lead
        };
        
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === id ? formattedOrder : order
          )
        );
        
        toast.success('Order updated successfully');
        return formattedOrder;
      }
    } catch (err: any) {
      console.error('Error updating order:', err);
      toast.error('Error updating order');
      throw err;
    }
  };

  // Function to delete an order
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
      toast.success('Order deleted successfully');
    } catch (err: any) {
      console.error('Error deleting order:', err);
      toast.error('Error deleting order');
      throw err;
    }
  };

  // Function to get order by ID
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          client:client_id(*),
          vehicle:vehicle_id(*),
          services:service_order_services(*),
          parts:service_order_parts(*),
          photos:service_order_photos(*),
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

      // Map the data to Order type with correct status casting
      const formattedOrder: Order = {
        id: data.id,
        number: data.number,
        client_id: data.client_id,
        vehicle_id: data.vehicle_id,
        organization_id: data.organization_id,
        status: data.status as OrderStatus, // Cast to correct enum type
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
        estimated_completion_date: data.estimated_completion_date,
        completed_at: data.completed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        lead_id: data.lead_id || undefined,
        appointment_id: data.appointment_id || undefined,
        // Expanded data
        client: data.client,
        vehicle: data.vehicle,
        services: data.services || [],
        parts: data.parts || [],
        photos: data.photos || [],
        lead: data.lead
      };

      return formattedOrder;
    } catch (err: any) {
      console.error('Error fetching order by ID:', err);
      return null;
    }
  };

  // Initialize hook
  useEffect(() => {
    const init = async () => {
      const orgId = await fetchUserOrganization();
      setUserOrganizationId(orgId);
      
      if (orgId) {
        fetchOrders();
      } else {
        setOrders([]);
        setIsLoading(false);
        setError('User does not belong to any organization');
      }
    };

    init();
  }, [fetchUserOrganization, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    userOrganizationId
  };
};
