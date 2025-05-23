
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Users, ArrowUpRight, Clock, Filter, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KpiCardContent } from '../marketing/KpiCardContent';

interface LeadsReportData {
  conversion: {
    total: number;
    converted: number;
    rate: number;
  };
  bySource: Array<{
    source: string;
    total: number;
    converted: number;
    rate: number;
  }>;
  conversionTime: number;
  funnel: Array<{
    stage: string;
    count: number;
  }>;
  byAttendant: Array<{
    attendant: string;
    total: number;
    converted: number;
    rate: number;
  }>;
}

interface LeadsReportsProps {
  data: LeadsReportData;
}

// Custom tooltips for charts
const FunnelTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload[0]?.payload?.total || 0;
    const value = payload[0]?.value || 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Quantidade:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {value}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">% do total:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {percentage}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const SourceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {entry.value}
            </span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Taxa de conversão:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const EfficiencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Taxa de conversão:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].value.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Leads atribuídos:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].payload.total}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Leads convertidos:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].payload.convertidos}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Chart components
const ConversionFunnelChart = ({ data }: { data: Array<{ stage: string; count: number }>, total: number }) => {
  const chartData = data.map(item => ({
    name: item.stage,
    value: item.count,
    total: data[0].count
  }));
  
  const COLORS = {
    'Novos Leads': '#bfdbfe',
    'Primeiro Contato': '#fde68a',
    'Em Negociação': '#c7d2fe',
    'Agendados': '#a7f3d0',
    'Convertidos': '#fbb6ce'
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" fontSize={12} stroke="#9ca3af" />
        <YAxis 
          dataKey="name" 
          type="category"
          fontSize={12} 
          stroke="#9ca3af"
          width={100}
          tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
        />
        <Tooltip content={<FunnelTooltip />} />
        <Bar 
          dataKey="value" 
          name="Quantidade"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name as keyof typeof COLORS] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const SourceConversionChart = ({ data }: { data: Array<{ source: string; total: number; converted: number; rate: number }> }) => {
  const chartData = data.map(item => ({
    name: item.source,
    total: item.total,
    convertidos: item.converted,
    taxa: item.rate
  }));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis 
          dataKey="name" 
          fontSize={12} 
          stroke="#9ca3af"
          angle={-45}
          textAnchor="end"
          height={60}
          tickMargin={10}
        />
        <YAxis fontSize={12} stroke="#9ca3af" />
        <Tooltip content={<SourceTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Bar dataKey="total" name="Total de Leads" fill="#bfdbfe" radius={[4, 4, 0, 0]} stroke="#3b82f6" strokeWidth={1} />
        <Bar dataKey="convertidos" name="Leads Convertidos" fill="#a7f3d0" radius={[4, 4, 0, 0]} stroke="#10b981" strokeWidth={1} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const AttendantEfficiencyChart = ({ data }: { data: Array<{ attendant: string; total: number; converted: number; rate: number }> }) => {
  const chartData = data.map(item => ({
    name: item.attendant,
    taxa: item.rate,
    total: item.total,
    convertidos: item.converted
  }));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          fontSize={12} 
          stroke="#9ca3af"
          angle={-45}
          textAnchor="end"
          height={60}
          tickMargin={10}
        />
        <YAxis fontSize={12} stroke="#9ca3af" />
        <Tooltip content={<EfficiencyTooltip />} />
        <Line 
          type="monotone" 
          dataKey="taxa" 
          name="Taxa de Conversão (%)" 
          stroke="#c084fc"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const LeadsReports: React.FC<LeadsReportsProps> = ({ data }) => {
  // BentoGrid cards configuration
  const bentoCards = [
    {
      Icon: Users,
      name: 'Total de Leads',
      description: 'Leads gerados no período',
      background: (
        <KpiCardContent
          value={data.conversion.total.toString()}
          change={0}
          isPositive={true}
        />
      ),
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      Icon: ArrowUpRight,
      name: 'Taxa de Conversão',
      description: 'Percentual de leads convertidos',
      background: (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {data.conversion.rate.toFixed(1)}%
          </div>
          <Progress value={data.conversion.rate} className="w-full" />
          <div className="text-xs text-gray-500 mt-2">
            {data.conversion.converted} de {data.conversion.total} leads
          </div>
        </div>
      ),
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      Icon: Clock,
      name: 'Tempo de Conversão',
      description: 'Tempo médio para converter um lead',
      background: (
        <KpiCardContent
          value={`${data.conversionTime.toFixed(1)} dias`}
          change={0}
          isPositive={true}
        />
      ),
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      Icon: Filter,
      name: 'Funil de Conversão',
      description: 'Distribuição de leads por estágio',
      background: (
        <div className="h-full w-full p-4">
          <ConversionFunnelChart data={data.funnel} total={data.conversion.total} />
        </div>
      ),
      className: 'md:col-span-3 md:row-span-2',
    },
    {
      Icon: BarChart2,
      name: 'Conversão por Fonte',
      description: 'Desempenho de conversão por origem do lead',
      background: (
        <div className="h-full w-full p-4">
          <SourceConversionChart data={data.bySource} />
        </div>
      ),
      className: 'md:col-span-2 md:row-span-2',
    },
    {
      Icon: Activity,
      name: 'Eficiência por Atendente',
      description: 'Taxa de conversão por responsável',
      background: (
        <div className="h-full w-full p-4">
          <AttendantEfficiencyChart data={data.byAttendant} />
        </div>
      ),
      className: 'md:col-span-1 md:row-span-2',
    },
  ];

  return (
    <BentoGrid className="md:grid-cols-3">
      {bentoCards.map((card) => (
        <BentoCard key={card.name} {...card} cta="" onCtaClick={() => {}} />
      ))}
    </BentoGrid>
  );
};

export default LeadsReports;
