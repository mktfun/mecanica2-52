
import React from 'react';
import { FileText } from 'lucide-react';

interface OrderData {
  id: string;
  customer_name: string;
  service_type: string;
  status: string;
  created_at: string;
}

interface OpenOrdersCardProps {
  data: OrderData[];
}

const OpenOrdersCard = ({ data }: OpenOrdersCardProps) => {
  const openOrders = data.filter(order => 
    order.status === 'in_progress' || order.status === 'pending'
  );

  const recentOrders = openOrders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-2">
          <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {openOrders.length}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ordens em aberto
        </p>
      </div>
      
      <div className="space-y-2 flex-1">
        {recentOrders.map((order) => (
          <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
              {order.customer_name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {order.service_type}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenOrdersCard;
