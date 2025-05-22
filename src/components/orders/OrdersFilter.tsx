
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { OrderStatus } from '@/types/order';

interface OrdersFilterProps {
  filters: {
    status: OrderStatus | 'all';
    dateRange: string;
    searchTerm: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (filters: Partial<OrdersFilterProps['filters']>) => void;
}

const OrdersFilter = ({ filters, onFilterChange }: OrdersFilterProps) => {
  return (
    <div className="bg-white p-4 rounded-md shadow mb-6 space-y-4">
      <div className="text-sm font-medium mb-2">Filtrar e ordenar</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFilterChange({ status: value as OrderStatus | 'all' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Em Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="waiting_parts">Aguardando Peças</SelectItem>
              <SelectItem value="waiting_approval">Aguardando Aprovação</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
              <SelectItem value="canceled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Período</label>
          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => onFilterChange({ dateRange: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Ordenar por</label>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="customer">Cliente</SelectItem>
              <SelectItem value="total">Valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Ordem</label>
          <Select 
            value={filters.sortOrder} 
            onValueChange={(value) => onFilterChange({ sortOrder: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Decrescente</SelectItem>
              <SelectItem value="asc">Crescente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Buscar</label>
          <Input
            type="text"
            placeholder="Buscar O.S., cliente, placa..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersFilter;
