
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { formatCurrency } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#2f54eb'];
const STATUS_COLORS = {
  'Novos Leads': '#1890ff',
  'Primeiro Contato': '#faad14',
  'Em Negociação': '#722ed1',
  'Agendados': '#52c41a',
  'Convertidos': '#eb2f96'
};

const LeadsReports: React.FC<LeadsReportsProps> = ({ data }) => {
  // Dados para gráfico de conversão por fonte
  const sourceData = data.bySource.map(item => ({
    name: item.source,
    total: item.total,
    convertidos: item.converted,
    taxa: parseFloat(item.rate.toFixed(2))
  }));
  
  // Dados para gráfico de funil
  const funnelData = data.funnel.map(item => ({
    name: item.stage,
    value: item.count
  }));
  
  // Dados para gráfico de eficiência por atendente
  const attendantData = data.byAttendant.map(item => ({
    name: item.attendant,
    taxa: parseFloat(item.rate.toFixed(2)),
    total: item.total,
    convertidos: item.converted
  }));
  
  return (
    <div className="space-y-6">
      {/* Cards com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de Leads */}
        <Card className="p-4 no-break">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total de Leads</p>
            <p className="text-2xl font-bold">{data.conversion.total}</p>
          </div>
        </Card>
        
        {/* Taxa de Conversão */}
        <Card className="p-4 no-break">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="text-2xl font-bold">{data.conversion.rate.toFixed(2)}%</p>
            <Progress value={data.conversion.rate} />
          </div>
        </Card>
        
        {/* Tempo Médio de Conversão */}
        <Card className="p-4 no-break">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tempo Médio de Conversão</p>
            <p className="text-2xl font-bold">{data.conversionTime.toFixed(1)} dias</p>
          </div>
        </Card>
      </div>
      
      {/* Gráfico de funil de conversão */}
      <Card className="p-4 no-break">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Funil de Conversão</h3>
          <p className="text-sm text-muted-foreground">Distribuição de leads por estágio do funil</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fontSize: 12 }} 
                />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Quantidade" 
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Detalhes do Funil em Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
            {funnelData.map((item, index) => (
              <Card key={index} className="p-3 flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: STATUS_COLORS[item.name] || COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">{item.value}</span>
                    <span className="text-muted-foreground text-sm">
                      {data.conversion.total > 0 ? 
                        ((item.value / data.conversion.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de conversão por fonte */}
        <Card className="p-4 no-break">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Conversão por Fonte</h3>
            <p className="text-sm text-muted-foreground">Taxa de conversão por origem do lead</p>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourceData}
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total de Leads" fill="#1890ff" />
                <Bar dataKey="convertidos" name="Leads Convertidos" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Gráfico de eficiência por atendente */}
        <Card className="p-4 no-break">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Eficiência por Atendente</h3>
            <p className="text-sm text-muted-foreground">Taxa de conversão por atendente</p>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendantData}
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="taxa" 
                  name="Taxa de Conversão (%)" 
                  stroke="#722ed1"
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Tabela de conversão por fonte */}
      <Card className="p-4 no-break">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Detalhamento por Fonte</h3>
          <p className="text-sm text-muted-foreground">Métricas detalhadas por fonte de lead</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonte</TableHead>
              <TableHead className="text-center">Total de Leads</TableHead>
              <TableHead className="text-center">Convertidos</TableHead>
              <TableHead className="text-right">Taxa de Conversão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.bySource.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.source}</TableCell>
                <TableCell className="text-center">{item.total}</TableCell>
                <TableCell className="text-center">{item.converted}</TableCell>
                <TableCell className="text-right">{item.rate.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      {/* Tabela de eficiência por atendente */}
      <Card className="p-4 no-break">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Desempenho por Atendente</h3>
          <p className="text-sm text-muted-foreground">Métricas de conversão por atendente</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atendente</TableHead>
              <TableHead className="text-center">Leads Atribuídos</TableHead>
              <TableHead className="text-center">Leads Convertidos</TableHead>
              <TableHead className="text-right">Taxa de Conversão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.byAttendant.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.attendant}</TableCell>
                <TableCell className="text-center">{item.total}</TableCell>
                <TableCell className="text-center">{item.converted}</TableCell>
                <TableCell className="text-right">{item.rate.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LeadsReports;
