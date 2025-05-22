
/**
 * Event Bus for MecânicaPro
 * Central event management system implementing the pub/sub pattern
 */

export type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Function to call when event is published
   * @returns Function to unsubscribe
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const callbacks = this.events.get(event)!;
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Publish an event
   * @param event Event name
   * @param data Data to pass to subscribers
   */
  publish(event: string, data: any): void {
    if (!this.events.has(event)) {
      return;
    }

    const callbacks = this.events.get(event)!;
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Clear all subscribers for an event or all events
   * @param event Optional event name, if not provided all events are cleared
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Singleton for use throughout the application
export const eventBus = new EventBus();

// Event constants
export const EVENTS = {
  // Lead events
  LEAD_CREATED: 'lead:created',
  LEAD_UPDATED: 'lead:updated',
  LEAD_DELETED: 'lead:deleted',
  
  // Appointment events
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_UPDATED: 'appointment:updated',
  APPOINTMENT_DELETED: 'appointment:deleted',
  
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  
  // User events
  USER_LOGGED_IN: 'user:loggedIn',
  USER_LOGGED_OUT: 'user:loggedOut',
  
  // Theme events
  THEME_CHANGED: 'theme:changed',
  
  // Storage events
  STORAGE_UPDATED: 'storage:updated',
  
  // Vehicle events
  VEHICLE_CREATED: 'vehicle:created',
  VEHICLE_UPDATED: 'vehicle:updated',
  VEHICLE_DELETED: 'vehicle:deleted',
  
  // Client events
  CLIENT_CREATED: 'client:created',
  CLIENT_UPDATED: 'client:updated',
  CLIENT_DELETED: 'client:deleted'
};
