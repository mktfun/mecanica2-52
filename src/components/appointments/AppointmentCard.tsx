
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentCardProps {
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
  onClick: () => void;
  condensed?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onClick,
  condensed = false
}) => {
  const getStatusClass = () => {
    switch (appointment.status) {
      case 'scheduled':
        return 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20';
      case 'in-progress':
        return 'border-yellow-500 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20';
      case 'completed':
        return 'border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      case 'cancelled':
        return 'border-gray-500 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40';
      default:
        return 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20';
    }
  };
  
  const getStatusText = () => {
    switch (appointment.status) {
      case 'scheduled':
        return 'Agendado';
      case 'in-progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Agendado';
    }
  };
  
  const startTime = parseISO(appointment.start_time);
  const endTime = parseISO(appointment.end_time);
  
  if (condensed) {
    return (
      <div 
        className={`appointment-card ${getStatusClass()} text-xs p-1 border-l-2 rounded mb-1 cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <div className="font-medium truncate">
          {appointment.client_name}
        </div>
        <div className="truncate text-gray-600 dark:text-gray-400">
          {appointment.service_type}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`appointment-card ${getStatusClass()} p-2 border-l-2 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium">
          {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
        </div>
        <div className={`text-xs px-1.5 py-0.5 rounded-full ${
          appointment.status === 'scheduled' ? 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300' :
          appointment.status === 'in-progress' ? 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300' :
          appointment.status === 'completed' ? 'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-300' :
          'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
        }`}>
          {getStatusText()}
        </div>
      </div>
      
      <div className="text-sm font-medium mb-1">
        {appointment.client_name}
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
        {appointment.vehicle_info}
      </div>
      
      <div className="text-sm font-medium">
        {appointment.service_type}
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        Mecânico: {appointment.mechanic_name}
      </div>
    </div>
  );
};

export default AppointmentCard;
