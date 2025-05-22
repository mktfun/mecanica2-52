
import { useState, useEffect } from 'react';
import { BaseEntity, StorageService } from '../core/storage/StorageService';
import { eventBus, EVENTS } from '../core/events/EventBus';

// Hook para usar dados com atualização automática
export function useStorageData<T extends BaseEntity>(
  storageService: StorageService<T>,
  filter?: (item: T) => boolean
): T[] {
  const [data, setData] = useState<T[]>([]);
  
  useEffect(() => {
    // Carregar dados iniciais
    const loadData = () => {
      const allData = storageService.getAll();
      setData(filter ? allData.filter(filter) : allData);
    };
    
    // Carregar dados imediatamente
    loadData();
    
    // Inscrever para atualizações
    const unsubscribe = eventBus.subscribe(EVENTS.STORAGE_UPDATED, (event) => {
      if (event.entity === storageService.storageKey) {
        loadData();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [storageService, filter]);
  
  return data;
}
