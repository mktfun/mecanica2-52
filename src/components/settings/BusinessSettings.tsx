import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2 } from 'lucide-react';
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
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { BusinessSettings as BusinessSettingsType, ServiceType, VehicleCategory, TaxSettings } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';

// Esquema de validação para tipo de serviço
const serviceTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string(),
  price: z.number().min(0).optional(),
  estimatedTime: z.number().min(0).optional(),
});

// Esquema de validação para categoria de veículo
const vehicleCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string(),
});

// Esquema de validação para impostos
const taxSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  percentage: z.number().min(0).max(100),
  applies_to: z.array(z.string()),
});

// Esquema de validação para termos e condições
const termsSchema = z.object({
  termsAndConditions: z.string(),
});

const BusinessSettings = () => {
  const { settings, saveSection, loading } = useSettings('business');
  const businessSettings = settings as BusinessSettingsType;
  
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  // Form para termos e condições
  const termsForm = useForm<z.infer<typeof termsSchema>>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      termsAndConditions: businessSettings?.termsAndConditions || '',
    },
  });
  
  // Form para tipo de serviço
  const serviceForm = useForm<z.infer<typeof serviceTypeSchema>>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      estimatedTime: 0,
    },
  });
  
  // Form para categoria de veículo
  const categoryForm = useForm<z.infer<typeof vehicleCategorySchema>>({
    resolver: zodResolver(vehicleCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  // Form para impostos
  const taxForm = useForm<z.infer<typeof taxSchema>>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: '',
      percentage: 0,
      applies_to: [],
    },
  });
  
  // Salvar termos e condições
  const onTermsSubmit = (data: z.infer<typeof termsSchema>) => {
    const success = saveSection('business', {
      termsAndConditions: data.termsAndConditions,
    });
    
    if (success) {
      toast.success('Termos e condições salvos com sucesso');
    }
  };
  
  // Adicionar ou atualizar tipo de serviço
  const onServiceSubmit = (data: z.infer<typeof serviceTypeSchema>) => {
    const serviceTypes = [...(businessSettings.serviceTypes || [])];
    
    if (editingItem) {
      // Atualizar serviço existente
      const index = serviceTypes.findIndex(s => s.id === editingItem);
      if (index !== -1) {
        serviceTypes[index] = {
          ...serviceTypes[index],
          ...data,
        };
      }
    } else {
      // Adicionar novo serviço
      serviceTypes.push({
        ...data,
        id: Date.now().toString(),
      });
    }
    
    const success = saveSection('business', { serviceTypes });
    
    if (success) {
      toast.success(editingItem ? 'Serviço atualizado com sucesso' : 'Serviço adicionado com sucesso');
      serviceForm.reset();
      setIsServiceDialogOpen(false);
      setEditingItem(null);
    }
  };
  
  // Adicionar ou atualizar categoria de veículo
  const onCategorySubmit = (data: z.infer<typeof vehicleCategorySchema>) => {
    const vehicleCategories = [...(businessSettings.vehicleCategories || [])];
    
    if (editingItem) {
      // Atualizar categoria existente
      const index = vehicleCategories.findIndex(c => c.id === editingItem);
      if (index !== -1) {
        vehicleCategories[index] = {
          ...vehicleCategories[index],
          ...data,
        };
      }
    } else {
      // Adicionar nova categoria
      vehicleCategories.push({
        ...data,
        id: Date.now().toString(),
      });
    }
    
    const success = saveSection('business', { vehicleCategories });
    
    if (success) {
      toast.success(editingItem ? 'Categoria atualizada com sucesso' : 'Categoria adicionada com sucesso');
      categoryForm.reset();
      setIsCategoryDialogOpen(false);
      setEditingItem(null);
    }
  };
  
  // Adicionar ou atualizar imposto
  const onTaxSubmit = (data: z.infer<typeof taxSchema>) => {
    const taxes = [...(businessSettings.taxes || [])];
    
    if (editingItem) {
      // Atualizar imposto existente
      const index = taxes.findIndex(t => t.name === editingItem);
      if (index !== -1) {
        taxes[index] = data;
      }
    } else {
      // Adicionar novo imposto
      taxes.push(data);
    }
    
    const success = saveSection('business', { taxes });
    
    if (success) {
      toast.success(editingItem ? 'Imposto atualizado com sucesso' : 'Imposto adicionado com sucesso');
      taxForm.reset();
      setIsTaxDialogOpen(false);
      setEditingItem(null);
    }
  };
  
  // Remover tipo de serviço
  const removeServiceType = (id: string) => {
    const serviceTypes = businessSettings.serviceTypes?.filter(s => s.id !== id) || [];
    const success = saveSection('business', { serviceTypes });
    
    if (success) {
      toast.success('Serviço removido com sucesso');
    }
  };
  
  // Remover categoria de veículo
  const removeVehicleCategory = (id: string) => {
    const vehicleCategories = businessSettings.vehicleCategories?.filter(c => c.id !== id) || [];
    const success = saveSection('business', { vehicleCategories });
    
    if (success) {
      toast.success('Categoria removida com sucesso');
    }
  };
  
  // Remover imposto
  const removeTax = (name: string) => {
    const taxes = businessSettings.taxes?.filter(t => t.name !== name) || [];
    const success = saveSection('business', { taxes });
    
    if (success) {
      toast.success('Imposto removido com sucesso');
    }
  };
  
  // Editar tipo de serviço
  const editServiceType = (service: ServiceType) => {
    serviceForm.reset({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      estimatedTime: service.estimatedTime,
    });
    setEditingItem(service.id);
    setIsServiceDialogOpen(true);
  };
  
  // Editar categoria de veículo
  const editVehicleCategory = (category: VehicleCategory) => {
    categoryForm.reset({
      id: category.id,
      name: category.name,
      description: category.description,
    });
    setEditingItem(category.id);
    setIsCategoryDialogOpen(true);
  };
  
  // Editar imposto
  const editTax = (tax: TaxSettings) => {
    taxForm.reset({
      name: tax.name,
      percentage: tax.percentage,
      applies_to: tax.applies_to,
    });
    setEditingItem(tax.name);
    setIsTaxDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Negócio</h2>
        <p className="text-sm text-gray-500">
          Configure os tipos de serviço, categorias de veículos, impostos e termos e condições
        </p>
      </div>
      
      <Separator />
      
      {/* Tipos de Serviço */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tipos de Serviço</CardTitle>
            <CardDescription>
              Gerencie os tipos de serviço oferecidos pela sua oficina
            </CardDescription>
          </div>
          <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  serviceForm.reset({
                    name: '',
                    description: '',
                    price: 0,
                    estimatedTime: 0,
                  });
                  setEditingItem(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Serviço' : 'Adicionar Serviço'}</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do tipo de serviço abaixo
                </DialogDescription>
              </DialogHeader>
              
              <Form {...serviceForm}>
                <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
                  <FormField
                    control={serviceForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={serviceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={serviceForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Base (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={serviceForm.control}
                      name="estimatedTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo Estimado (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">
                      {editingItem ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {businessSettings.serviceTypes && businessSettings.serviceTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço Base</TableHead>
                  <TableHead>Tempo Estimado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessSettings.serviceTypes.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>
                      {service.price ? `R$ ${service.price.toFixed(2)}` : 'Variável'}
                    </TableCell>
                    <TableCell>
                      {service.estimatedTime ? `${service.estimatedTime} min` : 'Variável'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => editServiceType(service)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeServiceType(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Nenhum tipo de serviço cadastrado
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Categorias de Veículos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categorias de Veículos</CardTitle>
            <CardDescription>
              Gerencie as categorias de veículos atendidos pela sua oficina
            </CardDescription>
          </div>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  categoryForm.reset({
                    name: '',
                    description: '',
                  });
                  setEditingItem(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Categoria' : 'Adicionar Categoria'}</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da categoria de veículo abaixo
                </DialogDescription>
              </DialogHeader>
              
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={categoryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      {editingItem ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {businessSettings.vehicleCategories && businessSettings.vehicleCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessSettings.vehicleCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => editVehicleCategory(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeVehicleCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Nenhuma categoria de veículo cadastrada
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Impostos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Impostos</CardTitle>
            <CardDescription>
              Configure os impostos aplicados aos serviços e produtos
            </CardDescription>
          </div>
          <Dialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  taxForm.reset({
                    name: '',
                    percentage: 0,
                    applies_to: [],
                  });
                  setEditingItem(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Imposto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Imposto' : 'Adicionar Imposto'}</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do imposto abaixo
                </DialogDescription>
              </DialogHeader>
              
              <Form {...taxForm}>
                <form onSubmit={taxForm.handleSubmit(onTaxSubmit)} className="space-y-4">
                  <FormField
                    control={taxForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!!editingItem} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={taxForm.control}
                    name="percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentual (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.01" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Aqui poderia ter um seletor para applies_to */}
                  
                  <DialogFooter>
                    <Button type="submit">
                      {editingItem ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {businessSettings.taxes && businessSettings.taxes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Percentual</TableHead>
                  <TableHead>Aplica-se a</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessSettings.taxes.map((tax) => (
                  <TableRow key={tax.name}>
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>{tax.percentage}%</TableCell>
                    <TableCell>{tax.applies_to.join(', ')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => editTax(tax)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeTax(tax.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Nenhum imposto cadastrado
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Termos e Condições */}
      <Card>
        <CardHeader>
          <CardTitle>Termos e Condições</CardTitle>
          <CardDescription>
            Configure os termos e condições para ordens de serviço e contratos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...termsForm}>
            <form onSubmit={termsForm.handleSubmit(onTermsSubmit)} className="space-y-4">
              <FormField
                control={termsForm.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termos e Condições</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={10}
                        placeholder="Digite aqui os termos e condições que serão exibidos em ordens de serviço e contratos..."
                      />
                    </FormControl>
                    <FormDescription>
                      Estes termos serão exibidos em ordens de serviço, orçamentos e contratos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading}>
                Salvar Termos e Condições
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSettings;
