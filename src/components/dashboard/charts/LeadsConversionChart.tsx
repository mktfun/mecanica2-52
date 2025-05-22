
import React, { useState, useEffect } from 'react';
import { leadsStore } from '@/services/localStorageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const LeadsConversionChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    loadChartData();
  }, []);
  
  const loadChartData = () => {
    const leadsData = leadsStore.getAll();
    
    // Conta os leads por status
    const statusCounts: Record<string, number> = {
      converted: 0,
      pending: 0,
      lost: 0
    };
    
    leadsData.forEach(lead => {
      const status = lead.status || 'pending';
      
      if (status === 'converted') {
        statusCounts.converted += 1;
      } else if (status === 'lost') {
        statusCounts.lost += 1;
      } else {
        statusCounts.pending += 1;
      }
    });
    
    // Converte para array para o gráfico
    const formattedData = [
      { name: 'Convertidos', value: statusCounts.converted, color: '#22c55e' },
      { name: 'Pendentes', value: statusCounts.pending, color: '#3b82f6' },
      { name: 'Perdidos', value: statusCounts.lost, color: '#ef4444' }
    ].filter(item => item.value > 0);
    
    setChartData(formattedData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversão de Leads</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length > 0 ? (
          <ChartContainer
            config={{
              converted: { label: 'Convertidos', color: '#22c55e' },
              pending: { label: 'Pendentes', color: '#3b82f6' },
              lost: { label: 'Perdidos', color: '#ef4444' }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip />
              </PieChart>
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

export default LeadsConversionChart;
