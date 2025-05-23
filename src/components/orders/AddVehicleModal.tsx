
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useVehicles, Vehicle } from '@/hooks/useVehicles';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddVehicleModalProps {
  open: boolean;
  clientId: string;
  onOpenChange: (open: boolean) => void;
  onVehicleAdded?: (vehicle: Vehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  open,
  clientId,
  onOpenChange,
  onVehicleAdded
}) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    plate: '',
    color: '',
    vin: '',
    mileage: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addVehicle } = useVehicles();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.make.trim()) {
      toast.error('A marca do veículo é obrigatória');
      return;
    }
    
    if (!formData.model.trim()) {
      toast.error('O modelo do veículo é obrigatório');
      return;
    }
    
    if (!formData.plate.trim()) {
      toast.error('A placa do veículo é obrigatória');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Converter mileage para number se estiver preenchido
      const mileage = formData.mileage ? parseInt(formData.mileage) : undefined;
      
      const vehicleData = {
        client_id: clientId,
        make: formData.make,
        model: formData.model,
        year: formData.year || undefined,
        plate: formData.plate,
        color: formData.color || undefined,
        vin: formData.vin || undefined,
        mileage,
        notes: formData.notes || undefined
      };
      
      const newVehicle = await addVehicle(vehicleData);
      if (onVehicleAdded && newVehicle) {
        onVehicleAdded(newVehicle);
      } else {
        onOpenChange(false);
      }
      
      // Limpar o formulário
      setFormData({
        make: '',
        model: '',
        year: '',
        plate: '',
        color: '',
        vin: '',
        mileage: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      toast.error('Não foi possível adicionar o veículo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Veículo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Marca *</Label>
              <Input 
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="Ex: Toyota, Honda, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input 
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ex: Corolla, Civic, etc."
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input 
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="Ex: 2020"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plate">Placa *</Label>
              <Input 
                id="plate"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                placeholder="Ex: ABC1234"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input 
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Ex: Prata, Branco, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage">Quilometragem</Label>
              <Input 
                id="mileage"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="Ex: 45000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vin">Número do Chassi (VIN)</Label>
            <Input 
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              placeholder="Número de identificação do veículo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o veículo"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Veículo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
