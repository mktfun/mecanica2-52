
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/order';

class OrderService {
  async getOrders(organizationId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        client:client_id(*),
        vehicle:vehicle_id(*),
        appointment:appointment_id(*),
        lead:lead_id(*)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }

    return (data || []).map(order => ({
      ...order,
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
      appointment_id: order.appointment_id || undefined,
      lead_id: order.lead_id || undefined,
      client: order.client,
      vehicle: order.vehicle,
      appointment: order.appointment,
      lead: order.lead
    }));
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const updates: Partial<Order> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('service_orders')
      .update(updates)
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
      throw new Error(`Error updating order status: ${error.message}`);
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
      lead: data.lead
    };
  }

  async calculateOrderTotal(orderId: string, laborCost: number, discountPercent: number = 0, taxPercent: number = 0): Promise<void> {
    // Get order parts and services
    const [partsResult, servicesResult] = await Promise.all([
      supabase.from('service_order_parts').select('price, quantity').eq('service_order_id', orderId),
      supabase.from('service_order_services').select('price, quantity').eq('service_order_id', orderId)
    ]);

    if (partsResult.error || servicesResult.error) {
      throw new Error('Error calculating order total');
    }

    const partsTotal = (partsResult.data || []).reduce((sum, part) => sum + (part.price * part.quantity), 0);
    const servicesTotal = (servicesResult.data || []).reduce((sum, service) => sum + (service.price * service.quantity), 0);
    
    const subtotal = partsTotal + servicesTotal + laborCost;
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);
    const total = taxableAmount + taxAmount;

    const { error } = await supabase
      .from('service_orders')
      .update({
        labor_cost: laborCost,
        subtotal,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      throw new Error(`Error updating order totals: ${error.message}`);
    }
  }
}

export const orderService = new OrderService();
