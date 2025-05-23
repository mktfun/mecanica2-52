import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { AlertCircle, Clipboard, PlusCircle, List } from 'lucide-react';
import { Order } from '@/types/order';
import { formatDate } from '@/utils/formatters';

const OrdersBentoGrid = () => {
  const navigate = useNavigate();
  const [openOrdersCount, setOpenOrdersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrdersData = () => {
      try {
        const ordersData = localStorage.getItem('mecanicapro_orders');
        if (ordersData) {
          const orders: Order[] = JSON.parse(ordersData);
          
          // Count open orders
          const openCount = orders.filter(order => 
            order.status === 'open' || order.status === 'in_progress' || order.status === 'waiting_parts' || order.status === 'waiting_approval'
          ).length;
          setOpenOrdersCount(openCount);
          
          // Get recent orders (last 4)
          const sortedOrders = orders
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 4);
          setRecentOrders(sortedOrders);
        }
      } catch (error) {
        console.error('Erro ao carregar dados das ordens:', error);
      }
    };

    loadOrdersData();
  }, []);

  const RecentOrdersList = ({ orders }: { orders: Order[] }) => (
    <div className="p-4 h-full">
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma ordem encontrada</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-blue-600 dark:text-blue-400">#{order.number}</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{order.client?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{order.vehicle?.model} - {order.vehicle?.plate}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    order.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'waiting_parts' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'open' ? 'Aberta' :
                     order.status === 'in_progress' ? 'Em Andamento' :
                     order.status === 'completed' ? 'Concluída' :
                     order.status === 'cancelled' ? 'Cancelada' :
                     order.status === 'waiting_parts' ? 'Aguardando Peças' :
                     'Aguardando Aprovação'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(new Date(order.created_at))}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const OpenOrdersBackground = ({ count }: { count: number }) => (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
        {count}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
        {count === 1 ? 'ordem em aberto' : 'ordens em aberto'}
      </div>
    </div>
  );

  const CreateOrderBackground = () => (
    <div className="flex items-center justify-center h-full p-4">
      <div 
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 cursor-pointer transition-colors w-full h-full flex items-center justify-center"
        onClick={() => navigate('/orders/new')}
      >
        <div className="text-center">
          <PlusCircle className="h-8 w-8 mx-auto mb-2" />
          <span className="text-sm font-medium">Iniciar Nova O.S.</span>
        </div>
      </div>
    </div>
  );

  const ViewAllBackground = () => (
    <div className="flex items-center justify-center h-full p-4">
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg p-4 cursor-pointer transition-colors w-full h-full flex items-center justify-center"
        onClick={() => navigate('/orders/list')}
      >
        <div className="text-center">
          <List className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ver Lista Completa</span>
        </div>
      </div>
    </div>
  );

  const features = [
    {
      Icon: AlertCircle,
      name: 'O.S. em Aberto',
      description: `${openOrdersCount} ${openOrdersCount === 1 ? 'ordem aguardando' : 'ordens aguardando'} conclusão`,
      background: <OpenOrdersBackground count={openOrdersCount} />,
      className: 'lg:col-span-1 lg:row-span-1',
      cta: 'Ver Abertas',
      href: '#',
      onCtaClick: () => navigate('/orders/list?status=open')
    },
    {
      Icon: Clipboard,
      name: 'Últimas O.S. Criadas',
      description: 'Acompanhe as entradas mais recentes',
      background: <RecentOrdersList orders={recentOrders} />,
      className: 'lg:col-span-2 lg:row-span-2',
      cta: 'Ver Detalhes',
      href: '#'
    },
    {
      Icon: PlusCircle,
      name: 'Criar Nova Ordem',
      description: 'Clique para iniciar uma nova O.S.',
      background: <CreateOrderBackground />,
      className: 'lg:col-span-1 lg:row-span-1',
      cta: '',
      href: '#'
    },
    {
      Icon: List,
      name: 'Ver Lista Completa',
      description: 'Acesse todas as O.S. com filtros',
      background: <ViewAllBackground />,
      className: 'lg:col-span-1 lg:row-span-1',
      cta: '',
      href: '#'
    }
  ];

  return (
    <BentoGrid className="lg:grid-cols-3 lg:grid-rows-2">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
};

export default OrdersBentoGrid;
