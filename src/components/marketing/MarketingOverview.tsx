
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketingOverviewProps {
  data: {
    totalSpend: number;
    totalLeads: number;
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    averageCPC: number;
    averageCPL: number;
    estimatedROI: number;
  };
}

export const MarketingOverview: React.FC<MarketingOverviewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <OverviewCard
        title="Investimento Total"
        value={`R$ ${data.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        change={5.2}
        isPositive={false}
      />
      
      <OverviewCard
        title="Leads Gerados"
        value={data.totalLeads.toString()}
        change={12.5}
        isPositive={true}
      />
      
      <OverviewCard
        title="Custo por Lead (CPL)"
        value={`R$ ${data.averageCPL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        change={3.1}
        isPositive={true}
      />
      
      <OverviewCard
        title="ROI Estimado"
        value={`${data.estimatedROI}%`}
        change={8.7}
        isPositive={true}
      />
    </div>
  );
};

interface OverviewCardProps {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, change, isPositive }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-2xl font-bold mt-2 mb-1">{value}</div>
        <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span>{change}% vs. período anterior</span>
        </div>
      </CardContent>
    </Card>
  );
};
