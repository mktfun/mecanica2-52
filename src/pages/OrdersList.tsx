
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrdersFilter from '@/components/orders/OrdersFilter';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types/order';

const OrdersList = () => {
  const navigate = useNavigate();
  const { orders, isLoading } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.number.toString().includes(searchTerm) ||
        order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: string) => {
    navigate(`/orders/edit/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Carregando ordens de serviço...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        
        <Button onClick={() => navigate('/orders/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova OS
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Ordens</CardTitle>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, cliente ou veículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <OrdersFilter
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          )}
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {orders.length === 0 ? 'Nenhuma ordem de serviço encontrada' : 'Nenhuma ordem encontrada com os filtros aplicados'}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            OS #{order.number}
                          </Badge>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Cliente: </span>
                            {order.client?.name || 'Cliente não informado'}
                          </div>
                          <div>
                            <span className="font-medium">Veículo: </span>
                            {order.vehicle ? 
                              `${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.year || ''})` : 
                              'Veículo não informado'}
                          </div>
                          <div>
                            <span className="font-medium">Total: </span>
                            R$ {order.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                          </div>
                        </div>
                        
                        {order.description && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {order.description}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersList;
