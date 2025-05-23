
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Order, OrderStatus } from '@/types/order';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Printer,
  FileText,
  Send,
  Play,
  CheckCircle,
  Clock,
  Ban,
  ShoppingBag 
} from 'lucide-react';

interface OrderActionsProps {
  order: Order;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: OrderStatus) => void;
  onPrint: () => void;
  onExportPDF: () => void;
  onSendToCustomer: () => void;
}

const OrderActions = ({ 
  order, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onPrint,
  onExportPDF,
  onSendToCustomer
}: OrderActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Define available status transitions based on current status
  const getAvailableStatusTransitions = (): { status: OrderStatus, label: string, icon: React.ReactNode }[] => {
    switch (order.status) {
      case 'open':
        return [
          { status: 'in_progress', label: 'Iniciar Serviço', icon: <Play className="h-4 w-4 mr-2" /> },
          { status: 'waiting_approval', label: 'Aguardando Aprovação', icon: <Clock className="h-4 w-4 mr-2" /> },
          { status: 'cancelled', label: 'Cancelar', icon: <Ban className="h-4 w-4 mr-2" /> }
        ];
      case 'in_progress':
        return [
          { status: 'completed', label: 'Concluir', icon: <CheckCircle className="h-4 w-4 mr-2" /> },
          { status: 'waiting_parts', label: 'Aguardando Peças', icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
          { status: 'open', label: 'Voltar para Em Aberto', icon: <Clock className="h-4 w-4 mr-2" /> }
        ];
      case 'waiting_parts':
        return [
          { status: 'in_progress', label: 'Retomar Serviço', icon: <Play className="h-4 w-4 mr-2" /> },
          { status: 'cancelled', label: 'Cancelar', icon: <Ban className="h-4 w-4 mr-2" /> }
        ];
      case 'waiting_approval':
        return [
          { status: 'in_progress', label: 'Iniciar Serviço', icon: <Play className="h-4 w-4 mr-2" /> },
          { status: 'cancelled', label: 'Cancelar', icon: <Ban className="h-4 w-4 mr-2" /> }
        ];
      case 'completed':
        return [
          { status: 'in_progress', label: 'Reabrir Serviço', icon: <Play className="h-4 w-4 mr-2" /> }
        ];
      case 'cancelled':
        return [
          { status: 'open', label: 'Reativar', icon: <Play className="h-4 w-4 mr-2" /> }
        ];
      default:
        return [];
    }
  };

  const availableTransitions = getAvailableStatusTransitions();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ações da Ordem</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          <span>Editar</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
        
        {availableTransitions.map((transition) => (
          <DropdownMenuItem 
            key={transition.status}
            onClick={() => {
              onStatusChange(transition.status);
              setIsOpen(false);
            }}
          >
            {transition.icon}
            <span>{transition.label}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onPrint}>
          <Printer className="h-4 w-4 mr-2" />
          <span>Imprimir</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          <span>Exportar PDF</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onSendToCustomer}>
          <Send className="h-4 w-4 mr-2" />
          <span>Enviar para Cliente</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActions;
