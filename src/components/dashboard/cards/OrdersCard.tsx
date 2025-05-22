
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface OrdersCardProps {
  data: {
    inProgress: number;
    completed: number;
    pending: number;
  };
}

const OrdersCard = ({ data }: OrdersCardProps) => {
  const total = data.inProgress + data.completed + data.pending;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.inProgress}</div>
        <p className="text-xs text-muted-foreground mt-1">em andamento</p>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pendentes</span>
            <span className="text-sm font-medium">{data.pending}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Concluídas</span>
            <span className="text-sm font-medium">{data.completed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersCard;
