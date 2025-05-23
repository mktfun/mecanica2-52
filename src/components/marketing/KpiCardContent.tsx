
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiCardContentProps {
  value: string;
  change: number;
  isPositive?: boolean;
  prevValue?: string;
  label?: string;
}

export const KpiCardContent: React.FC<KpiCardContentProps> = ({ 
  value, 
  change, 
  isPositive = true,
  prevValue,
  label
}) => {
  const actualIsPositive = isPositive ? change >= 0 : change < 0;
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {value}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center text-sm ${
              actualIsPositive ? 'text-green-600' : 'text-red-600'
            } cursor-help`}>
              {actualIsPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(change).toFixed(1)}% vs. anterior</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs">
              <p>Valor atual: {value}</p>
              {prevValue && <p>Valor anterior: {prevValue}</p>}
              {label && <p>{label}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
