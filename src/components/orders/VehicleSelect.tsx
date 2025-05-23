
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useVehicles, Vehicle } from '@/hooks/useVehicles';
import { AddVehicleModal } from './AddVehicleModal';

interface VehicleSelectProps {
  clientId?: string;
  value?: string;
  onChange: (value: string | undefined, vehicle?: Vehicle) => void;
  disabled?: boolean;
  placeholder?: string;
}

const VehicleSelect = ({ 
  clientId, 
  value, 
  onChange, 
  disabled, 
  placeholder = "Selecione um veículo..." 
}: VehicleSelectProps) => {
  const [open, setOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { vehicles, isLoading, fetchVehicles } = useVehicles(clientId);

  // Buscar veículos quando o componente montar ou quando o clientId mudar
  useEffect(() => {
    if (clientId) {
      fetchVehicles();
    }
  }, [clientId, fetchVehicles]);

  const handleSelect = (vehicleId: string) => {
    const selectedVehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    onChange(vehicleId, selectedVehicle);
    setOpen(false);
  };

  const handleAddNewClick = () => {
    setIsAddModalOpen(true);
    setOpen(false);
  };

  const handleVehicleAdded = (newVehicle: Vehicle) => {
    handleSelect(newVehicle.id);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || !clientId}
          >
            {value && vehicles.length > 0
              ? vehicles.find((vehicle) => vehicle.id === value)
                ? `${vehicles.find((vehicle) => vehicle.id === value)?.make} ${vehicles.find((vehicle) => vehicle.id === value)?.model} (${vehicles.find((vehicle) => vehicle.id === value)?.plate})`
                : "Veículo não encontrado"
              : !clientId ? "Selecione um cliente primeiro" : placeholder}
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar veículo..." />
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !clientId ? (
                "Selecione um cliente primeiro."
              ) : (
                "Nenhum veículo encontrado."
              )}
            </CommandEmpty>
            <CommandGroup>
              {!isLoading && clientId && vehicles.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={vehicle.id}
                  onSelect={() => handleSelect(vehicle.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === vehicle.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}</span>
                    <span className="text-xs text-muted-foreground">
                      Placa: {vehicle.plate} {vehicle.color && `| Cor: ${vehicle.color}`}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {clientId && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleAddNewClick} disabled={!clientId}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Adicionar novo veículo</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {clientId && (
        <AddVehicleModal 
          open={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen} 
          clientId={clientId}
          onVehicleAdded={handleVehicleAdded} 
        />
      )}
    </>
  );
};

export default VehicleSelect;
