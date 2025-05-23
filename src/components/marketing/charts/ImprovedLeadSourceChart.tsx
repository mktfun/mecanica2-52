
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ImprovedLeadSourceChartProps {
  leads: Array<{
    source: string;
    campaign: string | null;
    count: number;
  }>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.payload.name}</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Leads:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.value}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Percentual:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const ImprovedLeadSourceChart: React.FC<ImprovedLeadSourceChartProps> = ({ leads }) => {
  const leadsBySource = leads.reduce((acc: Record<string, number>, lead) => {
    const source = lead.source;
    if (!acc[source]) {
      acc[source] = 0;
    }
    acc[source] += lead.count;
    return acc;
  }, {});

  const total = Object.values(leadsBySource).reduce((sum, value) => sum + value, 0);

  const chartData = Object.entries(leadsBySource).map(([name, value]) => ({
    name: formatSourceName(name),
    value,
    total
  }));

  const COLORS = ['#a7f3d0', '#bfdbfe', '#fde68a', '#fbb6ce', '#c7d2fe', '#d1fae5'];

  function formatSourceName(source: string): string {
    switch (source) {
      case 'google_ads':
        return 'Google Ads';
      case 'meta_ads':
        return 'Meta Ads';
      case 'direct':
        return 'Direto';
      case 'organic':
        return 'Orgânico';
      default:
        return source;
    }
  }

  return (
    <div className="h-full w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
