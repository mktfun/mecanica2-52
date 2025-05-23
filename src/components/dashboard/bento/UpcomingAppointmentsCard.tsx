
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentData {
  id: string;
  customer_name: string;
  start_time: string;
  service?: string;
  status: string;
}

interface UpcomingAppointmentsCardProps {
  data: AppointmentData[];
}

const UpcomingAppointmentsCard = ({ data }: UpcomingAppointmentsCardProps) => {
  const upcomingAppointments = data
    .filter(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      const now = new Date();
      return appointmentDate >= now && appointment.status === 'scheduled';
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 4);

  return (
    <div className="p-4 h-full">
      <div className="space-y-3">
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {appointment.customer_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {appointment.service || 'Serviço geral'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {format(new Date(appointment.start_time), 'dd/MM', { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {format(new Date(appointment.start_time), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Nenhum agendamento próximo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointmentsCard;
