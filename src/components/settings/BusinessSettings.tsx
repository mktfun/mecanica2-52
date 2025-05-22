
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
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
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from '@/components/ui/sonner';
import { ServiceType, VehicleCategory, TaxSettings, BusinessSettings as BusinessSettingsType } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';

// Esquemas de validação
const serviceTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  estimatedTime: z.number().min(0).optional()
});

const vehicleCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  description: z.string().optional()
});

const taxSettingsSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  percentage: z.number().min(0).max(100),
  applies_to: z.array(z.string()).default([])
});

const termsSchema = z.object({
  termsAndConditions: z.string().min(10, { message: 'Termos e condições devem ter pelo menos 10 caracteres' })
});

const BusinessSettings = () => {
  const { settings, saveSection, loading } = useSettings('business');
  const [activeTab, setActiveTab] = useState('services');
  
  const [serviceDialog, setServiceDialog] = useState({ open: false, isEdit: false, editId: '' });
  const [vehicleDialog, setVehicleDialog] = useState({ open: false, isEdit: false, editId: '' });
  const [taxDialog, setTaxDialog] = useState({ open: false, isEdit: false, editId: '' });
  
  // Valores padrão para formulários
  const defaultBusinessSettings: BusinessSettingsType = {
    serviceTypes: [],
    vehicleCategories: [],
    taxes: [],
    termsAndConditions: ''
  };

  // Forms
  const serviceForm = useForm<z.infer<typeof serviceTypeSchema>>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      estimatedTime: 0
    }
  });

  const vehicleForm = useForm<z.infer<typeof vehicleCategorySchema>>({
    resolver: zodResolver(vehicleCategorySchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const taxForm = useForm<z.infer<typeof taxSettingsSchema>>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      name: '',
      percentage: 0,
      applies_to: []
    }
  });

  const termsForm = useForm<z.infer<typeof termsSchema>>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      termsAndConditions: settings?.termsAndConditions || ''
    }
  });

  // Obter dados ou usar valores padrão
  const businessData = settings || defaultBusinessSettings;
  const serviceTypes = businessData.serviceTypes || [];
  const vehicleCategories = businessData.vehicleCategories || [];
  const taxes = businessData.taxes || [];

  // Abrir diálogo para adicionar serviço
  const openAddServiceDialog = () => {
    serviceForm.reset({
      name: '',
      description: '',
      price: 0,
      estimatedTime: 0
    });
    setServiceDialog({ open: true, isEdit: false, editId: '' });
  };

  // Abrir diálogo para editar serviço
  const openEditServiceDialog = (service: ServiceType) => {
    serviceForm.reset({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      estimatedTime: service.estimatedTime
    });
    setServiceDialog({ open: true, isEdit: true, editId: service.id });
  };

  // Abrir diálogo para adicionar categoria
  const openAddVehicleDialog = () => {
    vehicleForm.reset({
      name: '',
      description: ''
    });
    setVehicleDialog({ open: true, isEdit: false, editId: '' });
  };

  // Abrir diálogo para editar categoria
  const openEditVehicleDialog = (category: VehicleCategory) => {
    vehicleForm.reset({
      id: category.id,
      name: category.name,
      description: category.description
    });
    setVehicleDialog({ open: true, isEdit: true, editId: category.id });
  };

  // Abrir diálogo para adicionar taxa
  const openAddTaxDialog = () => {
    taxForm.reset({
      name: '',
      percentage: 0,
      applies_to: []
    });
    setTaxDialog({ open: true, isEdit: false, editId: '' });
  };

  // Abrir diálogo para editar taxa
  const openEditTaxDialog = (tax: TaxSettings) => {
    taxForm.reset({
      name: tax.name,
      percentage: tax.percentage,
      applies_to: tax.applies_to || []
    });
    setTaxDialog({ open: true, isEdit: true, editId: tax.name });
  };

  // Remover serviço
  const removeService = (id: string) => {
    const updatedServices = serviceTypes.filter(service => service.id !== id);
    const success = saveSection('business', { serviceTypes: updatedServices });
    
    if (success) {
      toast.success('Serviço removido com sucesso');
    }
  };

  // Remover categoria
  const removeVehicleCategory = (id: string) => {
    const updatedCategories = vehicleCategories.filter(category => category.id !== id);
    const success = saveSection('business', { vehicleCategories: updatedCategories });
    
    if (success) {
      toast.success('Categoria removida com sucesso');
    }
  };

  // Remover taxa
  const removeTax = (name: string) => {
    const updatedTaxes = taxes.filter(tax => tax.name !== name);
    const success = saveSection('business', { taxes: updatedTaxes });
    
    if (success) {
      toast.success('Taxa removida com sucesso');
    }
  };

  // Salvar serviço
  const onServiceSubmit = (data: z.infer<typeof serviceTypeSchema>) => {
    let updatedServices = [...serviceTypes];
    
    if (serviceDialog.isEdit) {
      // Atualizar serviço existente
      updatedServices = updatedServices.map(service =>
        service.id === serviceDialog.editId ? { ...data, id: service.id } : service
      );
    } else {
      // Adicionar novo serviço
      updatedServices.push({
        ...data,
        id: Date.now().toString()
      });
    }
    
    const success = saveSection('business', { serviceTypes: updatedServices });
    
    if (success) {
      toast.success(serviceDialog.isEdit ? 'Serviço atualizado com sucesso' : 'Serviço adicionado com sucesso');
      setServiceDialog({ open: false, isEdit: false, editId: '' });
    }
  };

  // Salvar categoria
  const onVehicleSubmit = (data: z.infer<typeof vehicleCategorySchema>) => {
    let updatedCategories = [...vehicleCategories];
    
    if (vehicleDialog.isEdit) {
      // Atualizar categoria existente
      updatedCategories = updatedCategories.map(category =>
        category.id === vehicleDialog.editId ? { ...data, id: category.id } : category
      );
    } else {
      // Adicionar nova categoria
      updatedCategories.push({
        ...data,
        id: Date.now().toString()
      });
    }
    
    const success = saveSection('business', { vehicleCategories: updatedCategories });
    
    if (success) {
      toast.success(vehicleDialog.isEdit ? 'Categoria atualizada com sucesso' : 'Categoria adicionada com sucesso');
      setVehicleDialog({ open: false, isEdit: false, editId: '' });
    }
  };

  // Salvar taxa
  const onTaxSubmit = (data: z.infer<typeof taxSettingsSchema>) => {
    let updatedTaxes = [...taxes];
    
    if (taxDialog.isEdit) {
      // Atualizar taxa existente
      updatedTaxes = updatedTaxes.map(tax =>
        tax.name === taxDialog.editId ? { ...data } : tax
      );
    } else {
      // Adicionar nova taxa
      updatedTaxes.push(data);
    }
    
    const success = saveSection('business', { taxes: updatedTaxes });
    
    if (success) {
      toast.success(taxDialog.isEdit ? 'Taxa atualizada com sucesso' : 'Taxa adicionada com sucesso');
      setTaxDialog({ open: false, isEdit: false, editId: '' });
    }
  };

  // Salvar termos e condições
  const onTermsSubmit = (data: z.infer<typeof termsSchema>) => {
    const success = saveSection('business', { termsAndConditions: data.termsAndConditions });
    
    if (success) {
      toast.success('Termos e condições salvos com sucesso');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Negócio</h2>
        <p className="text-sm text-gray-500">
          Gerencie os aspectos comerciais e operacionais do sistema
        </p>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="taxes">Impostos</TabsTrigger>
          <TabsTrigger value="terms">Termos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Serviço</CardTitle>
                <CardDescription>
                  Configure os serviços oferecidos pela sua oficina
                </CardDescription>
              </div>
              <Button onClick={openAddServiceDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </CardHeader>
            <CardContent>
              {serviceTypes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500 mb-4">
                    Nenhum tipo de serviço cadastrado
                  </p>
                  <Button onClick={openAddServiceDialog} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Serviço
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Duração Estimada</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceTypes.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.description || '-'}</TableCell>
                        <TableCell>
                          {service.price 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price) 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {service.estimatedTime 
                            ? `${service.estimatedTime} minutos` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditServiceDialog(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categorias de Veículos</CardTitle>
                <CardDescription>
                  Configure as categorias de veículos atendidos
                </CardDescription>
              </div>
              <Button onClick={openAddVehicleDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </CardHeader>
            <CardContent>
              {vehicleCategories.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500 mb-4">
                    Nenhuma categoria de veículo cadastrada
                  </p>
                  <Button onClick={openAddVehicleDialog} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Primeira Categoria
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicleCategories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <CardTitle>{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">{category.description || 'Sem descrição'}</p>
                      </CardContent>
                      <div className="flex justify-end p-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="mr-2"
                          onClick={() => openEditVehicleDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeVehicleCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="taxes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Impostos e Taxas</CardTitle>
                <CardDescription>
                  Configure os impostos e taxas aplicáveis aos serviços
                </CardDescription>
              </div>
              <Button onClick={openAddTaxDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Taxa
              </Button>
            </CardHeader>
            <CardContent>
              {taxes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500 mb-4">
                    Nenhum imposto ou taxa cadastrado
                  </p>
                  <Button onClick={openAddTaxDialog} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Imposto/Taxa
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Percentual</TableHead>
                      <TableHead>Aplicável a</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxes.map((tax) => (
                      <TableRow key={tax.name}>
                        <TableCell className="font-medium">{tax.name}</TableCell>
                        <TableCell>{tax.percentage}%</TableCell>
                        <TableCell>
                          {tax.applies_to && tax.applies_to.length > 0 
                            ? tax.applies_to.join(', ')
                            : 'Todos os serviços'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditTaxDialog(tax)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Termos e Condições</CardTitle>
              <CardDescription>
                Configure os termos e condições para ordens de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...termsForm}>
                <form onSubmit={termsForm.handleSubmit(onTermsSubmit)} className="space-y-6">
                  <FormField
                    control={termsForm.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termos e Condições</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={10} 
                            placeholder="Digite os termos e condições padrão para ordens de serviço..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Estes termos serão exibidos em todas as ordens de serviço
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      Salvar Termos
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para adicionar/editar serviço */}
      <Dialog open={serviceDialog.open} onOpenChange={(open) => setServiceDialog({ ...serviceDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{serviceDialog.isEdit ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            <DialogDescription>
              {serviceDialog.isEdit 
                ? 'Atualize as informações do serviço' 
                : 'Preencha os dados do novo serviço'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-6">
              <FormField
                control={serviceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço*</FormLabel>
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
              
              <FormField
                control={serviceForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Preço base para este serviço (0 = variável)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={serviceForm.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Duração estimada do serviço em minutos (0 = variável)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setServiceDialog({ ...serviceDialog, open: false })}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {serviceDialog.isEdit ? 'Atualizar' : 'Adicionar'} Serviço
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para adicionar/editar categoria de veículo */}
      <Dialog open={vehicleDialog.open} onOpenChange={(open) => setVehicleDialog({ ...vehicleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{vehicleDialog.isEdit ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {vehicleDialog.isEdit 
                ? 'Atualize as informações da categoria' 
                : 'Preencha os dados da nova categoria'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...vehicleForm}>
            <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-6">
              <FormField
                control={vehicleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={vehicleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Uma breve descrição da categoria de veículo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setVehicleDialog({ ...vehicleDialog, open: false })}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {vehicleDialog.isEdit ? 'Atualizar' : 'Adicionar'} Categoria
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para adicionar/editar taxa/imposto */}
      <Dialog open={taxDialog.open} onOpenChange={(open) => setTaxDialog({ ...taxDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{taxDialog.isEdit ? 'Editar Taxa/Imposto' : 'Nova Taxa/Imposto'}</DialogTitle>
            <DialogDescription>
              {taxDialog.isEdit 
                ? 'Atualize as informações da taxa ou imposto' 
                : 'Preencha os dados da nova taxa ou imposto'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...taxForm}>
            <form onSubmit={taxForm.handleSubmit(onTaxSubmit)} className="space-y-6">
              <FormField
                control={taxForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Taxa/Imposto*</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Percentual (%)*</FormLabel>
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
              
              <FormField
                control={taxForm.control}
                name="applies_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aplicável a</FormLabel>
                    <FormDescription>
                      Deixe em branco para aplicar a todos os serviços
                    </FormDescription>
                    {serviceTypes.length > 0 ? (
                      <div className="space-y-2 border rounded-md p-4">
                        {serviceTypes.map(service => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`service-${service.id}`}
                              checked={field.value.includes(service.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, service.id]);
                                } else {
                                  field.onChange(field.value.filter(id => id !== service.id));
                                }
                              }}
                            />
                            <label htmlFor={`service-${service.id}`}>{service.name}</label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum serviço cadastrado</p>
                    )}
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setTaxDialog({ ...taxDialog, open: false })}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {taxDialog.isEdit ? 'Atualizar' : 'Adicionar'} Taxa/Imposto
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessSettings;
