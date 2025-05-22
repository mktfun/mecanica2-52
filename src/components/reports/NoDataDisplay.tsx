
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

const NoDataDisplay: React.FC = () => {
  return (
    <Card className="p-10 flex flex-col items-center justify-center text-center">
      <BarChart className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Não há dados suficientes para gerar relatórios</h3>
      <p className="text-gray-500 mb-4 max-w-md">
        Adicione leads, agendamentos e ordens de serviço para começar a visualizar relatórios e métricas de desempenho do seu negócio.
      </p>
    </Card>
  );
};

export default NoDataDisplay;
