
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { DollarSign, Users, Target, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { KpiCardContent } from './KpiCardContent';
import { ImprovedSpendChart } from './charts/ImprovedSpendChart';
import { ImprovedLeadSourceChart } from './charts/ImprovedLeadSourceChart';
import { PerformanceMetrics } from './PerformanceMetrics';

// Dados mockados
const mockData = {
  overview: {
    totalSpend: 3200.50,
    totalLeads: 124,
    totalImpressions: 54750,
    totalClicks: 2340,
    averageCTR: 4.27,
    averageCPC: 1.37,
    averageCPL: 25.81,
    estimatedROI: 320
  },
  googleAds: {
    spend: 1950.30,
    impressions: 32450,
    clicks: 1450,
    leads: 72,
    ctr: 4.47,
    cpc: 1.34,
    cpl: 27.09,
    dailySpend: [
      { date: '2023-05-01', value: 65.50 },
      { date: '2023-05-02', value: 70.20 },
      { date: '2023-05-03', value: 58.90 },
      { date: '2023-05-04', value: 72.10 },
      { date: '2023-05-05', value: 67.80 },
      { date: '2023-05-06', value: 59.70 },
      { date: '2023-05-07', value: 63.20 }
    ]
  },
  metaAds: {
    spend: 1250.20,
    impressions: 22300,
    clicks: 890,
    leads: 52,
    ctr: 3.99,
    cpc: 1.40,
    cpl: 24.04,
    dailySpend: [
      { date: '2023-05-01', value: 45.20 },
      { date: '2023-05-02', value: 48.70 },
      { date: '2023-05-03', value: 41.30 },
      { date: '2023-05-04', value: 49.50 },
      { date: '2023-05-05', value: 43.90 },
      { date: '2023-05-06', value: 39.80 },
      { date: '2023-05-07', value: 42.60 }
    ]
  },
  leads: [
    { source: 'google_ads', campaign: 'servicos_verao', count: 42 },
    { source: 'google_ads', campaign: 'manutencao_preventiva', count: 30 },
    { source: 'meta_ads', campaign: 'promocao_troca_oleo', count: 28 },
    { source: 'meta_ads', campaign: 'revisao_completa', count: 24 },
    { source: 'direct', campaign: null, count: 18 },
    { source: 'organic', campaign: null, count: 12 }
  ]
};

export const MarketingDashboard = () => {
  const [dateRange, setDateRange] = useState('last_30_days');

  const features = [
    {
      Icon: DollarSign,
      name: 'Investimento Total',
      description: `R$ ${mockData.overview.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      background: (
        <KpiCardContent 
          value={`R$ ${mockData.overview.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={5.2}
          isPositive={false}
        />
      ),
      className: 'lg:col-span-1 lg:row-span-1',
      cta: 'Ver Detalhes',
      href: '#'
    },
    {
      Icon: Users,
      name: 'Leads Gerados',
      description: `${mockData.overview.totalLeads} leads`,
      background: (
        <KpiCardContent 
          value={mockData.overview.totalLeads.toString()}
          change={12.5}
          isPositive={true}
        />
      ),
      className: 'lg:col-span-1 lg:row-span-1',
      cta: 'Ver Leads',
      href: '#'
    },
    {
      Icon: Target,
      name: 'Custo por Lead (CPL)',
      description: `R$ ${mockData.overview.averageCPL.toFixed(2)}`,
      background: (
        <KpiCardContent 
          value={`R$ ${mockData.overview.averageCPL.toFixed(2)}`}
          change={3.1}
          isPositive={false}
        />
      ),
      className: 'lg:col-span-1 lg:row-span-1',
      cta: 'Analisar',
      href: '#'
    },
    {
      Icon: TrendingUp,
      name: 'ROI Estimado',
      description: `${mockData.overview.estimatedROI}%`,
      background: (
        <KpiCardContent 
          value={`${mockData.overview.estimatedROI}%`}
          change={8.7}
          isPositive={true}
        />
      ),
      className: 'lg:col-span-1 lg:row-span-1',
      cta: 'Ver ROI',
      href: '#'
    },
    {
      Icon: BarChart3,
      name: 'Gastos por Plataforma',
      description: 'Investimento diário Google Ads vs Meta Ads',
      background: (
        <ImprovedSpendChart 
          googleData={mockData.googleAds.dailySpend} 
          metaData={mockData.metaAds.dailySpend} 
        />
      ),
      className: 'lg:col-span-2 lg:row-span-2',
      cta: 'Ver Relatório',
      href: '#'
    },
    {
      Icon: PieChart,
      name: 'Origem dos Leads',
      description: 'Distribuição das fontes de leads',
      background: (
        <ImprovedLeadSourceChart leads={mockData.leads} />
      ),
      className: 'lg:col-span-1 lg:row-span-2',
      cta: 'Analisar Fontes',
      href: '#'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="yesterday">Ontem</SelectItem>
            <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
            <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
            <SelectItem value="this_month">Este mês</SelectItem>
            <SelectItem value="last_month">Último mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BentoGrid className="lg:grid-cols-3 lg:grid-rows-3 auto-rows-[12rem]">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>

      <PerformanceMetrics 
        googleData={mockData.googleAds} 
        metaData={mockData.metaAds} 
      />
    </div>
  );
};
