import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  Check, 
  Clock, 
  PenLine, 
  Trash, 
  User, 
  Car, 
  Wrench, 
  FileText 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AppointmentDetailsDialogProps {
  appointment: {
    id: string;
    client_name: string;
    vehicle_info: string;
    service_type: string;
    start_time: string;
    end_time: string;
    mechanic_name: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const { toast } = useToast();
  
  const handleStatusChange = async (newStatus: 'scheduled' | 'in-progress' | 'completed' | 'cancelled') => {
    setIsLoading(true);
    
    try {
      // Simular uma chamada de API para atualizar o status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.add({
        title: 'Status atualizado',
        description: `O agendamento foi marcado como ${
          newStatus === 'scheduled' ? 'agendado' :
          newStatus === 'in-progress' ? 'em andamento' :
          newStatus === 'completed' ? 'concluído' : 'cancelado'
        }.`
      });
      
      // Fechar o modal e atualizar a lista
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.add({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do agendamento.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setShowCancelConfirm(false);
      setShowCompleteConfirm(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Agendado</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Em andamento</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Cancelado</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Agendado</Badge>;
    }
  };
  
  // Converter strings de data para objetos Date
  const startTime = parseISO(appointment.start_time);
  const endTime = parseISO(appointment.end_time);
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Detalhes do Agendamento</span>
              {getStatusBadge()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(startTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Horário</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(startTime, 'HH:mm')} às {format(endTime, 'HH:mm')}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Cliente</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {appointment.client_name}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Car className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Veículo</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {appointment.vehicle_info}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Wrench className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Serviço</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {appointment.service_type}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Mecânico</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {appointment.mechanic_name}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Observações</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma observação adicional.
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="flex gap-2">
              {appointment.status !== 'cancelled' && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isLoading}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {appointment.status === 'scheduled' && (
                <Button 
                  variant="default" 
                  onClick={() => handleStatusChange('in-progress')}
                  disabled={isLoading}
                >
                  <PenLine className="h-4 w-4 mr-1" />
                  Iniciar
                </Button>
              )}
              
              {appointment.status === 'in-progress' && (
                <Button 
                  variant="default" 
                  onClick={() => setShowCompleteConfirm(true)}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Concluir
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Fechar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter agendamento</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleStatusChange('cancelled')}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? 'Cancelando...' : 'Sim, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma que o serviço foi concluído? O agendamento será marcado como finalizado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, ainda em andamento</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleStatusChange('completed')}
              disabled={isLoading}
            >
              {isLoading ? 'Concluindo...' : 'Sim, concluir serviço'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentDetailsDialog;
