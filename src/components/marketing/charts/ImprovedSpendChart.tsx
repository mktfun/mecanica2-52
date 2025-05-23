
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ImprovedSpendChartProps {
  googleData: Array<{ date: string; value: number }>;
  metaData: Array<{ date: string; value: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{entry.dataKey}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              R$ {entry.value?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ImprovedSpendChart: React.FC<ImprovedSpendChartProps> = ({ googleData, metaData }) => {
  const chartData = googleData.map((item, index) => {
    const metaItem = metaData[index] || { date: item.date, value: 0 };
    return {
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Google: item.value,
      Meta: metaItem.value
    };
  });

  return (
    <div className="h-full w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            stroke="#9ca3af"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            fontSize={12}
            stroke="#9ca3af"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="Google" 
            name="Google Ads" 
            fill="#a7f3d0" 
            radius={[4, 4, 0, 0]}
            stroke="#10b981"
            strokeWidth={1}
          />
          <Bar 
            dataKey="Meta" 
            name="Meta Ads" 
            fill="#bfdbfe" 
            radius={[4, 4, 0, 0]}
            stroke="#3b82f6"
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
