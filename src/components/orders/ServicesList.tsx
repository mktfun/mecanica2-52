
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { OrderService, ServiceType } from '@/types/order';
import { PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface ServicesListProps {
  services: OrderService[];
  onAddService: (service: OrderService) => void;
  onRemoveService: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onToggleCompleted?: (index: number) => void;
  readOnly?: boolean;
}

// Mock function to get service types - this would be replaced with a real data fetch
const getServiceTypes = (): ServiceType[] => {
  try {
    // In a real application, you'd get this from your service types service
    const servicesJSON = localStorage.getItem('mecanicapro_service_types');
    if (servicesJSON) {
      return JSON.parse(servicesJSON);
    }
    return [];
  } catch (error) {
    console.error("Error fetching service types:", error);
    return [];
  }
};

const ServicesList = ({ 
  services, 
  onAddService, 
  onRemoveService, 
  onUpdateQuantity,
  onToggleCompleted,
  readOnly = false
}: ServicesListProps) => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  useEffect(() => {
    const fetchServiceTypes = () => {
      const fetchedServiceTypes = getServiceTypes();
      setServiceTypes(fetchedServiceTypes);
    };

    fetchServiceTypes();
  }, []);

  const handleAddService = () => {
    if (!selectedServiceId) return;
    
    const serviceType = serviceTypes.find(s => s.id === selectedServiceId);
    if (!serviceType) return;
    
    const newService: OrderService = {
      id: Date.now().toString(), // Temporary ID for new services
      service_order_id: '', // Will be set when saving the order
      service_id: serviceType.id,
      name: serviceType.name,
      description: serviceType.description,
      price: serviceType.price,
      quantity: 1,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    onAddService(newService);
    setSelectedServiceId('');
  };

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value, 10) || 1;
    onUpdateQuantity(index, quantity > 0 ? quantity : 1);
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex space-x-2">
          <Select 
            value={selectedServiceId} 
            onValueChange={setSelectedServiceId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">Nenhum tipo de serviço encontrado</div>
              ) : (
                serviceTypes.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {formatCurrency(service.price)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Button 
            type="button" 
            onClick={handleAddService} 
            disabled={!selectedServiceId}
            className="shrink-0"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
          Nenhum serviço adicionado
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {onToggleCompleted && (
                  <th className="px-4 py-3 text-left w-12"></th>
                )}
                <th className="px-4 py-3 text-left">Serviço</th>
                <th className="px-4 py-3 text-right w-24">Quantidade</th>
                <th className="px-4 py-3 text-right w-32">Valor Unitário</th>
                <th className="px-4 py-3 text-right w-32">Subtotal</th>
                {!readOnly && (
                  <th className="px-4 py-3 text-right w-16"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((service, index) => (
                <tr key={index} className={service.completed ? "bg-green-50" : ""}>
                  {onToggleCompleted && (
                    <td className="px-4 py-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onToggleCompleted(index)}
                        className={service.completed ? "text-green-500" : "text-gray-400"}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </Button>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="text-gray-500 text-xs">{service.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {readOnly ? (
                      service.quantity
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-16 ml-auto"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(service.price)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(service.price * service.quantity)}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRemoveService(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
