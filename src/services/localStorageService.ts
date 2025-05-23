
class LocalStorageService {
  constructor(private storeName: string) {
    this.initializeStore();
  }
  
  // Inicializa o armazenamento se não existir
  private initializeStore(): void {
    if (!localStorage.getItem(this.storeName)) {
      localStorage.setItem(this.storeName, JSON.stringify([]));
    }
  }
  
  // Obtém todos os itens
  getAll(): any[] {
    try {
      const data = localStorage.getItem(this.storeName);
      return JSON.parse(data || '[]') || [];
    } catch (error) {
      console.error(`Erro ao obter dados de ${this.storeName}:`, error);
      return [];
    }
  }
  
  // Obtém um item pelo ID
  getById(id: string): any | null {
    try {
      const items = this.getAll();
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Erro ao obter item de ${this.storeName}:`, error);
      return null;
    }
  }
  
  // Adiciona um novo item
  add(item: any): any {
    try {
      const items = this.getAll();
      
      // Gera um ID único se não existir
      if (!item.id) {
        item.id = Date.now().toString();
      }
      
      // Adiciona timestamps
      item.created_at = new Date().toISOString();
      item.updated_at = new Date().toISOString();
      
      items.push(item);
      localStorage.setItem(this.storeName, JSON.stringify(items));
      
      return item;
    } catch (error) {
      console.error(`Erro ao adicionar item em ${this.storeName}:`, error);
      throw error;
    }
  }
  
  // Atualiza um item existente
  update(id: string, updatedItem: any): any {
    try {
      const items = this.getAll();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`Item com ID ${id} não encontrado em ${this.storeName}`);
      }
      
      // Mantém o ID e created_at originais
      updatedItem.id = id;
      updatedItem.created_at = items[index].created_at;
      updatedItem.updated_at = new Date().toISOString();
      
      items[index] = updatedItem;
      localStorage.setItem(this.storeName, JSON.stringify(items));
      
      return updatedItem;
    } catch (error) {
      console.error(`Erro ao atualizar item em ${this.storeName}:`, error);
      throw error;
    }
  }
  
  // Remove um item
  remove(id: string): boolean {
    try {
      const items = this.getAll();
      const filteredItems = items.filter(item => item.id !== id);
      
      localStorage.setItem(this.storeName, JSON.stringify(filteredItems));
      
      return true;
    } catch (error) {
      console.error(`Erro ao remover item de ${this.storeName}:`, error);
      throw error;
    }
  }
  
  // Busca itens com base em critérios
  query(filterFn: (item: any) => boolean): any[] {
    try {
      const items = this.getAll();
      return items.filter(filterFn);
    } catch (error) {
      console.error(`Erro ao consultar itens em ${this.storeName}:`, error);
      return [];
    }
  }
  
  // Exporta todos os dados para JSON
  exportData(): string {
    try {
      return localStorage.getItem(this.storeName) || '[]';
    } catch (error) {
      console.error(`Erro ao exportar dados de ${this.storeName}:`, error);
      return '[]';
    }
  }
  
  // Importa dados de JSON
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!Array.isArray(data)) {
        throw new Error('Dados importados devem estar em formato de array');
      }
      
      localStorage.setItem(this.storeName, jsonData);
      return true;
    } catch (error) {
      console.error(`Erro ao importar dados para ${this.storeName}:`, error);
      throw error;
    }
  }
}

// Exporta instâncias para diferentes entidades
export const usersStore = new LocalStorageService('users');
export const clientsStore = new LocalStorageService('clients');
export const vehiclesStore = new LocalStorageService('vehicles');
export const leadsStore = new LocalStorageService('leads');
export const appointmentsStore = new LocalStorageService('appointments');
export const ordersStore = new LocalStorageService('orders');
export const inventoryStore = new LocalStorageService('inventory');
export const financialStore = new LocalStorageService('financial');

export default LocalStorageService;
