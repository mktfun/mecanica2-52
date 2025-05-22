
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentForm } from './AppointmentForm';
import { Appointment } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';
import { Lead } from '@/types/lead';
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import { useStorageData } from '@/hooks/useStorageData';

interface CreateAppointmentDialogProps {
  selectedDate: Date;
  isOpen?: boolean;
  onClose?: () => void;
  onCreated?: (appointment: Appointment) => void;
}

export default function CreateAppointmentDialog({ 
  selectedDate,
  isOpen,
  onClose,
  onCreated
}: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(isOpen || false);
  const { addAppointment, checkForTimeConflicts } = useAppointments();
  const leads = useStorageData<Lead>(enhancedLeadsStore);
  
  // Inicializar horas padrão (8:00 - 9:00)
  const defaultStartTime = new Date(selectedDate);
  defaultStartTime.setHours(8, 0, 0, 0);
  
  const defaultEndTime = new Date(selectedDate);
  defaultEndTime.setHours(9, 0, 0, 0);
  
  // Criar objeto inicial com a data selecionada
  const initialData: Partial<Appointment> = {
    start_time: defaultStartTime.toISOString(),
    end_time: defaultEndTime.toISOString(),
    status: 'scheduled'
  };
  
  const handleSubmit = (appointmentData: Partial<Appointment>) => {
    const createdAppointment = addAppointment(appointmentData as Omit<Appointment, 'id' | 'created_at' | 'updated_at'>);
    
    if (createdAppointment) {
      handleClose();
      if (onCreated) {
        onCreated(createdAppointment);
      }
    }
  };
  
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen !== undefined ? isOpen : open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen && onClose) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        
        <AppointmentForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          onCancel={handleClose} 
          checkConflicts={checkForTimeConflicts}
          leads={leads}
        />
      </DialogContent>
    </Dialog>
  );
}
