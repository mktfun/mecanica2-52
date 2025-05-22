
import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';

interface RevenueCardProps {
  data: {
    daily: number;
    weekly: number;
    monthly: number;
    previousMonth: number;
  };
}

const RevenueCard = ({ data }: RevenueCardProps) => {
  const growth = data.previousMonth > 0
    ? ((data.monthly - data.previousMonth) / data.previousMonth) * 100
    : 0;
  
  const isPositive = growth >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(data.monthly)}</div>
        
        <div className="flex items-center space-x-2 mt-4">
          {isPositive ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(growth).toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">
            vs. mês anterior
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Hoje</span>
            <span className="text-sm font-medium">{formatCurrency(data.daily)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Esta semana</span>
            <span className="text-sm font-medium">{formatCurrency(data.weekly)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueCard;
