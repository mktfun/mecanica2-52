
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle,
  ArrowLeft
} from 'lucide-react';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OrdersFilter from '@/components/orders/OrdersFilter';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useOrders } from '@/hooks/useOrders';

const OrdersList = () => {
  const navigate = useNavigate();
  
  const { 
    filters, 
    setFilters, 
    pagination, 
    setPagination, 
    getPaginatedOrders 
  } = useOrders();
  
  // Get paginated and filtered orders
  const { orders, total } = getPaginatedOrders();
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(total / pagination.pageSize);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    // Reset to first page when filters change
    setPagination({ ...pagination, page: 1 });
  };
  
  // Navigate to order details
  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  
  // Navigate to create new order
  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  // Go back to orders overview
  const handleBack = () => {
    navigate('/orders');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 h-auto">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Lista Completa de Ordens</h1>
        </div>
        <Button onClick={handleCreateOrder}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Ordem de Serviço
        </Button>
      </div>
      
      <OrdersFilter filters={filters} onFilterChange={handleFilterChange} />
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-md shadow p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma ordem de serviço encontrada</h3>
          <p className="text-gray-500 mb-6">
            {total === 0
              ? "Você ainda não tem nenhuma ordem de serviço cadastrada."
              : "Nenhuma ordem corresponde aos filtros selecionados."}
          </p>
          {total === 0 && (
            <Button onClick={handleCreateOrder}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar primeira ordem de serviço
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md shadow overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Veículo</TableHead>
                  <TableHead className="hidden lg:table-cell">Serviços</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow 
                    key={order.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <TableCell className="font-medium text-blue-600">
                      #{order.number}
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(order.created_at))}
                    </TableCell>
                    <TableCell>
                      {order.customer?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.vehicle ? (
                        <div>
                          <div>{order.vehicle.model}</div>
                          <div className="text-xs text-gray-500">{order.vehicle.plate}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {order.services && order.services.length > 0 ? (
                        <ul className="list-none text-sm">
                          {order.services.slice(0, 2).map((service, index) => (
                            <li key={index}>{service.name}</li>
                          ))}
                          {order.services.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{order.services.length - 2} mais
                            </li>
                          )}
                        </ul>
                      ) : (
                        'Nenhum serviço'
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Exibindo {orders.length} de {total} ordens
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm">
                  Página {pagination.page} de {totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersList;
