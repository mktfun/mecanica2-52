import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentForm } from './AppointmentForm';
import { DateTimePicker } from './DateTimePicker';
import { Appointment } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';
import { Lead } from '@/types/lead';
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import { useStorageData } from '@/hooks/useStorageData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState<string>('dateTime');
  const [appointmentDate, setAppointmentDate] = useState<Date>(selectedDate);
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
  const { addAppointment, checkForTimeConflicts } = useAppointments();
  const leads = useStorageData<Lead>(enhancedLeadsStore);
  
  // Inicializar horas padrão (8:00 - 9:00)
  const defaultStartTime = new Date(selectedDate);
  defaultStartTime.setHours(8, 0, 0, 0);
  
  const defaultEndTime = new Date(selectedDate);
  defaultEndTime.setHours(9, 0, 0, 0);
  
  // Criar objeto inicial com a data selecionada
  const [formData, setFormData] = useState<Partial<Appointment>>({
    start_time: defaultStartTime.toISOString(),
    end_time: defaultEndTime.toISOString(),
    status: 'scheduled'
  });
  
  // Atualizar formData quando data/hora mudam
  useEffect(() => {
    if (appointmentDate && appointmentTime) {
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      
      const startDateTime = new Date(appointmentDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setTime(endDateTime.getTime() + 60 * 60 * 1000); // Adicionar 1 hora
      
      setFormData(prev => ({
        ...prev,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString()
      }));
    }
  }, [appointmentDate, appointmentTime]);
  
  // Handler para mudanças na data/hora
  const handleDateTimeChange = (date: Date, time: string | null) => {
    setAppointmentDate(date);
    setAppointmentTime(time);
  };
  
  // Avançar para a próxima etapa
  const handleNextStep = () => {
    if (activeTab === 'dateTime' && appointmentTime) {
      setActiveTab('details');
    } else if (!appointmentTime) {
      toast.error('Selecione um horário para continuar');
    }
  };
  
  // Voltar para a etapa anterior
  const handlePreviousStep = () => {
    setActiveTab('dateTime');
  };
  
  const handleSubmit = async (appointmentData: Partial<Appointment>) => {
    try {
      // Combine os dados do formulário com a data/hora selecionada
      const finalData = {
        ...appointmentData,
        start_time: formData.start_time,
        end_time: formData.end_time
      };
      
      const createdAppointment = await addAppointment(finalData as Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'organization_id'>);
      
      if (createdAppointment) {
        handleClose();
        if (onCreated) {
          onCreated(createdAppointment);
        }
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };
  
  const handleClose = () => {
    setOpen(false);
    setActiveTab('dateTime');
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="dateTime">Data e Hora</TabsTrigger>
            <TabsTrigger value="details" disabled={!appointmentTime}>Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dateTime" className="space-y-4">
            <DateTimePicker 
              selectedDate={appointmentDate}
              selectedTime={appointmentTime}
              onChange={handleDateTimeChange}
              checkConflicts={checkForTimeConflicts}
            />
            
            <div className="flex justify-end">
              <Button onClick={handleClose} variant="ghost" className="mr-2">Cancelar</Button>
              <Button onClick={handleNextStep} disabled={!appointmentTime}>
                Próximo
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <AppointmentForm 
              initialData={formData} 
              onSubmit={handleSubmit} 
              onCancel={handlePreviousStep}
              checkConflicts={checkForTimeConflicts}
              leads={leads}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
