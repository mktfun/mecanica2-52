import { eventBus, EVENTS } from '../events/EventBus';

// Interface for base entities
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Generic storage service for local persistence
 * Implements CRUD operations with event notification
 */
export class StorageService<T extends BaseEntity> {
  private storageKey: string;

  constructor(entityName: string) {
    this.storageKey = `mecanicapro_${entityName}`;
    this.initializeStore();
  }

  /**
   * Initialize storage if it doesn't exist
   */
  private initializeStore(): void {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  /**
   * Get all items from storage
   * @returns Array of all items
   */
  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return JSON.parse(data || '[]') || [];
    } catch (error) {
      console.error(`Error getting ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }

  /**
   * Get item by ID
   * @param id Item ID
   * @returns Item or null if not found
   */
  getById(id: string): T | null {
    try {
      const items = this.getAll();
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting item by ID from ${this.storageKey}:`, error);
      return null;
    }
  }

  /**
   * Query items based on criteria
   * @param filterFn Filter function
   * @returns Array of matching items
   */
  query(filterFn: (item: T) => boolean): T[] {
    try {
      const items = this.getAll();
      return items.filter(filterFn);
    } catch (error) {
      console.error(`Error querying items from ${this.storageKey}:`, error);
      return [];
    }
  }

  /**
   * Add new item
   * @param item Item to add (without id and created_at)
   * @returns Added item with id and timestamps
   */
  add(item: Partial<T>): T {
    try {
      const items = this.getAll();
      
      const now = new Date().toISOString();
      const newItem = {
        ...item,
        id: item.id || this.generateId(),
        created_at: now,
        updated_at: now
      } as T;
      
      items.push(newItem);
      this.saveItems(items);
      
      // Publish events
      const entityName = this.storageKey.replace('mecanicapro_', '');
      eventBus.publish(`${entityName}:created`, newItem);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: entityName, 
        action: 'created', 
        item: newItem 
      });
      
      return newItem;
    } catch (error) {
      console.error(`Error adding item to ${this.storageKey}:`, error);
      throw new Error(`Failed to add item to ${this.storageKey}`);
    }
  }

  /**
   * Update existing item
   * @param id Item ID
   * @param updates Partial item data to update
   * @returns Updated item
   */
  update(id: string, updates: Partial<T>): T {
    try {
      const items = this.getAll();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`Item with ID ${id} not found in ${this.storageKey}`);
      }
      
      // Keep original id and created_at
      const updatedItem = {
        ...items[index],
        ...updates,
        id, // Preserve ID
        created_at: items[index].created_at, // Preserve creation date
        updated_at: new Date().toISOString()
      } as T;
      
      items[index] = updatedItem;
      this.saveItems(items);
      
      // Publish events
      const entityName = this.storageKey.replace('mecanicapro_', '');
      eventBus.publish(`${entityName}:updated`, updatedItem);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: entityName, 
        action: 'updated', 
        item: updatedItem 
      });
      
      return updatedItem;
    } catch (error) {
      console.error(`Error updating item in ${this.storageKey}:`, error);
      throw new Error(`Failed to update item in ${this.storageKey}`);
    }
  }

  /**
   * Remove item by ID
   * @param id Item ID
   * @returns Success status
   */
  remove(id: string): boolean {
    try {
      const items = this.getAll();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return false;
      }
      
      const removedItem = items[index];
      items.splice(index, 1);
      this.saveItems(items);
      
      // Publish events
      const entityName = this.storageKey.replace('mecanicapro_', '');
      eventBus.publish(`${entityName}:deleted`, removedItem);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: entityName, 
        action: 'deleted', 
        item: removedItem 
      });
      
      return true;
    } catch (error) {
      console.error(`Error removing item from ${this.storageKey}:`, error);
      return false;
    }
  }

  /**
   * Export all data as JSON string
   * @returns JSON string of all data
   */
  exportData(): string {
    try {
      return localStorage.getItem(this.storageKey) || '[]';
    } catch (error) {
      console.error(`Error exporting data from ${this.storageKey}:`, error);
      return '[]';
    }
  }

  /**
   * Import data from JSON string
   * @param jsonData JSON string data
   * @returns Success status
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!Array.isArray(data)) {
        throw new Error('Imported data must be in array format');
      }
      
      localStorage.setItem(this.storageKey, jsonData);
      
      const entityName = this.storageKey.replace('mecanicapro_', '');
      eventBus.publish(`${entityName}:imported`, { count: data.length });
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: entityName, 
        action: 'imported', 
        count: data.length 
      });
      
      return true;
    } catch (error) {
      console.error(`Error importing data to ${this.storageKey}:`, error);
      throw error;
    }
  }

  /**
   * Clear all data
   * @returns Success status
   */
  clear(): boolean {
    try {
      localStorage.removeItem(this.storageKey);
      this.initializeStore();
      
      const entityName = this.storageKey.replace('mecanicapro_', '');
      eventBus.publish(`${entityName}:cleared`, null);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: entityName, 
        action: 'cleared' 
      });
      
      return true;
    } catch (error) {
      console.error(`Error clearing ${this.storageKey}:`, error);
      return false;
    }
  }

  /**
   * Save items to localStorage
   * @param items Items to save
   */
  private saveItems(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving to ${this.storageKey}:`, error);
      throw new Error(`Failed to save to ${this.storageKey}`);
    }
  }

  /**
   * Generate unique ID
   * @returns Unique ID string
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Get the storage key
   */
  get storeKey(): string {
    return this.storageKey;
  }
}

// Export instances for different entities
export const leadsStorage = new StorageService<any>('leads');
export const appointmentsStorage = new StorageService<any>('appointments');
export const ordersStorage = new StorageService<any>('orders');
export const clientsStorage = new StorageService<any>('clients');
export const vehiclesStorage = new StorageService<any>('vehicles');
export const usersStorage = new StorageService<any>('users');
export const settingsStorage = new StorageService<any>('settings');
