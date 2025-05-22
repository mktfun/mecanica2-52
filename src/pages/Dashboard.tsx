
import React, { useState, useEffect } from 'react';
import { 
  leadsStore, 
  appointmentsStore, 
  ordersStore, 
  financialStore 
} from '../services/localStorageService';
import { getDateRange } from '../utils/formatters';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { 
  RevenueCard, 
  LeadsCard, 
  AppointmentsCard, 
  OrdersCard,
  RevenueChart,
  LeadsConversionChart
} from '@/components/dashboard';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    revenue: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      previousMonth: 0
    },
    leads: {
      total: 0,
      converted: 0,
      pending: 0,
      conversionRate: 0
    },
    appointments: {
      today: 0,
      pending: 0
    },
    orders: {
      inProgress: 0,
      completed: 0,
      pending: 0
    }
  });
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // Carrega dados do dashboard do armazenamento local
  const loadDashboardData = () => {
    try {
      setIsLoading(true);
      
      // Obtém ranges de data para filtros
      const { 
        today, 
        thisWeekStart, 
        thisMonthStart, 
        previousMonthStart, 
        previousMonthEnd 
      } = getDateRange();
      
      // Carrega dados financeiros
      const financialData = financialStore.getAll();
      
      // Calcula receitas por período
      const dailyRevenue = calculateRevenue(financialData, today);
      const weeklyRevenue = calculateRevenue(financialData, thisWeekStart);
      const monthlyRevenue = calculateRevenue(financialData, thisMonthStart);
      const previousMonthRevenue = calculateRevenue(
        financialData, 
        previousMonthStart, 
        previousMonthEnd
      );
      
      // Carrega leads
      const leadsData = leadsStore.getAll();
      const totalLeads = leadsData.length;
      const convertedLeads = leadsData.filter(lead => lead.status === 'converted').length;
      const pendingLeads = leadsData.filter(lead => lead.status !== 'converted' && lead.status !== 'lost').length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      
      // Carrega agendamentos
      const appointmentsData = appointmentsStore.getAll();
      const todayAppointments = appointmentsData.filter(appointment => {
        const appointmentDate = new Date(appointment.start_time);
        return appointmentDate.toDateString() === today.toDateString();
      }).length;
      
      const pendingAppointments = appointmentsData.filter(
        appointment => appointment.status === 'scheduled'
      ).length;
      
      // Carrega ordens de serviço
      const ordersData = ordersStore.getAll();
      const inProgressOrders = ordersData.filter(
        order => order.status === 'in_progress'
      ).length;
      
      const completedOrders = ordersData.filter(
        order => order.status === 'completed'
      ).length;
      
      const pendingOrders = ordersData.filter(
        order => order.status === 'pending'
      ).length;
      
      // Atualiza estado com dados calculados
      setDashboardData({
        revenue: {
          daily: dailyRevenue,
          weekly: weeklyRevenue,
          monthly: monthlyRevenue,
          previousMonth: previousMonthRevenue
        },
        leads: {
          total: totalLeads,
          converted: convertedLeads,
          pending: pendingLeads,
          conversionRate
        },
        appointments: {
          today: todayAppointments,
          pending: pendingAppointments
        },
        orders: {
          inProgress: inProgressOrders,
          completed: completedOrders,
          pending: pendingOrders
        }
      });
      
      toast.success('Dados do dashboard atualizados');
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calcula receita para um período específico
  const calculateRevenue = (data: any[], startDate: Date, endDate = new Date()) => {
    return data
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .reduce((total, item) => total + (Number(item.amount) || 0), 0);
  };
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <RevenueCard data={dashboardData.revenue} />
        <LeadsCard data={dashboardData.leads} />
        <AppointmentsCard data={dashboardData.appointments} />
        <OrdersCard data={dashboardData.orders} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
        <LeadsConversionChart />
      </div>
      
      {/* Mensagem quando não há dados */}
      {!dashboardData.revenue.monthly && 
       !dashboardData.leads.total && 
       !dashboardData.appointments.today && 
       !dashboardData.orders.inProgress && (
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
