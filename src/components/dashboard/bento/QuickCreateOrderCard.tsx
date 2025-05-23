
import React from 'react';
import { PlusCircle } from 'lucide-react';

const QuickCreateOrderCard = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
          <PlusCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Ação Rápida
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Criar uma nova ordem de serviço rapidamente
        </p>
      </div>
    </div>
  );
};

export default QuickCreateOrderCard;
