
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
import AddCustomerModal from './AddCustomerModal';

interface CustomerSelectProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
}

const CustomerSelect = ({ selectedCustomer, onSelect }: CustomerSelectProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = () => {
      try {
        const customersJSON = localStorage.getItem('mecanicapro_customers');
        if (customersJSON) {
          setCustomers(JSON.parse(customersJSON));
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const handleSelect = (customerId: string) => {
    const selected = customers.find(c => c.id === customerId);
    if (selected) {
      onSelect(selected);
    }
  };

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    onSelect(newCustomer);
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="flex space-x-2">
        <Select 
          value={selectedCustomer?.id} 
          onValueChange={handleSelect}
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
          onClick={() => setIsAddModalOpen(true)}
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

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
};

export default CustomerSelect;
