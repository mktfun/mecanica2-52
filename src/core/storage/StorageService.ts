import { eventBus, EVENTS } from '../events/EventBus';

// Interface para entidades base
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Classe genérica para gerenciar armazenamento local
export class StorageService<T extends BaseEntity> {
  private readonly storageKey: string;
  private cache: T[] | null = null;

  constructor(entityName: string) {
    this.storageKey = `mecanicapro_${entityName}`;
    this.initializeStore();
  }

  // Getter para o storageKey
  getStorageKey(): string {
    return this.storageKey;
  }

  // Inicializa o armazenamento se não existir
  private initializeStore(): void {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Obter todos os itens
  getAll(): T[] {
    try {
      // Usar cache se disponível
      if (this.cache !== null) {
        return this.cache;
      }

      const data = localStorage.getItem(this.storageKey);
      const items = data ? JSON.parse(data) : [];
      
      // Armazenar no cache
      this.cache = items;
      
      return items;
    } catch (error) {
      console.error(`Error getting ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }

  // Obter item por ID
  getById(id: string): T | null {
    try {
      const items = this.getAll();
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting item by ID from ${this.storageKey}:`, error);
      return null;
    }
  }

  // Adicionar novo item
  add(item: Omit<T, 'id' | 'created_at'>): T {
    try {
      const items = this.getAll();
      const now = new Date().toISOString();
      
      const newItem = {
        ...item,
        id: this.generateId(),
        created_at: now,
        updated_at: now
      } as T;

      items.push(newItem);
      this.saveItems(items);
      
      // Publicar evento de criação
      eventBus.publish(`${this.storageKey}:created`, newItem);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: this.storageKey, 
        action: 'created', 
        item: newItem 
      });
      
      return newItem;
    } catch (error) {
      console.error(`Error adding item to ${this.storageKey}:`, error);
      throw new Error(`Failed to add item to ${this.storageKey}`);
    }
  }

  // Atualizar item existente
  update(id: string, updates: Partial<T>): T {
    try {
      const items = this.getAll();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`Item with ID ${id} not found in ${this.storageKey}`);
      }
      
      const updatedItem = {
        ...items[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      items[index] = updatedItem as T;
      this.saveItems(items);
      
      // Publicar evento de atualização
      eventBus.publish(`${this.storageKey}:updated`, updatedItem);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: this.storageKey, 
        action: 'updated', 
        item: updatedItem 
      });
      
      return updatedItem as T;
    } catch (error) {
      console.error(`Error updating item in ${this.storageKey}:`, error);
      throw new Error(`Failed to update item in ${this.storageKey}`);
    }
  }

  // Remover item
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
      
      // Publicar evento de remoção
      eventBus.publish(`${this.storageKey}:deleted`, removedItem);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: this.storageKey, 
        action: 'deleted', 
        item: removedItem 
      });
      
      return true;
    } catch (error) {
      console.error(`Error removing item from ${this.storageKey}:`, error);
      return false;
    }
  }

  // Consulta itens com critérios
  query(filterFn: (item: T) => boolean): T[] {
    try {
      const items = this.getAll();
      return items.filter(filterFn);
    } catch (error) {
      console.error(`Error querying items in ${this.storageKey}:`, error);
      return [];
    }
  }

  // Salvar itens no localStorage
  private saveItems(items: T[]): void {
    try {
      // Atualizar cache
      this.cache = items;
      
      // Salvar no localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving to ${this.storageKey}:`, error);
      throw new Error(`Failed to save to ${this.storageKey}`);
    }
  }

  // Gerar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Limpar todos os dados
  clear(): void {
    try {
      this.cache = [];
      localStorage.removeItem(this.storageKey);
      
      eventBus.publish(`${this.storageKey}:cleared`, null);
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: this.storageKey, 
        action: 'cleared' 
      });
    } catch (error) {
      console.error(`Error clearing ${this.storageKey}:`, error);
    }
  }

  // Invalidar cache
  invalidateCache(): void {
    this.cache = null;
  }

  // Exportar dados
  exportData(): string {
    return localStorage.getItem(this.storageKey) || '[]';
  }

  // Importar dados
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!Array.isArray(data)) {
        throw new Error('Dados importados devem estar em formato de array');
      }
      
      localStorage.setItem(this.storageKey, jsonData);
      this.invalidateCache();
      
      eventBus.publish(EVENTS.STORAGE_UPDATED, { 
        entity: this.storageKey, 
        action: 'imported' 
      });
      
      return true;
    } catch (error) {
      console.error(`Error importing data to ${this.storageKey}:`, error);
      throw error;
    }
  }
}

// Exportar instâncias para diferentes entidades conforme o tipo Lead
import { Lead } from "@/types/lead";

export const enhancedLeadsStore = new StorageService<Lead>('leads');

// Outros stores serão adicionados conforme os tipos forem definidos
