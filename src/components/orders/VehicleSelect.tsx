
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
import AddVehicleModal from './AddVehicleModal';

interface VehicleSelectProps {
  selectedVehicle: Vehicle | null;
  customerId?: string;
  onSelect: (vehicle: Vehicle) => void;
}

const VehicleSelect = ({ selectedVehicle, customerId, onSelect }: VehicleSelectProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchVehicles = () => {
      try {
        const vehiclesJSON = localStorage.getItem('mecanicapro_vehicles');
        if (vehiclesJSON) {
          const allVehicles = JSON.parse(vehiclesJSON);
          
          // If customerId is provided, filter vehicles by customer
          if (customerId) {
            const filteredVehicles = allVehicles.filter((vehicle: Vehicle) => vehicle.customerId === customerId);
            setVehicles(filteredVehicles);
          } else {
            setVehicles(allVehicles);
          }
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, [customerId]);

  const handleSelect = (vehicleId: string) => {
    const selected = vehicles.find(v => v.id === vehicleId);
    if (selected) {
      onSelect(selected);
    }
  };

  const handleVehicleAdded = (newVehicle: Vehicle) => {
    // Only add to the list if it belongs to the current customer
    if (!customerId || newVehicle.customerId === customerId) {
      setVehicles(prev => [...prev, newVehicle]);
      onSelect(newVehicle);
    }
    setIsAddModalOpen(false);
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
          onClick={() => setIsAddModalOpen(true)}
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

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVehicleAdded={handleVehicleAdded}
        preSelectedCustomerId={customerId}
      />
    </div>
  );
};

export default VehicleSelect;
