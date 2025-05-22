
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface LeadsCardProps {
  data: {
    total: number;
    converted: number;
    pending: number;
    conversionRate: number;
  };
}

const LeadsCard = ({ data }: LeadsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Leads</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.total}</div>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${data.conversionRate}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">
            {data.conversionRate.toFixed(1)}%
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Convertidos</span>
            <span className="text-sm font-medium">{data.converted}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pendentes</span>
            <span className="text-sm font-medium">{data.pending}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsCard;
