
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
import { OrderPart, Part } from '@/types/order';
import { PlusCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface PartsListProps {
  parts: OrderPart[];
  onAddPart: (part: OrderPart) => void;
  onRemovePart: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  readOnly?: boolean;
}

// Mock function to get parts - this would be replaced with a real data fetch
const getParts = (): Part[] => {
  try {
    // In a real application, you'd get this from your parts service
    const partsJSON = localStorage.getItem('mecanicapro_parts');
    if (partsJSON) {
      return JSON.parse(partsJSON);
    }
    return [];
  } catch (error) {
    console.error("Error fetching parts:", error);
    return [];
  }
};

const PartsList = ({ 
  parts, 
  onAddPart, 
  onRemovePart, 
  onUpdateQuantity,
  readOnly = false 
}: PartsListProps) => {
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string>('');

  useEffect(() => {
    const fetchParts = () => {
      const fetchedParts = getParts();
      setAvailableParts(fetchedParts);
    };

    fetchParts();
  }, []);

  const handleAddPart = () => {
    if (!selectedPartId) return;
    
    const part = availableParts.find(p => p.id === selectedPartId);
    if (!part) return;
    
    const newPart: OrderPart = {
      id: part.id,
      name: part.name,
      code: part.code,
      price: part.price,
      quantity: 1
    };
    
    onAddPart(newPart);
    setSelectedPartId('');
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
            value={selectedPartId} 
            onValueChange={setSelectedPartId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma peça" />
            </SelectTrigger>
            <SelectContent>
              {availableParts.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">Nenhuma peça encontrada</div>
              ) : (
                availableParts.map((part) => (
                  <SelectItem key={part.id} value={part.id}>
                    {part.name} {part.code && `(${part.code})`} - {formatCurrency(part.price)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          <Button 
            type="button" 
            onClick={handleAddPart} 
            disabled={!selectedPartId}
            className="shrink-0"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      )}

      {parts.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
          Nenhuma peça adicionada
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Peça</th>
                <th className="px-4 py-3 text-right w-24">Quantidade</th>
                <th className="px-4 py-3 text-right w-32">Valor Unitário</th>
                <th className="px-4 py-3 text-right w-32">Subtotal</th>
                {!readOnly && (
                  <th className="px-4 py-3 text-right w-16"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {parts.map((part, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{part.name}</div>
                    {part.code && (
                      <div className="text-gray-500 text-xs">Código: {part.code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {readOnly ? (
                      part.quantity
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-16 ml-auto"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(part.price)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(part.price * part.quantity)}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRemovePart(index)}
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

export default PartsList;
