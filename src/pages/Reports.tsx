
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import { appointmentStorage } from '@/services/appointmentService';
import { ordersStore } from '@/services/localStorageService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

import ReportFilters from '@/components/reports/ReportFilters';
import SalesReports from '@/components/reports/SalesReports';
import LeadsReports from '@/components/reports/LeadsReports';
import NoDataDisplay from '@/components/reports/NoDataDisplay';

const Reports = () => {
  // Estado para dados dos relatórios
  const [reportsData, setReportsData] = useState({
    sales: {
      byPeriod: [],
      byService: [],
      ticketAverage: 0,
      comparison: {
        current: 0,
        previous: 0,
        percentage: 0
      },
      topServices: []
    },
    leads: {
      conversion: {
        total: 0,
        converted: 0,
        rate: 0
      },
      bySource: [],
      conversionTime: 0,
      funnel: [],
      byAttendant: []
    }
  });
  
  // Estado para filtros
  const [filters, setFilters] = useState({
    dateRange: 'month', // 'day', 'week', 'month', 'year', 'custom'
    startDate: null,
    endDate: null,
    leadSource: 'all',
    serviceType: 'all'
  });
  
  // Estados para controles
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  
  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    loadReportsData();
  }, [filters]);
  
  // Função para carregar dados dos relatórios
  const loadReportsData = async () => {
    try {
      setIsLoading(true);
      
      // Obter intervalo de datas com base no filtro
      const dateRange = getFilterDateRange();
      
      // Carregar dados do armazenamento local
      const leads = enhancedLeadsStore.getAll();
      const appointments = appointmentStorage.getAll();
      const orders = ordersStore.getAll();
      
      // Verificar se há dados suficientes
      if (leads.length === 0 && appointments.length === 0 && orders.length === 0) {
        setHasData(false);
        setIsLoading(false);
        return;
      }
      
      setHasData(true);
      
      // Filtrar dados pelo intervalo de datas
      const filteredLeads = filterByDateRange(leads, dateRange.startDate, dateRange.endDate, 'created_at');
      const filteredAppointments = filterByDateRange(appointments, dateRange.startDate, dateRange.endDate, 'start_time');
      const filteredOrders = filterByDateRange(orders, dateRange.startDate, dateRange.endDate, 'created_at');
      
      // Filtrar por fonte de lead, se aplicável
      const leadSourceFiltered = filters.leadSource === 'all' 
        ? filteredLeads 
        : filteredLeads.filter(lead => lead.source === filters.leadSource);
      
      // Filtrar por tipo de serviço, se aplicável
      const serviceTypeFiltered = filters.serviceType === 'all'
        ? filteredOrders
        : filteredOrders.filter(order => order.service_type === filters.serviceType);
      
      // Calcular dados para relatórios de vendas
      const salesData = calculateSalesData(filteredOrders, serviceTypeFiltered, dateRange);
      
      // Calcular dados para relatórios de leads
      const leadsData = calculateLeadsData(leadSourceFiltered, filteredAppointments);
      
      // Atualizar estado com dados calculados
      setReportsData({
        sales: salesData,
        leads: leadsData
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast.error("Erro ao carregar dados dos relatórios");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para obter intervalo de datas com base no filtro
  const getFilterDateRange = () => {
    const now = new Date();
    let startDate, endDate;
    
    switch (filters.dateRange) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = filters.startDate ? new Date(filters.startDate) : new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = filters.endDate ? new Date(filters.endDate) : new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    return { startDate, endDate };
  };
  
  // Função para filtrar dados por intervalo de datas
  const filterByDateRange = (data, startDate, endDate, dateField) => {
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };
  
  // Função para calcular dados de vendas
  const calculateSalesData = (orders, filteredOrders, dateRange) => {
    // Este é um exemplo simplificado, usando dados de ordens de serviço como proxy para vendas
    
    // Faturamento total no período (usando o campo estimated_cost como proxy)
    const totalRevenue = filteredOrders.reduce((sum, order) => 
      sum + (typeof order.estimated_cost === 'number' ? order.estimated_cost : 0), 0);
    
    // Faturamento por tipo de serviço
    const revenueByService = {};
    filteredOrders.forEach(order => {
      const serviceType = order.service_type || 'Outros';
      if (!revenueByService[serviceType]) {
        revenueByService[serviceType] = 0;
      }
      revenueByService[serviceType] += (typeof order.estimated_cost === 'number' ? order.estimated_cost : 0);
    });
    
    const byService = Object.entries(revenueByService).map(([service, revenue]) => ({
      service,
      revenue: revenue as number
    }));
    
    // Ticket médio
    const ticketAverage = filteredOrders.length > 0 
      ? totalRevenue / filteredOrders.length 
      : 0;
    
    // Comparativo com período anterior
    // Calcular duração do período atual
    const periodDuration = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    
    // Calcular período anterior
    const previousStartDate = new Date(dateRange.startDate);
    previousStartDate.setTime(previousStartDate.getTime() - periodDuration);
    
    const previousEndDate = new Date(dateRange.endDate);
    previousEndDate.setTime(previousEndDate.getTime() - periodDuration);
    
    // Filtrar ordens do período anterior
    const previousOrders = filterByDateRange(orders, previousStartDate, previousEndDate, 'created_at');
    
    // Calcular faturamento do período anterior
    const previousRevenue = previousOrders.reduce((sum, order) => 
      sum + (typeof order.estimated_cost === 'number' ? order.estimated_cost : 0), 0);
    
    // Calcular variação percentual
    let percentageChange = 0;
    if (previousRevenue > 0) {
      percentageChange = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (totalRevenue > 0) {
      percentageChange = 100;
    }
    
    // Ranking de serviços mais lucrativos
    const topServices = [...byService].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    // Faturamento por período (diário, para gráfico)
    const byPeriod = [];
    const currentDate = new Date(dateRange.startDate);
    
    while (currentDate <= dateRange.endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayOrders = filterByDateRange(filteredOrders, dayStart, dayEnd, 'created_at');
      const dayRevenue = dayOrders.reduce((sum, order) => 
        sum + (typeof order.estimated_cost === 'number' ? order.estimated_cost : 0), 0);
      
      byPeriod.push({
        date: new Date(currentDate),
        revenue: dayRevenue
      });
      
      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      byPeriod,
      byService,
      ticketAverage,
      comparison: {
        current: totalRevenue,
        previous: previousRevenue,
        percentage: percentageChange
      },
      topServices
    };
  };
  
  // Função para calcular dados de leads
  const calculateLeadsData = (leads, appointments) => {
    // Este é um exemplo simplificado para relatórios de leads
    
    // Total de leads e convertidos
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    
    // Conversão por fonte
    const conversionBySource = {};
    const leadsBySource = {};
    
    leads.forEach(lead => {
      const source = lead.source || 'Outros';
      
      if (!leadsBySource[source]) {
        leadsBySource[source] = 0;
        conversionBySource[source] = 0;
      }
      
      leadsBySource[source]++;
      
      if (lead.status === 'converted') {
        conversionBySource[source]++;
      }
    });
    
    const bySource = Object.entries(leadsBySource).map(([source, total]) => ({
      source,
      total: total as number,
      converted: conversionBySource[source] || 0,
      rate: (total as number) > 0 ? ((conversionBySource[source] / (total as number)) * 100) : 0
    }));
    
    // Tempo médio de conversão (em dias)
    let totalConversionTime = 0;
    let convertedCount = 0;
    
    leads.forEach(lead => {
      if (lead.status === 'converted' && lead.status_changed_at && lead.created_at) {
        const createdDate = new Date(lead.created_at);
        const convertedDate = new Date(lead.status_changed_at);
        const timeDiff = convertedDate.getTime() - createdDate.getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        totalConversionTime += daysDiff;
        convertedCount++;
      }
    });
    
    const averageConversionTime = convertedCount > 0 
      ? totalConversionTime / convertedCount 
      : 0;
    
    // Funil de conversão
    const funnel = [
      { stage: 'Novos Leads', count: leads.filter(lead => lead.status === 'new').length },
      { stage: 'Primeiro Contato', count: leads.filter(lead => lead.status === 'contacted').length },
      { stage: 'Em Negociação', count: leads.filter(lead => lead.status === 'negotiation').length },
      { stage: 'Agendados', count: leads.filter(lead => lead.status === 'scheduled').length },
      { stage: 'Convertidos', count: convertedLeads }
    ];
    
    // Eficiência por atendente
    const byAttendant = {};
    
    leads.forEach(lead => {
      const attendant = lead.assigned_to || 'Não atribuído';
      
      if (!byAttendant[attendant]) {
        byAttendant[attendant] = {
          total: 0,
          converted: 0,
          rate: 0
        };
      }
      
      byAttendant[attendant].total++;
      
      if (lead.status === 'converted') {
        byAttendant[attendant].converted++;
      }
    });
    
    // Calcular taxa de conversão por atendente
    Object.keys(byAttendant).forEach(attendant => {
      const { total, converted } = byAttendant[attendant];
      byAttendant[attendant].rate = total > 0 ? (converted / total) * 100 : 0;
    });
    
    const attendantEfficiency = Object.entries(byAttendant).map(([attendant, data]) => ({
      attendant,
      ...(data as { total: number, converted: number, rate: number })
    }));
    
    return {
      conversion: {
        total: totalLeads,
        converted: convertedLeads,
        rate: conversionRate
      },
      bySource,
      conversionTime: averageConversionTime,
      funnel,
      byAttendant: attendantEfficiency
    };
  };
  
  // Função para atualizar filtros
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters
    });
  };
  
  // Função para exportar relatório em CSV
  const handleExportCSV = (reportType) => {
    try {
      let csvContent = '';
      let fileName = '';
      
      if (reportType === 'sales') {
        // Exportar relatório de vendas
        csvContent = 'Data,Faturamento\n';
        reportsData.sales.byPeriod.forEach(item => {
          const date = item.date.toLocaleDateString('pt-BR');
          csvContent += `${date},${item.revenue}\n`;
        });
        fileName = 'relatorio_vendas.csv';
      } else {
        // Exportar relatório de leads
        csvContent = 'Fonte,Total de Leads,Leads Convertidos,Taxa de Conversão\n';
        reportsData.leads.bySource.forEach(item => {
          csvContent += `${item.source},${item.total},${item.converted},${item.rate.toFixed(2)}%\n`;
        });
        fileName = 'relatorio_leads.csv';
      }
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar relatório. Por favor, tente novamente.');
    }
  };
  
  // Função para imprimir relatório
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Relatórios</h1>
          <p className="text-gray-500 dark:text-gray-400">Análise de desempenho de vendas e leads</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadReportsData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>
      
      <Card className="p-4 shadow-sm">
        <ReportFilters filters={filters} onFilterChange={handleFilterChange} />
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !hasData ? (
        <NoDataDisplay />
      ) : (
        <Tabs defaultValue="sales" className="w-full print:hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="sales">Relatórios de Vendas</TabsTrigger>
            <TabsTrigger value="leads">Relatórios de Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="mt-0">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportCSV('sales')}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
            <SalesReports data={reportsData.sales} />
          </TabsContent>
          
          <TabsContent value="leads" className="mt-0">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportCSV('leads')}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
            <LeadsReports data={reportsData.leads} />
          </TabsContent>
        </Tabs>
      )}
      
      <style>
        {`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .no-break {
            break-inside: avoid;
          }
        }
        `}
      </style>
    </div>
  );
};

export default Reports;
