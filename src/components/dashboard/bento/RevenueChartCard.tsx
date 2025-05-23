
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface RevenueData {
  date: string;
  amount: number;
}

interface RevenueChartCardProps {
  data: RevenueData[];
}

const RevenueChartCard = ({ data }: RevenueChartCardProps) => {
  // Processa dados para o gráfico mensal
  const processMonthlyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    // Agrupa por semana do mês
    const weeklyData: Record<string, number> = {};
    
    monthlyData.forEach(item => {
      const itemDate = new Date(item.date);
      const weekOfMonth = Math.ceil(itemDate.getDate() / 7);
      const weekKey = `Semana ${weekOfMonth}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += Number(item.amount) || 0;
    });

    return Object.entries(weeklyData).map(([week, value]) => ({
      name: week,
      value
    }));
  };

  const chartData = processMonthlyData();
  const totalRevenue = chartData.reduce((total, item) => total + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {payload[0].payload.name}
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Faturamento Mensal
        </h4>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {formatCurrency(totalRevenue)}
        </p>
      </div>
      
      <div className="h-48">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Sem dados para exibir
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChartCard;
