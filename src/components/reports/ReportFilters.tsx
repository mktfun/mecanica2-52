
import React, { useState, useEffect } from 'react';
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import { ordersStore } from '@/services/localStorageService';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportFiltersProps {
  filters: {
    dateRange: string;
    startDate: string | null;
    endDate: string | null;
    leadSource: string;
    serviceType: string;
  };
  onFilterChange: (filters: Partial<ReportFiltersProps['filters']>) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFilterChange }) => {
  const [filterOptions, setFilterOptions] = useState({
    leadSources: [] as string[],
    serviceTypes: [] as string[]
  });
  
  // Carregar opções de filtro
  useEffect(() => {
    loadFilterOptions();
  }, []);
  
  const loadFilterOptions = () => {
    try {
      // Carregar fontes de leads únicas
      const leads = enhancedLeadsStore.getAll();
      const leadSources = [...new Set(leads.map(lead => lead.source))].filter(Boolean);
      
      // Carregar tipos de serviço únicos
      const orders = ordersStore.getAll();
      const serviceTypes = [...new Set(orders.map(order => order.service_type))].filter(Boolean);
      
      setFilterOptions({
        leadSources,
        serviceTypes
      });
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    }
  };
  
  const handleDateRangeChange = (value: string) => {
    // Resetar datas personalizadas se não for intervalo personalizado
    if (value !== 'custom') {
      onFilterChange({
        dateRange: value,
        startDate: null,
        endDate: null
      });
    } else {
      onFilterChange({
        dateRange: value
      });
    }
  };
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      [name]: value
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="space-y-2">
        <Label htmlFor="dateRange">Período</Label>
        <Select 
          value={filters.dateRange} 
          onValueChange={handleDateRangeChange}
        >
          <SelectTrigger id="dateRange">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filters.dateRange === 'custom' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="startDate">Data inicial</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={handleCustomDateChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Data final</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={handleCustomDateChange}
            />
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="leadSource">Fonte de Lead</Label>
        <Select 
          value={filters.leadSource} 
          onValueChange={(value) => onFilterChange({ leadSource: value })}
        >
          <SelectTrigger id="leadSource">
            <SelectValue placeholder="Todas as fontes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fontes</SelectItem>
            {filterOptions.leadSources.map((source, index) => (
              <SelectItem key={index} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="serviceType">Tipo de Serviço</Label>
        <Select 
          value={filters.serviceType} 
          onValueChange={(value) => onFilterChange({ serviceType: value })}
        >
          <SelectTrigger id="serviceType">
            <SelectValue placeholder="Todos os serviços" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os serviços</SelectItem>
            {filterOptions.serviceTypes.map((type, index) => (
              <SelectItem key={index} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilters;
