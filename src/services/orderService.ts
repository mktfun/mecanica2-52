
import { StorageService } from '@/core/storage/StorageService';
import { Order, OrderStatus } from '@/types/order';
import { eventBus, EVENTS } from '@/core/events/EventBus';

// Create a storage service instance for orders
class OrderStorageService extends StorageService<Order> {
  constructor() {
    super('orders');
  }

  // Get next order number
  getNextOrderNumber(): number {
    const orders = this.getAll();
    
    if (orders.length === 0) {
      return 1000; // Start with 1000 as the first order number
    }
    
    // Find the highest order number and increment by 1
    const highestNumber = Math.max(...orders.map(order => order.number));
    return highestNumber + 1;
  }

  // Update order status with history tracking
  updateStatus(id: string, status: OrderStatus, notes?: string): Order | null {
    const order = this.getById(id);
    
    if (!order) {
      return null;
    }
    
    const statusEntry = {
      status,
      timestamp: new Date().toISOString(),
      notes
    };
    
    const statusHistory = order.statusHistory || [];
    
    const updatedOrder = this.update(id, {
      status,
      statusHistory: [...statusHistory, statusEntry],
      ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {})
    });

    // Publish event
    eventBus.publish(EVENTS.ORDER_STATUS_CHANGED, {
      orderId: id,
      oldStatus: order.status,
      newStatus: status
    });
    
    return updatedOrder;
  }

  // Calculate order totals
  calculateOrderTotals(order: Partial<Order>): {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
  } {
    // Calculate services total
    const servicesTotal = (order.services || []).reduce(
      (sum, service) => sum + (service.price * service.quantity),
      0
    );
    
    // Calculate parts total
    const partsTotal = (order.parts || []).reduce(
      (sum, part) => sum + (part.price * part.quantity),
      0
    );
    
    // Calculate subtotal (services + parts + labor)
    const laborCost = order.laborCost || 0;
    const subtotal = servicesTotal + partsTotal + laborCost;
    
    // Calculate discount amount
    const discountPercent = order.discount || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    
    // Calculate tax amount
    const taxPercent = order.tax || 0;
    const taxAmount = ((subtotal - discountAmount) * taxPercent) / 100;
    
    // Calculate total
    const total = subtotal - discountAmount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total
    };
  }
}

export const orderService = new OrderStorageService();

// Add order-related event types
declare module '@/core/events/EventBus' {
  interface EventTypes {
    ORDER_STATUS_CHANGED: {
      orderId: string;
      oldStatus: OrderStatus;
      newStatus: OrderStatus;
    };
    ORDER_CREATED: {
      orderId: string;
      order: Order;
    };
    ORDER_UPDATED: {
      orderId: string;
      order: Order;
    };
    ORDER_DELETED: {
      orderId: string;
    };
  }
}

// Add order-related events
export const ORDER_EVENTS = {
  STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  CREATED: 'ORDER_CREATED',
  UPDATED: 'ORDER_UPDATED',
  DELETED: 'ORDER_DELETED'
};

// Register events
Object.values(ORDER_EVENTS).forEach(event => {
  if (!EVENTS[event]) {
    EVENTS[event] = event;
  }
});
