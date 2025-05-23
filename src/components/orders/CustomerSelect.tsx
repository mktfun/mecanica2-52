
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
import { useClients, Client } from '@/hooks/useClients';
import { AddCustomerModal } from './AddCustomerModal';

interface CustomerSelectProps {
  value?: string;
  onChange: (value: string | undefined, client?: Client) => void;
  disabled?: boolean;
  placeholder?: string;
}

const CustomerSelect = ({ value, onChange, disabled, placeholder = "Selecione um cliente..." }: CustomerSelectProps) => {
  const [open, setOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { clients, isLoading, fetchClients } = useClients();

  // Buscar cliente selecionado quando o componente montar ou quando o valor mudar
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSelect = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    onChange(clientId, selectedClient);
    setOpen(false);
  };

  const handleAddNewClick = () => {
    setIsAddModalOpen(true);
    setOpen(false);
  };

  const handleCustomerAdded = (newClient: Client) => {
    handleSelect(newClient.id);
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
            disabled={disabled}
          >
            {value && clients.length > 0
              ? clients.find((client) => client.id === value)?.name || "Cliente não encontrado"
              : placeholder}
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar cliente..." />
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                "Nenhum cliente encontrado."
              )}
            </CommandEmpty>
            <CommandGroup>
              {!isLoading && clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.id}
                  onSelect={() => handleSelect(client.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{client.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {client.phone} {client.email ? ` | ${client.email}` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleAddNewClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Adicionar novo cliente</span>
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <AddCustomerModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        onClientAdded={handleCustomerAdded} 
      />
    </>
  );
};

export default CustomerSelect;
