
import { useState, useEffect } from 'react';
import { StorageService, BaseEntity } from '../core/storage/StorageService';
import { eventBus, EVENTS } from '../core/events/EventBus';

/**
 * Hook for using data from storage with automatic updates
 * @param storageService Storage service instance
 * @param filterFn Optional filter function
 * @returns Array of data items
 */
export function useStorageData<T extends BaseEntity>(
  storageService: StorageService<T>,
  filterFn?: (item: T) => boolean
): T[] {
  const [data, setData] = useState<T[]>([]);
  
  useEffect(() => {
    // Initial data load
    const loadData = () => {
      const allData = storageService.getAll();
      setData(filterFn ? allData.filter(filterFn) : allData);
    };
    
    loadData();
    
    // Subscribe to storage updates
    const handleStorageUpdate = (event: any) => {
      if (event.entity === storageService.storeKey.replace('mecanicapro_', '')) {
        loadData();
      }
    };
    
    const unsubscribe = eventBus.subscribe(EVENTS.STORAGE_UPDATED, handleStorageUpdate);
    
    // Cleanup
    return unsubscribe;
  }, [storageService, filterFn]);
  
  return data;
}
