
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketingOverview } from './MarketingOverview';
import { SpendChart } from './charts/SpendChart';
import { LeadSourceChart } from './charts/LeadSourceChart';
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

      <MarketingOverview data={mockData.overview} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gastos por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendChart 
              googleData={mockData.googleAds.dailySpend} 
              metaData={mockData.metaAds.dailySpend} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Origem dos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSourceChart leads={mockData.leads} />
          </CardContent>
        </Card>
      </div>

      <PerformanceMetrics 
        googleData={mockData.googleAds} 
        metaData={mockData.metaAds} 
      />
    </div>
  );
};
