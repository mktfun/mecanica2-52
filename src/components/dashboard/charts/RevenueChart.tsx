
import React, { useState, useEffect } from 'react';
import { financialStore } from '@/services/localStorageService';
import { getDateRange, formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const RevenueChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    loadChartData();
  }, []);
  
  const loadChartData = () => {
    const financialData = financialStore.getAll();
    const { thisMonthStart } = getDateRange();
    
    // Filtra dados para o mês atual
    const monthData = financialData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= thisMonthStart;
    });
    
    // Agrupa por dia
    const dailyData: Record<string, number> = {};
    
    monthData.forEach(item => {
      const date = new Date(item.date);
      const day = date.getDate();
      
      if (!dailyData[day]) {
        dailyData[day] = 0;
      }
      
      dailyData[day] += Number(item.amount) || 0;
    });
    
    // Converte para array para o gráfico
    const formattedData = Object.entries(dailyData).map(([day, value]) => ({
      day: `Dia ${day}`,
      value
    }));
    
    // Ordena por dia
    formattedData.sort((a, b) => {
      const dayA = parseInt(a.day.replace('Dia ', ''));
      const dayB = parseInt(b.day.replace('Dia ', ''));
      return dayA - dayB;
    });
    
    setChartData(formattedData);
  };
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Faturamento Diário (Mês Atual)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length > 0 ? (
          <ChartContainer
            config={{
              revenue: {
                label: 'Faturamento',
                color: '#3b82f6'
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Sem dados para exibir</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-sm">
        <p className="font-semibold">{payload[0].payload.day}</p>
        <p className="text-blue-600">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }

  return null;
};

export default RevenueChart;
