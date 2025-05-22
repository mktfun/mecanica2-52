
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/appointment';
import { formatDate } from '@/utils/formatters';

interface AppointmentSelectProps {
  onSelect: (appointment: Appointment | null) => void;
}

// Mock function to get appointments - this would be replaced with a real data fetch
const getAvailableAppointments = (): Appointment[] => {
  try {
    // In a real application, you'd get this from your appointment service
    const appointmentsJSON = localStorage.getItem('mecanicapro_appointments');
    if (appointmentsJSON) {
      const appointments = JSON.parse(appointmentsJSON);
      // Filter only scheduled appointments (not already converted to orders)
      return appointments.filter((appointment: Appointment) => 
        appointment.status === 'scheduled' || appointment.status === 'confirmed'
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
};

const AppointmentSelect = ({ onSelect }: AppointmentSelectProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  useEffect(() => {
    const fetchAppointments = () => {
      const fetchedAppointments = getAvailableAppointments();
      setAppointments(fetchedAppointments);
    };

    fetchAppointments();
  }, []);

  const handleChange = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    
    if (appointmentId) {
      const selectedAppointment = appointments.find(a => a.id === appointmentId);
      if (selectedAppointment) {
        onSelect(selectedAppointment);
      }
    } else {
      onSelect(null);
    }
  };

  const formatAppointmentLabel = (appointment: Appointment): string => {
    const appointmentDate = new Date(appointment.start_time);
    const customer = appointment.client_name || 'Cliente não especificado';
    const vehicle = appointment.vehicle_info || 'Veículo não especificado';
    
    return `${formatDate(appointmentDate)} - ${customer} - ${vehicle}`;
  };

  return (
    <div>
      <Select value={selectedAppointmentId} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um agendamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Nenhum agendamento</SelectItem>
          {appointments.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">Nenhum agendamento disponível</div>
          ) : (
            appointments.map((appointment) => (
              <SelectItem key={appointment.id} value={appointment.id}>
                {formatAppointmentLabel(appointment)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {selectedAppointmentId && (
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleChange('')}
          >
            Limpar seleção
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentSelect;
