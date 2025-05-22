
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Customer } from '@/types/order';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface CustomerSelectProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
}

// Mock function to get customers - this would be replaced with a real data fetch
const getCustomers = (): Customer[] => {
  try {
    // In a real application, you'd get this from your customer service
    const customersJSON = localStorage.getItem('mecanicapro_customers');
    if (customersJSON) {
      return JSON.parse(customersJSON);
    }
    return [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

const CustomerSelect = ({ selectedCustomer, onSelect }: CustomerSelectProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = () => {
      const fetchedCustomers = getCustomers();
      setCustomers(fetchedCustomers);
    };

    fetchCustomers();
  }, []);

  const handleSelect = (customerId: string) => {
    const selected = customers.find(c => c.id === customerId);
    if (selected) {
      onSelect(selected);
    }
  };

  // Function to open customer creation modal - this would be implemented in a real app
  const handleAddCustomer = () => {
    // In a real implementation, this would open a modal to create a customer
    alert('Esta funcionalidade seria implementada com um modal para criar clientes');
  };

  return (
    <div>
      <div className="flex space-x-2">
        <Select 
          value={selectedCustomer?.id} 
          onValueChange={handleSelect}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className="w-full">
            <SelectValue 
              placeholder="Selecione um cliente" 
              className="placeholder:text-gray-400"
            />
          </SelectTrigger>
          <SelectContent>
            {customers.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">Nenhum cliente encontrado</div>
            ) : (
              customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        <Button 
          type="button"
          variant="outline"
          onClick={handleAddCustomer}
          className="shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
      
      {selectedCustomer && (
        <div className="mt-2 text-sm text-gray-600">
          {selectedCustomer.phone && <div>{selectedCustomer.phone}</div>}
          {selectedCustomer.email && <div>{selectedCustomer.email}</div>}
        </div>
      )}
    </div>
  );
};

export default CustomerSelect;
