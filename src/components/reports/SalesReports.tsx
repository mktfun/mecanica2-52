
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { 
  AreaChart, 
  Area, 
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
  ResponsiveContainer 
} from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, CreditCard, Wrench, LineChart, BarChart2, PieChart as PieChartIcon, List } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KpiCardContent } from '../marketing/KpiCardContent';

interface SalesReportData {
  byPeriod: Array<{
    date: Date;
    revenue: number;
  }>;
  byService: Array<{
    service: string;
    revenue: number;
  }>;
  ticketAverage: number;
  comparison: {
    current: number;
    previous: number;
    percentage: number;
  };
  topServices: Array<{
    service: string;
    revenue: number;
  }>;
}

interface SalesReportsProps {
  data: SalesReportData;
}

// Custom tooltips for charts
const RevenueChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Faturamento:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const ServiceChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload[0]?.payload?.total || 0;
    const value = payload[0]?.value || 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Valor:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(value)}
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

const PieChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{payload[0].name}</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-gray-300">Valor:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(payload[0].value)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">% do total:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {`${(payload[0].percent * 100).toFixed(1)}%`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Chart components
const RevenueByPeriodChart = ({ data }: { data: Array<{ date: Date; revenue: number }> }) => {
  const chartData = data.map(item => ({
    name: item.date.toLocaleDateString('pt-BR'),
    valor: item.revenue
  }));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" />
        <YAxis fontSize={12} stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip content={<RevenueChartTooltip />} />
        <Area 
          type="monotone" 
          dataKey="valor" 
          stroke="#8884d8" 
          fill="#c7d2fe" 
          strokeWidth={2}
          name="Faturamento"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const ServiceRevenueChart = ({ data }: { data: Array<{ service: string; revenue: number }> }) => {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);
  const chartData = data.map(item => ({
    name: item.service,
    valor: item.revenue,
    total
  }));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis 
          dataKey="name" 
          fontSize={12} 
          stroke="#9ca3af"
          angle={-45}
          textAnchor="end"
          height={70}
          tickMargin={20}
        />
        <YAxis fontSize={12} stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip content={<ServiceChartTooltip />} />
        <Bar 
          dataKey="valor" 
          fill="#a7f3d0" 
          radius={[4, 4, 0, 0]}
          stroke="#10b981"
          strokeWidth={1}
          name="Faturamento"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const TopServicesChart = ({ data }: { data: Array<{ service: string; revenue: number }> }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[...data].reverse()}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" fontSize={12} stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
        <YAxis 
          type="category" 
          dataKey="service" 
          fontSize={12} 
          stroke="#9ca3af" 
          width={80}
          tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
        />
        <Tooltip content={<ServiceChartTooltip />} />
        <Bar 
          dataKey="revenue" 
          fill="#bfdbfe" 
          radius={[0, 4, 4, 0]}
          stroke="#3b82f6"
          strokeWidth={1}
          name="Faturamento"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const ServiceDetailChart = ({ data }: { data: Array<{ service: string; revenue: number }> }) => {
  const COLORS = ['#a7f3d0', '#bfdbfe', '#fde68a', '#fbb6ce', '#c7d2fe', '#d1fae5'];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={30}
          fill="#8884d8"
          dataKey="revenue"
          nameKey="service"
          label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const SalesReports: React.FC<SalesReportsProps> = ({ data }) => {
  // BentoGrid cards configuration
  const bentoCards = [
    {
      Icon: DollarSign,
      name: 'Faturamento Total',
      description: 'Valor total faturado no período',
      background: (
        <KpiCardContent
          value={formatCurrency(data.comparison.current)}
          change={data.comparison.percentage}
          prevValue={formatCurrency(data.comparison.previous)}
        />
      ),
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      Icon: CreditCard,
      name: 'Ticket Médio',
      description: 'Valor médio por serviço',
      background: (
        <KpiCardContent
          value={formatCurrency(data.ticketAverage)}
          change={0}
          isPositive={true}
        />
      ),
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      Icon: Wrench,
      name: 'Serviços Realizados',
      description: 'Quantidade de serviços no período',
      background: (
        <KpiCardContent
          value={data.byPeriod.length.toString()}
          change={0}
          isPositive={true}
        />
      ),
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      Icon: LineChart,
      name: 'Faturamento por Período',
      description: 'Evolução do faturamento no período selecionado',
      background: (
        <div className="h-full w-full p-4">
          <RevenueByPeriodChart data={data.byPeriod} />
        </div>
      ),
      className: 'md:col-span-3 md:row-span-2',
    },
    {
      Icon: BarChart2,
      name: 'Faturamento por Serviço',
      description: 'Comparativo de faturamento por tipo de serviço',
      background: (
        <div className="h-full w-full p-4">
          <ServiceRevenueChart data={data.byService} />
        </div>
      ),
      className: 'md:col-span-2 md:row-span-2',
    },
    {
      Icon: List,
      name: 'Top Serviços',
      description: 'Serviços com maior faturamento',
      background: (
        <div className="h-full w-full p-4">
          <TopServicesChart data={data.topServices} />
        </div>
      ),
      className: 'md:col-span-1 md:row-span-2',
    },
    {
      Icon: PieChartIcon,
      name: 'Detalhamento por Serviço',
      description: 'Distribuição percentual do faturamento',
      background: (
        <div className="h-full w-full p-4">
          <ServiceDetailChart data={data.topServices} />
        </div>
      ),
      className: 'md:col-span-3 md:row-span-2',
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

export default SalesReports;
