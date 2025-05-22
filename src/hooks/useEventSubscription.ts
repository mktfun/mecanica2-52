
import { useEffect } from 'react';
import { eventBus, EventCallback } from '../core/events/EventBus';

/**
 * Hook for subscribing to events
 * @param event Event name to subscribe to
 * @param callback Callback function to execute when event is published
 * @param deps Dependencies array (similar to useEffect deps)
 */
export function useEventSubscription(
  event: string,
  callback: EventCallback,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    // Subscribe when component mounts
    const unsubscribe = eventBus.subscribe(event, callback);
    
    // Unsubscribe when component unmounts
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]); 
}
