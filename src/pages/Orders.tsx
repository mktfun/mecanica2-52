
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import OrdersBentoGrid from '@/components/orders/OrdersBentoGrid';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'sonner';

const Orders = () => {
  const navigate = useNavigate();
  const { fetchOrders, isLoading, error } = useOrders();

  // Buscar dados ao montar o componente
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Exibir erro se houver
  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar ordens de serviço', {
        description: error
      });
    }
  }, [error]);

  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
        <Button onClick={handleCreateOrder}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Ordem de Serviço
        </Button>
      </div>
      
      <OrdersBentoGrid />
    </div>
  );
};

export default Orders;
