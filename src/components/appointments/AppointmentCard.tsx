
import React from 'react';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
  condensed?: boolean;
}

export default function AppointmentCard({ appointment, onClick, condensed = false }: AppointmentCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: ptBR });
  };
  
  const getStatusClass = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'border-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'in-progress':
        return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'completed':
        return 'border-green-400 bg-green-50 dark:bg-green-900/20';
      case 'cancelled':
        return 'border-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-300';
    }
  };
  
  const clientName = appointment.client?.name || 'Cliente não especificado';
  const vehicleInfo = appointment.vehicle 
    ? `${appointment.vehicle.make} ${appointment.vehicle.model} (${appointment.vehicle.plate})`
    : 'Veículo não especificado';
  
  return (
    <div 
      className={cn(
        "border-l-4 rounded-md p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow",
        getStatusClass(appointment.status),
        condensed ? "px-2 py-1" : ""
      )}
      onClick={onClick}
    >
      {condensed ? (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
          </div>
          <div className="text-sm font-medium truncate">{clientName}</div>
          <div className="text-xs truncate">{appointment.service_type}</div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
          </div>
          <div className="text-base font-medium">{clientName}</div>
          <div>
            <div className="text-sm truncate">
              <span className="font-medium">Veículo:</span> {vehicleInfo}
            </div>
            <div className="text-sm truncate">
              <span className="font-medium">Serviço:</span> {appointment.service_type}
            </div>
            <div className="text-sm">
              <span className="font-medium">Mecânico:</span> {appointment.mechanic_name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
