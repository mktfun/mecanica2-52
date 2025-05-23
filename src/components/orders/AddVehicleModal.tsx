
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Vehicle, Customer } from '@/types/order';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: (vehicle: Vehicle) => void;
  preSelectedCustomerId?: string;
}

const AddVehicleModal = ({ isOpen, onClose, onVehicleAdded, preSelectedCustomerId }: AddVehicleModalProps) => {
  const [formData, setFormData] = useState({
    customerId: preSelectedCustomerId || '',
    make: '',
    model: '',
    year: '',
    plate: '',
    color: '',
    vin: '',
    mileage: '',
    notes: ''
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load customers for the dropdown
    try {
      const customersData = localStorage.getItem('mecanicapro_customers');
      if (customersData) {
        setCustomers(JSON.parse(customersData));
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }, []);

  useEffect(() => {
    if (preSelectedCustomerId) {
      setFormData(prev => ({ ...prev, customerId: preSelectedCustomerId }));
    }
  }, [preSelectedCustomerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, customerId: value }));
  };

  const handleSave = () => {
    if (!formData.customerId) {
      alert('Cliente é obrigatório');
      return;
    }
    
    if (!formData.make.trim() || !formData.model.trim() || !formData.plate.trim()) {
      alert('Marca, Modelo e Placa são obrigatórios');
      return;
    }

    setSaving(true);
    
    try {
      // Create new vehicle
      const newVehicle: Vehicle = {
        id: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId: formData.customerId,
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year.trim() || undefined,
        plate: formData.plate.trim().toUpperCase(),
        color: formData.color.trim() || undefined,
        vin: formData.vin.trim() || undefined,
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        notes: formData.notes.trim() || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      const existingVehicles = JSON.parse(localStorage.getItem('mecanicapro_vehicles') || '[]');
      existingVehicles.push(newVehicle);
      localStorage.setItem('mecanicapro_vehicles', JSON.stringify(existingVehicles));

      onVehicleAdded(newVehicle);
      
      // Reset form
      setFormData({
        customerId: preSelectedCustomerId || '',
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
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customerId: preSelectedCustomerId || '',
      make: '',
      model: '',
      year: '',
      plate: '',
      color: '',
      vin: '',
      mileage: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Veículo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerId">Cliente Proprietário *</Label>
            <Select value={formData.customerId} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Marca *</Label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="Toyota, Honda, etc."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Corolla, Civic, etc."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2020"
                maxLength={4}
              />
            </div>
            
            <div>
              <Label htmlFor="plate">Placa *</Label>
              <Input
                id="plate"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                placeholder="ABC-1234"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Branco, Preto, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="mileage">Quilometragem</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="50000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vin">Chassi (VIN)</Label>
            <Input
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              placeholder="9BWZZZ377VT004251"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observações sobre o veículo"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Veículo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleModal;
