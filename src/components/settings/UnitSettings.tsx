import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Unit } from '@/types/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const UnitSettings = () => {
  const { settings, saveSection } = useSettings('units');
  const unitSettings = settings as Unit[];
  const units = unitSettings || [];
  
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  
  const defaultUnit: Omit<Unit, 'id'> = {
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    openingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '12:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    isMain: false
  };
  
  const unitSchema = z.object({
    name: z.string().min(1, { message: 'Nome da unidade é obrigatório' }),
    address: z.string().min(1, { message: 'Endereço é obrigatório' }),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    phone: z.string(),
    email: z.string().email().optional().or(z.literal('')),
    isMain: z.boolean(),
    // We'll handle openingHours separately
  });
  
  const form = useForm<z.infer<typeof unitSchema>>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      isMain: false
    }
  });
  
  // Initialize or reset form with unit data
  const initForm = (unit?: Unit) => {
    if (unit) {
      form.reset({
        name: unit.name,
        address: unit.address,
        city: unit.city,
        state: unit.state,
        zipCode: unit.zipCode,
        phone: unit.phone,
        email: unit.email,
        isMain: unit.isMain
      });
      setEditingUnit(unit);
    } else {
      form.reset({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        isMain: units.length === 0 ? true : false
      });
      setEditingUnit(null);
    }
  };
  
  // Start adding a new unit
  const startAddUnit = () => {
    initForm();
    setIsAddingUnit(true);
  };
  
  // Start editing an existing unit
  const startEditUnit = (unit: Unit) => {
    initForm(unit);
    setIsAddingUnit(false);
  };
  
  // Cancel editing/adding
  const cancelEdit = () => {
    setIsAddingUnit(false);
    setEditingUnit(null);
    form.reset();
  };
  
  // Handle form submission for new unit
  const handleAddUnit = (data: z.infer<typeof unitSchema>) => {
    // Create new unit with required fields
    const newUnit: Unit = {
      ...defaultUnit,
      ...data,
      id: Date.now().toString()
    };
    
    // If first unit or marked as main, update others
    let updatedUnits = [...units];
    
    if (newUnit.isMain || units.length === 0) {
      updatedUnits = updatedUnits.map(u => ({
        ...u,
        isMain: false
      }));
      newUnit.isMain = true;
    }
    
    // Add to list and save
    updatedUnits.push(newUnit);
    saveSection('units', updatedUnits);
    
    setIsAddingUnit(false);
    form.reset();
    toast.success('Unidade adicionada com sucesso');
  };
  
  // Handle form submission for updating unit
  const handleUpdateUnit = (data: z.infer<typeof unitSchema>) => {
    if (!editingUnit) return;
    
    const updatedUnit: Unit = {
      ...editingUnit,
      ...data
    };
    
    // If marked as main, update others
    let updatedUnits = [...units];
    if (updatedUnit.isMain) {
      updatedUnits = updatedUnits.map(u => ({
        ...u,
        isMain: u.id === updatedUnit.id
      }));
    }
    
    // Replace old unit with updated one
    updatedUnits = updatedUnits.map(u => 
      u.id === updatedUnit.id ? updatedUnit : u
    );
    
    saveSection('units', updatedUnits);
    setEditingUnit(null);
    toast.success('Unidade atualizada com sucesso');
  };
  
  // Remove a unit
  const removeUnit = (unitId: string) => {
    const unitToRemove = units.find(u => u.id === unitId);
    
    if (!unitToRemove) return;
    
    // Check if it's the main unit
    if (unitToRemove.isMain) {
      toast.error('Não é possível remover a unidade principal');
      return;
    }
    
    // Check if it's the only unit
    if (units.length === 1) {
      toast.error('Não é possível remover a única unidade');
      return;
    }
    
    // Remove unit
    const updatedUnits = units.filter(u => u.id !== unitId);
    saveSection('units', updatedUnits);
    toast.success('Unidade removida com sucesso');
  };
  
  // Set a unit as the main one
  const setMainUnit = (unitId: string) => {
    const updatedUnits = units.map(unit => ({
      ...unit,
      isMain: unit.id === unitId
    }));
    
    saveSection('units', updatedUnits);
    toast.success('Unidade principal definida com sucesso');
  };
  
  // Render unit form for adding/editing
  const renderUnitForm = () => {
    const isEditing = !!editingUnit;
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(isEditing ? handleUpdateUnit : handleAddUnit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Unidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Additional fields for city, state, zipCode, phone, email */}
            {/* These would be implemented similarly to the fields above */}
            
            <FormField
              control={form.control}
              name="isMain"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={editingUnit && editingUnit.isMain}
                    />
                  </FormControl>
                  <FormLabel>Unidade Principal</FormLabel>
                </FormItem>
              )}
            />
          </div>
          
          {/* Opening hours would go here */}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Atualizar' : 'Adicionar'} Unidade
            </Button>
          </div>
        </form>
      </Form>
    );
  };
  
  // Render unit card
  const renderUnitCard = (unit: Unit) => (
    <Card key={unit.id} className={unit.isMain ? 'border-primary' : ''}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {unit.name}
          {unit.isMain && (
            <span className="text-xs bg-primary text-primary-foreground py-1 px-2 rounded">
              Principal
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {unit.address}, {unit.city} - {unit.state}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {unit.phone && <p><strong>Telefone:</strong> {unit.phone}</p>}
          {unit.email && <p><strong>Email:</strong> {unit.email}</p>}
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => startEditUnit(unit)}
            >
              Editar
            </Button>
            
            {!unit.isMain && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMainUnit(unit.id)}
                >
                  Definir como Principal
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeUnit(unit.id)}
                >
                  Remover
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Unidades</h2>
        {!isAddingUnit && !editingUnit && (
          <Button onClick={startAddUnit}>Nova Unidade</Button>
        )}
      </div>
      
      {isAddingUnit || editingUnit ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* renderUnitForm() would go here */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(isAddingUnit ? handleAddUnit : handleUpdateUnit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Unidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* Additional fields for city, state, zipCode, phone, email */}
                  {/* These would be implemented similarly to the fields above */}
                  
                  <FormField
                    control={form.control}
                    name="isMain"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={editingUnit && editingUnit.isMain}
                          />
                        </FormControl>
                        <FormLabel>Unidade Principal</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Opening hours would go here */}
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUnit ? 'Atualizar' : 'Adicionar'} Unidade
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <>
          {units.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">Nenhuma unidade cadastrada</p>
              <Button onClick={startAddUnit}>Adicionar Primeira Unidade</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map(unit => (
                <Card key={unit.id} className={unit.isMain ? 'border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {unit.name}
                      {unit.isMain && (
                        <span className="text-xs bg-primary text-primary-foreground py-1 px-2 rounded">
                          Principal
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {unit.address}, {unit.city} - {unit.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {unit.phone && <p><strong>Telefone:</strong> {unit.phone}</p>}
                      {unit.email && <p><strong>Email:</strong> {unit.email}</p>}
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEditUnit(unit)}
                        >
                          Editar
                        </Button>
                        
                        {!unit.isMain && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setMainUnit(unit.id)}
                            >
                              Definir como Principal
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeUnit(unit.id)}
                            >
                              Remover
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UnitSettings;
