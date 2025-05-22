
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface AppointmentsCardProps {
  data: {
    today: number;
    pending: number;
  };
}

const AppointmentsCard = ({ data }: AppointmentsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.today}</div>
        <p className="text-xs text-muted-foreground mt-1">agendamentos hoje</p>
        
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pendentes</span>
            <span className="text-sm font-medium">{data.pending}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsCard;
