
import { useEffect } from 'react';
import { eventBus } from '../core/events/EventBus';

// Hook para facilitar a inscrição em eventos
export function useEventSubscription(
  event: string,
  callback: (data: any) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    // Inscrever no evento quando o componente montar
    const unsubscribe = eventBus.subscribe(event, callback);
    
    // Cancelar inscrição quando o componente desmontar
    return () => {
      unsubscribe();
    };
  }, [event, callback, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
