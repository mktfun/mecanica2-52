
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  leadsStore, 
  appointmentsStore, 
  ordersStore, 
  financialStore 
} from '../services/localStorageService';
import { getDateRange } from '../utils/formatters';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { Calendar, Clipboard, Users, PlusCircle, BarChart } from 'lucide-react';

// Componentes dos cards Bento
import UpcomingAppointmentsCard from '@/components/dashboard/bento/UpcomingAppointmentsCard';
import OpenOrdersCard from '@/components/dashboard/bento/OpenOrdersCard';
import NewLeadsCard from '@/components/dashboard/bento/NewLeadsCard';
import QuickCreateOrderCard from '@/components/dashboard/bento/QuickCreateOrderCard';
import RevenueChartCard from '@/components/dashboard/bento/RevenueChartCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    revenue: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      previousMonth: 0
    },
    leads: [],
    appointments: [],
    orders: [],
    financialData: []
  });
  
  // Função para carregar dados do localStorage
  const loadDashboardData = React.useCallback(() => {
    console.log('Carregando dados do dashboard...');
    try {
      setIsLoading(true);
      
      // Carrega todos os dados
      const leadsData = leadsStore.getAll();
      const appointmentsData = appointmentsStore.getAll();
      const ordersData = ordersStore.getAll();
      const financialData = financialStore.getAll();
      
      console.log('Dados carregados:', {
        leads: leadsData.length,
        appointments: appointmentsData.length, 
        orders: ordersData.length,
        financial: financialData.length
      });
      
      // Obtém ranges de data para filtros
      const { 
        today, 
        thisWeekStart, 
        thisMonthStart, 
        previousMonthStart, 
        previousMonthEnd 
      } = getDateRange();
      
      // Calcula receitas por período
      const dailyRevenue = calculateRevenue(financialData, today);
      const weeklyRevenue = calculateRevenue(financialData, thisWeekStart);
      const monthlyRevenue = calculateRevenue(financialData, thisMonthStart);
      const previousMonthRevenue = calculateRevenue(
        financialData, 
        previousMonthStart, 
        previousMonthEnd
      );
      
      // Atualiza estado com dados calculados
      const newDashboardData = {
        revenue: {
          daily: dailyRevenue,
          weekly: weeklyRevenue,
          monthly: monthlyRevenue,
          previousMonth: previousMonthRevenue
        },
        leads: leadsData,
        appointments: appointmentsData,
        orders: ordersData,
        financialData
      };
      
      console.log('Dashboard data atualizada:', newDashboardData);
      setDashboardData(newDashboardData);
      
      toast.success('Dados do dashboard atualizados');
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Carrega dados na montagem do componente
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  // Calcula receita para um período específico
  const calculateRevenue = (data: any[], startDate: Date, endDate = new Date()) => {
    return data
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };

  const bentoCards = [
    {
      Icon: BarChart,
      name: 'Faturamento',
      description: 'Acompanhe o desempenho financeiro mensal',
      cta: 'Ver Relatórios Detalhados',
      background: <RevenueChartCard data={dashboardData.financialData} />,
      className: 'md:col-span-2 lg:row-span-2',
      onCtaClick: () => navigate('/reports')
    },
    {
      Icon: Clipboard,
      name: 'Ordens Abertas',
      description: 'Acompanhe as ordens de serviço em andamento',
      cta: 'Ver Todas as Ordens',
      background: <OpenOrdersCard data={dashboardData.orders} />,
      className: 'md:col-span-1',
      onCtaClick: () => navigate('/orders')
    },
    {
      Icon: Users,
      name: 'Novos Leads',
      description: 'Leads gerados na última semana',
      cta: 'Gerenciar Leads',
      background: <NewLeadsCard data={dashboardData.leads} />,
      className: 'md:col-span-1',
      onCtaClick: () => navigate('/leads')
    },
    {
      Icon: PlusCircle,
      name: 'Criar Nova OS',
      description: 'Inicie rapidamente uma nova ordem de serviço',
      cta: 'Criar Agora',
      background: <QuickCreateOrderCard />,
      className: 'md:col-span-1',
      onCtaClick: () => navigate('/orders/new')
    },
    {
      Icon: Calendar,
      name: 'Próximos Agendamentos',
      description: 'Veja os próximos compromissos agendados',
      cta: 'Ver Agenda Completa',
      background: <UpcomingAppointmentsCard data={dashboardData.appointments} />,
      className: 'md:col-span-2',
      onCtaClick: () => navigate('/appointments')
    }
  ];
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button 
          onClick={loadDashboardData}
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : 'Atualizar Dados'}
        </Button>
      </div>
      
      <BentoGrid className="mb-6">
        {bentoCards.map((card) => (
          <BentoCard key={card.name} {...card} />
        ))}
      </BentoGrid>
      
      {/* Mensagem quando não há dados */}
      {!dashboardData.revenue.monthly && 
       !dashboardData.leads.length && 
       !dashboardData.appointments.length && 
       !dashboardData.orders.length && (
        <div className="bg-blue-50 p-4 rounded-lg mt-6 text-center">
          <p className="text-blue-800">
            Não há dados para exibir. Comece adicionando clientes, leads, agendamentos e ordens de serviço.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
