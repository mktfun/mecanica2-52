
import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/order';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => {
  const getStatusDetails = (status: OrderStatus): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    switch (status) {
      case 'open':
        return { label: 'Em Aberto', variant: 'secondary' };
      case 'in_progress':
        return { label: 'Em Andamento', variant: 'default' };
      case 'completed':
        return { label: 'Concluída', variant: 'default' };
      case 'canceled':
        return { label: 'Cancelada', variant: 'destructive' };
      case 'waiting_parts':
        return { label: 'Aguardando Peças', variant: 'outline' };
      case 'waiting_approval':
        return { label: 'Aguardando Aprovação', variant: 'outline' };
      default:
        return { label: status, variant: 'outline' };
    }
  };

  const { label, variant } = getStatusDetails(status);
  
  const variantClasses = {
    'in_progress': 'bg-orange-500 hover:bg-orange-600 text-white',
    'completed': 'bg-green-500 hover:bg-green-600 text-white',
    'waiting_parts': 'bg-purple-500 hover:bg-purple-600 text-white',
    'waiting_approval': 'bg-yellow-500 hover:bg-yellow-600 text-black'
  };

  return (
    <Badge 
      variant={variant} 
      className={cn(
        "font-medium",
        status in variantClasses ? variantClasses[status as keyof typeof variantClasses] : "",
        className
      )}
    >
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;
