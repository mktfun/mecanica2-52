
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Appointment } from '@/types/appointment';
import { AppointmentForm } from './AppointmentForm';
import { useAppointments } from '@/hooks/useAppointments';
import { formatDateTime } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface AppointmentDetailsDialogProps {
  appointment: Appointment;
  isOpen?: boolean;
  onClose?: () => void;
  onUpdate?: () => void;
}

export default function AppointmentDetailsDialog({ 
  appointment,
  isOpen,
  onClose,
  onUpdate
}: AppointmentDetailsDialogProps) {
  const [open, setOpen] = useState(isOpen || false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { updateAppointment, updateAppointmentStatus, removeAppointment } = useAppointments();
  
  // Create a simple conflict checker that matches the expected signature
  const checkConflicts = (appointmentData: Partial<Appointment>, excludeId?: string): boolean => {
    if (!appointmentData.start_time || !appointmentData.end_time) {
      return false;
    }
    
    const startTime = new Date(appointmentData.start_time);
    const endTime = new Date(appointmentData.end_time);
    
    // Simple check - you might want to implement actual conflict detection here
    return false;
  };
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'in-progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };
  
  const handleUpdateStatus = (status: Appointment['status']) => {
    updateAppointmentStatus(appointment.id, status);
    if (onUpdate) {
      onUpdate();
    }
  };
  
  const handleSubmit = (appointmentData: Partial<Appointment>) => {
    const updated = updateAppointment(appointment.id, appointmentData);
    
    if (updated) {
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    }
  };
  
  const handleDelete = () => {
    if (removeAppointment(appointment.id)) {
      handleClose();
      if (onUpdate) {
        onUpdate();
      }
    }
    setShowDeleteAlert(false);
  };
  
  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    if (onClose) {
      onClose();
    }
  };

  const clientName = appointment.client?.name || 'Cliente não especificado';
  const clientPhone = appointment.client?.phone || 'Não informado';
  const clientEmail = appointment.client?.email || 'Não informado';
  const vehicleInfo = appointment.vehicle 
    ? `${appointment.vehicle.make} ${appointment.vehicle.model} ${appointment.vehicle.year ? `(${appointment.vehicle.year})` : ''}`
    : 'Veículo não especificado';
  
  const renderAppointmentDetails = () => (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
            <p className="text-base">{clientName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
            <p className="text-base">{clientPhone}</p>
          </div>
          
          {appointment.client?.email && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="text-base">{clientEmail}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Veículo</h3>
            <p className="text-base">{vehicleInfo}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Serviço</h3>
            <p className="text-base">{appointment.service_type}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Mecânico</h3>
            <p className="text-base">{appointment.mechanic_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Início</h3>
            <p className="text-base">{formatDateTime(new Date(appointment.start_time))}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Término</h3>
            <p className="text-base">{formatDateTime(new Date(appointment.end_time))}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>
          
          {appointment.estimated_cost && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor Estimado</h3>
              <p className="text-base">{appointment.estimated_cost.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}</p>
            </div>
          )}
          
          {appointment.service_description && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Descrição do Serviço</h3>
              <p className="text-base">{appointment.service_description}</p>
            </div>
          )}
          
          {appointment.notes && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Observações</h3>
              <p className="text-base">{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {appointment.status === 'scheduled' && (
            <Button 
              onClick={() => handleUpdateStatus('in-progress')}
              variant="outline"
              className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
            >
              Iniciar Serviço
            </Button>
          )}
          
          {appointment.status === 'in-progress' && (
            <Button 
              onClick={() => handleUpdateStatus('completed')}
              variant="outline"
              className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
            >
              Marcar como Concluído
            </Button>
          )}
          
          {(appointment.status === 'scheduled' || appointment.status === 'in-progress') && (
            <Button 
              onClick={() => handleUpdateStatus('cancelled')}
              variant="outline"
              className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
            >
              Cancelar
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteAlert(true)}>
            Excluir
          </Button>
        </div>
      </div>
    </>
  );
  
  return (
    <>
      <Dialog open={isOpen !== undefined ? isOpen : open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setIsEditing(false);
          if (onClose) {
            onClose();
          }
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Agendamento" : "Detalhes do Agendamento"}</DialogTitle>
          </DialogHeader>
          
          {isEditing ? (
            <AppointmentForm 
              initialData={appointment} 
              onSubmit={handleSubmit} 
              onCancel={() => setIsEditing(false)}
              checkConflicts={checkConflicts}
            />
          ) : renderAppointmentDetails()}
          
          {!isEditing && (
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
