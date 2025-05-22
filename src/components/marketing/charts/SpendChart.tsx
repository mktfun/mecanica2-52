
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SpendChartProps {
  googleData: Array<{ date: string; value: number }>;
  metaData: Array<{ date: string; value: number }>;
}

export const SpendChart: React.FC<SpendChartProps> = ({ googleData, metaData }) => {
  // Combinar os dados para exibição no gráfico
  const chartData = googleData.map((item, index) => {
    const metaItem = metaData[index] || { date: item.date, value: 0 };
    return {
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Google: item.value,
      Meta: metaItem.value
    };
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, undefined]} />
          <Legend />
          <Bar dataKey="Google" fill="#DB4437" name="Google Ads" />
          <Bar dataKey="Meta" fill="#1877F2" name="Meta Ads" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
