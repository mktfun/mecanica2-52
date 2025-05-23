
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/hooks/useAppointments';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateTimePickerProps {
  selectedDate?: Date;
  selectedTime?: string | null;
  onChange: (date: Date, time: string | null) => void;
  checkConflicts?: (appointment: any, excludeId?: string) => boolean;
}

export const DateTimePicker = ({
  selectedDate = new Date(),
  selectedTime = null,
  onChange,
  checkConflicts
}: DateTimePickerProps) => {
  const [date, setDate] = useState<Date>(selectedDate);
  const [time, setTime] = useState<string | null>(selectedTime);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Definir horário de funcionamento da oficina
  const businessHours = {
    start: 8, // 8:00 AM
    end: 18, // 6:00 PM
    intervalMinutes: 30 // Slots de 30 minutos
  };
  
  const { getAppointmentsForDate } = useAppointments();
  
  // Gerar slots de horário para o dia selecionado
  const generateTimeSlots = useCallback((selectedDate: Date) => {
    setIsLoading(true);
    
    try {
      // Gerar todos os slots possíveis dentro do horário de funcionamento
      const slots: TimeSlot[] = [];
      const startHour = businessHours.start;
      const endHour = businessHours.end;
      const interval = businessHours.intervalMinutes;
      
      // Criar data base para este dia
      const baseDate = new Date(selectedDate);
      baseDate.setHours(0, 0, 0, 0);
      
      // Buscar agendamentos existentes para esta data
      const existingAppointments = getAppointmentsForDate(selectedDate);
      
      // Gerar slots de tempo
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          // Criar horário para este slot
          const slotDate = new Date(baseDate);
          slotDate.setHours(hour, minute);
          
          // Formatar como string (HH:mm)
          const timeString = format(slotDate, 'HH:mm');
          
          // Verificar se este slot está disponível
          // Um slot está indisponível se já existir um agendamento para este horário
          let isAvailable = true;
          
          if (checkConflicts && existingAppointments.length > 0) {
            // Criar objeto de agendamento temporário para verificar conflitos
            const tempAppointment = {
              start_time: slotDate.toISOString(),
              end_time: new Date(slotDate.getTime() + interval * 60000).toISOString()
            };
            
            // Verificar conflitos com agendamentos existentes
            isAvailable = !checkConflicts(tempAppointment);
          }
          
          // Adicionar slot à lista
          slots.push({
            time: timeString,
            available: isAvailable
          });
        }
      }
      
      setTimeSlots(slots);
    } catch (error) {
      console.error('Erro ao gerar slots de horário:', error);
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessHours, getAppointmentsForDate, checkConflicts]);
  
  // Atualizar slots quando a data for alterada
  useEffect(() => {
    generateTimeSlots(date);
  }, [date, generateTimeSlots]);
  
  // Handler para quando a data é alterada
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setTime(null); // Reset do horário quando a data muda
      onChange(newDate, null);
    }
  };
  
  // Handler para quando o horário é alterado
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    onChange(date, newTime);
  };
  
  return (
    <div className="grid gap-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateChange}
        disabled={(date) => {
          // Desabilitar datas anteriores ao dia atual
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        }}
        className={cn("border rounded-md", "p-3 pointer-events-auto")}
      />
      
      <div className="border rounded-md">
        <div className="bg-muted py-2 px-4 text-center">
          <h3 className="text-sm font-semibold">
            {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          <p className="text-xs text-muted-foreground">Selecione um horário disponível</p>
        </div>
        
        <ScrollArea className="h-72">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Carregando horários...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={time === slot.time ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeChange(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    "w-full",
                    !slot.available && "opacity-50",
                    time === slot.time && "ring-2 ring-primary"
                  )}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default DateTimePicker;
