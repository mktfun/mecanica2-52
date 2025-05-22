
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#2f54eb'];

const SalesReports: React.FC<SalesReportsProps> = ({ data }) => {
  // Formatar dados para gráfico de área (faturamento por período)
  const chartData = data.byPeriod.map(item => ({
    name: item.date.toLocaleDateString('pt-BR'),
    valor: item.revenue
  }));
  
  // Dados para gráfico de barras (faturamento por serviço)
  const barData = data.byService.map(item => ({
    name: item.service,
    valor: item.revenue
  }));
  
  // Dados para gráfico de pizza (top serviços)
  const pieData = data.topServices.map(item => ({
    name: item.service,
    value: item.revenue
  }));
  
  const formatTooltipValue = (value) => {
    return formatCurrency(value);
  };
  
  return (
    <div className="space-y-6">
      {/* Cards com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Faturamento Total */}
        <Card className="p-4 no-break">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Faturamento Total</p>
            <p className="text-2xl font-bold">{formatCurrency(data.comparison.current)}</p>
            
            {data.comparison.percentage !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${data.comparison.percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.comparison.percentage >= 0 ? 
                  <ArrowUp className="h-4 w-4" /> : 
                  <ArrowDown className="h-4 w-4" />}
                <span>{Math.abs(data.comparison.percentage).toFixed(2)}% vs. período anterior</span>
              </div>
            )}
          </div>
        </Card>
        
        {/* Ticket Médio */}
        <Card className="p-4 no-break">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold">{formatCurrency(data.ticketAverage)}</p>
          </div>
        </Card>
        
        {/* Total de Serviços */}
        <Card className="p-4 no-break">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Serviços Realizados</p>
            <p className="text-2xl font-bold">{data.byPeriod.length}</p>
          </div>
        </Card>
      </div>
      
      {/* Gráfico de faturamento por período */}
      <Card className="p-4 no-break">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Faturamento por Período</h3>
          <p className="text-sm text-muted-foreground">Evolução do faturamento no período selecionado</p>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatTooltipValue} />
              <Tooltip formatter={formatTooltipValue} />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke="#1890ff" 
                fill="#1890ff" 
                fillOpacity={0.3}
                name="Faturamento" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de faturamento por serviço */}
        <Card className="p-4 no-break">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Faturamento por Serviço</h3>
            <p className="text-sm text-muted-foreground">Comparativo de faturamento por tipo de serviço</p>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  tick={{ fontSize: 12 }} 
                />
                <YAxis tickFormatter={formatTooltipValue} />
                <Tooltip formatter={formatTooltipValue} />
                <Bar 
                  dataKey="valor" 
                  fill="#52c41a" 
                  name="Faturamento" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Gráfico de top serviços */}
        <Card className="p-4 no-break">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Top Serviços Mais Lucrativos</h3>
            <p className="text-sm text-muted-foreground">Serviços com maior faturamento no período</p>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltipValue} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Tabela de faturamento por serviço */}
      <Card className="p-4 no-break">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Detalhamento por Serviço</h3>
          <p className="text-sm text-muted-foreground">Faturamento detalhado por tipo de serviço</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Faturamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.byService.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.service}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SalesReports;
