
import React from 'react';
import { Order, StatusHistoryEntry } from '@/types/order';
import { formatDateTime } from '@/utils/formatters';
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  ShoppingBag, 
  AlertCircle 
} from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

const OrderTimeline = ({ order }: OrderTimelineProps) => {
  const statusHistory: StatusHistoryEntry[] = order.statusHistory || [];
  
  // If no history, create one entry based on order creation
  const timelineEntries = statusHistory.length > 0 
    ? statusHistory 
    : [{ status: order.status, timestamp: order.created_at }];

  // Sort entries by timestamp
  const sortedEntries = [...timelineEntries].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // Get icon for status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'waiting_parts':
        return <ShoppingBag className="h-5 w-5 text-purple-500" />;
      case 'waiting_approval':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get label for status
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'open':
        return 'Ordem aberta';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluída';
      case 'canceled':
        return 'Cancelada';
      case 'waiting_parts':
        return 'Aguardando peças';
      case 'waiting_approval':
        return 'Aguardando aprovação';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {sortedEntries.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
          Sem histórico de status disponível
        </div>
      ) : (
        <div className="relative border-l border-gray-200 pl-6 ml-4 space-y-10">
          {sortedEntries.map((entry, index) => (
            <div key={index} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[30px] border-2 border-white p-1 rounded-full bg-white">
                {getStatusIcon(entry.status)}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                {/* Status info */}
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{getStatusLabel(entry.status)}</h4>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(new Date(entry.timestamp))}
                  </span>
                </div>
                
                {/* User and notes */}
                {(entry.user || entry.notes) && (
                  <div className="mt-2 text-sm text-gray-600">
                    {entry.user && <div><span className="font-medium">Por:</span> {entry.user}</div>}
                    {entry.notes && <div className="mt-1">{entry.notes}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
