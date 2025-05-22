
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Vehicle } from '@/types/order';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface VehicleSelectProps {
  selectedVehicle: Vehicle | null;
  customerId?: string;
  onSelect: (vehicle: Vehicle) => void;
}

// Mock function to get vehicles - this would be replaced with a real data fetch
const getVehicles = (customerId?: string): Vehicle[] => {
  try {
    // In a real application, you'd get this from your vehicle service
    const vehiclesJSON = localStorage.getItem('mecanicapro_vehicles');
    if (vehiclesJSON) {
      const vehicles = JSON.parse(vehiclesJSON);
      
      // If customerId is provided, filter vehicles by customer
      if (customerId) {
        return vehicles.filter((vehicle: Vehicle) => vehicle.customerId === customerId);
      }
      
      return vehicles;
    }
    return [];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
};

const VehicleSelect = ({ selectedVehicle, customerId, onSelect }: VehicleSelectProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchVehicles = () => {
      const fetchedVehicles = getVehicles(customerId);
      setVehicles(fetchedVehicles);
    };

    fetchVehicles();
  }, [customerId]);

  const handleSelect = (vehicleId: string) => {
    const selected = vehicles.find(v => v.id === vehicleId);
    if (selected) {
      onSelect(selected);
    }
  };

  // Function to open vehicle creation modal - this would be implemented in a real app
  const handleAddVehicle = () => {
    // In a real implementation, this would open a modal to create a vehicle
    alert('Esta funcionalidade seria implementada com um modal para cadastrar veículos');
  };

  return (
    <div>
      <div className="flex space-x-2">
        <Select 
          value={selectedVehicle?.id} 
          onValueChange={handleSelect}
          disabled={!customerId}
        >
          <SelectTrigger className="w-full">
            <SelectValue 
              placeholder={customerId ? "Selecione um veículo" : "Selecione um cliente primeiro"} 
              className="placeholder:text-gray-400"
            />
          </SelectTrigger>
          <SelectContent>
            {!customerId ? (
              <div className="p-2 text-sm text-gray-500">Selecione um cliente primeiro</div>
            ) : vehicles.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">Nenhum veículo encontrado para este cliente</div>
            ) : (
              vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.model} - {vehicle.plate}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        <Button 
          type="button"
          variant="outline"
          onClick={handleAddVehicle}
          disabled={!customerId}
          className="shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedVehicle && (
        <div className="mt-2 text-sm text-gray-600">
          <div><span className="font-medium">Modelo:</span> {selectedVehicle.make} {selectedVehicle.model}</div>
          <div><span className="font-medium">Placa:</span> {selectedVehicle.plate}</div>
          {selectedVehicle.year && <div><span className="font-medium">Ano:</span> {selectedVehicle.year}</div>}
          {selectedVehicle.color && <div><span className="font-medium">Cor:</span> {selectedVehicle.color}</div>}
        </div>
      )}
    </div>
  );
};

export default VehicleSelect;
