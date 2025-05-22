
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Pencil, Trash2, Star, Check } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { Unit, WeeklyHours } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';

// Dias da semana para horários
const weekDays = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

// Horários padrão
const defaultOpeningHours: WeeklyHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '08:00', close: '12:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true }
};

// Esquema de validação para unidade
const unitSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  address: z.string().min(2, { message: 'Endereço deve ter pelo menos 2 caracteres' }),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  isMain: z.boolean().default(false),
  openingHours: z.any()
});

const UnitSettings = () => {
  const { settings, saveSection, loading } = useSettings('units');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, unitId: string | null }>({
    open: false,
    unitId: null
  });

  // Obter unidades ou array vazio
  const units = settings?.units || [];

  // Form para unidade
  const unitForm = useForm<z.infer<typeof unitSchema>>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      isMain: false,
      openingHours: defaultOpeningHours
    }
  });

  // Carregar dados da unidade para edição
  const loadUnitForEdit = (unit: Unit) => {
    setEditingUnit(unit);
    unitForm.reset({
      name: unit.name,
      address: unit.address,
      city: unit.city,
      state: unit.state,
      zipCode: unit.zipCode,
      phone: unit.phone,
      email: unit.email,
      isMain: unit.isMain,
      openingHours: unit.openingHours
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo para nova unidade
  const openNewUnitDialog = () => {
    setEditingUnit(null);
    unitForm.reset({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      isMain: units.length === 0, // Se for a primeira unidade, será a principal
      openingHours: defaultOpeningHours
    });
    setIsDialogOpen(true);
  };

  // Definir unidade como principal
  const setMainUnit = (unitId: string) => {
    const updatedUnits = units.map(unit => ({
      ...unit,
      isMain: unit.id === unitId
    }));

    const success = saveSection('units', { units: updatedUnits });
    
    if (success) {
      toast.success('Unidade principal definida com sucesso');
    }
  };

  // Remover unidade
  const removeUnit = (unitId: string) => {
    // Verificar se é a única unidade
    if (units.length === 1) {
      toast.error('Não é possível remover a única unidade');
      setDeleteConfirm({ open: false, unitId: null });
      return;
    }

    // Verificar se é a unidade principal
    const unitToRemove = units.find(u => u.id === unitId);
    
    if (unitToRemove?.isMain) {
      toast.error('Não é possível remover a unidade principal. Defina outra unidade como principal primeiro.');
      setDeleteConfirm({ open: false, unitId: null });
      return;
    }

    // Remover unidade
    const updatedUnits = units.filter(u => u.id !== unitId);
    const success = saveSection('units', { units: updatedUnits });
    
    if (success) {
      toast.success('Unidade removida com sucesso');
    }

    setDeleteConfirm({ open: false, unitId: null });
  };

  // Manipular mudança em horários de funcionamento
  const handleHoursChange = (day: string, field: string, value: any) => {
    const currentHours = unitForm.getValues('openingHours');
    
    unitForm.setValue('openingHours', {
      ...currentHours,
      [day]: {
        ...currentHours[day],
        [field]: value
      }
    });
  };

  // Salvar unidade
  const onUnitSubmit = (data: z.infer<typeof unitSchema>) => {
    let updatedUnits = [...units];

    if (editingUnit) {
      // Atualizar unidade existente
      const updatedUnit = {
        ...editingUnit,
        ...data,
        updated_at: new Date().toISOString()
      };

      // Se marcada como principal, atualizar outras
      if (updatedUnit.isMain) {
        updatedUnits = updatedUnits.map(u => ({
          ...u,
          isMain: u.id === updatedUnit.id
        }));
      }

      // Substituir unidade antiga pela atualizada
      updatedUnits = updatedUnits.map(u => u.id === editingUnit.id ? updatedUnit : u);
    } else {
      // Criar nova unidade
      const newUnit: Unit = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };

      // Se for a primeira unidade ou marcada como principal, ajustar outras
      if (newUnit.isMain || units.length === 0) {
        updatedUnits = updatedUnits.map(u => ({
          ...u,
          isMain: false
        }));
        newUnit.isMain = true;
      }

      updatedUnits.push(newUnit);
    }

    // Salvar no armazenamento local
    const success = saveSection('units', { units: updatedUnits });
    
    if (success) {
      toast.success(editingUnit ? 'Unidade atualizada com sucesso' : 'Unidade adicionada com sucesso');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unidades</h2>
          <p className="text-sm text-gray-500">
            Gerencie suas unidades e filiais
          </p>
        </div>
        <Button onClick={openNewUnitDialog} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>
      
      <Separator />
      
      {units.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h3 className="text-lg font-medium mb-2">Nenhuma unidade cadastrada</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              Adicione sua primeira unidade para começar a gerenciar seu negócio
            </p>
            <Button onClick={openNewUnitDialog} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Primeira Unidade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map(unit => (
            <Card key={unit.id} className={`${unit.isMain ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{unit.name}</CardTitle>
                  {unit.isMain && (
                    <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      <span>Principal</span>
                    </div>
                  )}
                </div>
                <CardDescription>
                  {unit.address}, {unit.city} - {unit.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {unit.phone && <p className="text-sm"><strong>Telefone:</strong> {unit.phone}</p>}
                {unit.email && <p className="text-sm"><strong>Email:</strong> {unit.email}</p>}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Horário de Funcionamento</h4>
                  <div className="text-xs space-y-1">
                    {weekDays.map(day => (
                      <div key={day.key} className="grid grid-cols-2">
                        <span>{day.label}:</span>
                        <span>
                          {unit.openingHours[day.key as keyof WeeklyHours].closed 
                            ? 'Fechado' 
                            : `${unit.openingHours[day.key as keyof WeeklyHours].open} - ${unit.openingHours[day.key as keyof WeeklyHours].close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loadUnitForEdit(unit)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                {!unit.isMain && (
                  <>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setMainUnit(unit.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Tornar Principal
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setDeleteConfirm({ open: true, unitId: unit.id })}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para adicionar/editar unidade */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
            <DialogDescription>
              {editingUnit 
                ? 'Atualize as informações da unidade' 
                : 'Preencha os dados para adicionar uma nova unidade'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...unitForm}>
            <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-6">
              <FormField
                control={unitForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Unidade*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={unitForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={unitForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={unitForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={unitForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={unitForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={unitForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {(!editingUnit || !editingUnit.isMain) && (
                <FormField
                  control={unitForm.control}
                  name="isMain"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Definir como unidade principal</FormLabel>
                    </FormItem>
                  )}
                />
              )}
              
              <div className="space-y-4">
                <h4 className="text-base font-medium">Horário de Funcionamento</h4>
                
                {weekDays.map(day => {
                  const dayKey = day.key as keyof WeeklyHours;
                  const hours = unitForm.watch(`openingHours.${dayKey}`);
                  
                  return (
                    <div key={day.key} className="grid grid-cols-6 items-center gap-4">
                      <div className="col-span-2">
                        <span className="text-sm font-medium">{day.label}</span>
                      </div>
                      
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`${day.key}-closed`}
                            checked={hours?.closed} 
                            onCheckedChange={(checked) => {
                              handleHoursChange(dayKey, 'closed', !!checked);
                            }}
                          />
                          <label 
                            htmlFor={`${day.key}-closed`}
                            className="text-sm cursor-pointer"
                          >
                            Fechado
                          </label>
                        </div>
                        
                        {!hours?.closed && (
                          <>
                            <div className="flex items-center gap-2">
                              <label className="text-xs">Abre:</label>
                              <Input 
                                type="time"
                                value={hours?.open}
                                onChange={(e) => handleHoursChange(dayKey, 'open', e.target.value)}
                                className="w-24 h-8 text-xs"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <label className="text-xs">Fecha:</label>
                              <Input 
                                type="time"
                                value={hours?.close}
                                onChange={(e) => handleHoursChange(dayKey, 'close', e.target.value)}
                                className="w-24 h-8 text-xs"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingUnit ? 'Atualizar' : 'Adicionar'} Unidade
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Unidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover esta unidade? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <Alert variant="destructive">
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              A exclusão de uma unidade removerá permanentemente todos os dados associados a ela.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, unitId: null })}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm.unitId && removeUnit(deleteConfirm.unitId)}
            >
              Remover Unidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitSettings;
