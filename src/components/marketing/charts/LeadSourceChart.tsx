
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LeadSourceChartProps {
  leads: Array<{
    source: string;
    campaign: string | null;
    count: number;
  }>;
}

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ leads }) => {
  // Agrupar leads por fonte
  const leadsBySource = leads.reduce((acc: Record<string, number>, lead) => {
    const source = lead.source;
    if (!acc[source]) {
      acc[source] = 0;
    }
    acc[source] += lead.count;
    return acc;
  }, {});

  // Formatar dados para o gráfico
  const chartData = Object.entries(leadsBySource).map(([name, value]) => ({
    name: formatSourceName(name),
    value
  }));

  const COLORS = ['#DB4437', '#1877F2', '#34A853', '#FBBC05'];

  // Helper para formatar os nomes das fontes
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
    <div className="h-[250px] w-full">
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} leads`, undefined]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
