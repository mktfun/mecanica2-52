
import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useForm } from 'react-hook-form';
import {
  BusinessSettings as IBusinessSettings,
  ServiceType,
  VehicleCategory,
  TaxSettings
} from '@/types/settings';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Save } from "lucide-react";

const BusinessSettings = () => {
  const { settings, saveSection } = useSettings('business');
  
  // Cast settings to BusinessSettings type
  const businessSettings = settings as IBusinessSettings;
  
  const [activeTab, setActiveTab] = useState("services");
  const [termsAndConditions, setTermsAndConditions] = useState('');
  
  // Service type form
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [newService, setNewService] = useState<Partial<ServiceType>>({
    name: '',
    description: '',
    price: 0,
    estimatedTime: 0
  });
  
  // Vehicle category form
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<VehicleCategory>>({
    name: '',
    description: ''
  });
  
  // Tax settings form
  const [taxes, setTaxes] = useState<TaxSettings[]>([]);
  const [editingTaxIndex, setEditingTaxIndex] = useState<number | null>(null);
  const [newTax, setNewTax] = useState<Partial<TaxSettings>>({
    name: '',
    percentage: 0,
    applies_to: []
  });
  
  useEffect(() => {
    if (businessSettings) {
      // Initialize state from settings
      if (businessSettings.termsAndConditions) {
        setTermsAndConditions(businessSettings.termsAndConditions);
      }
      
      if (businessSettings.serviceTypes) {
        setServiceTypes(businessSettings.serviceTypes);
      }
      
      if (businessSettings.vehicleCategories) {
        setVehicleCategories(businessSettings.vehicleCategories);
      }
      
      if (businessSettings.taxes) {
        setTaxes(businessSettings.taxes);
      }
    }
  }, [businessSettings]);
  
  // Save all settings
  const saveAllSettings = () => {
    return saveSection('business', {
      serviceTypes,
      vehicleCategories,
      taxes,
      termsAndConditions
    });
  };
  
  // Service Type functions
  const addServiceType = () => {
    if (!newService.name || newService.price === undefined) return;
    
    const serviceType: ServiceType = {
      id: Date.now().toString(),
      name: newService.name || '',
      description: newService.description,
      price: newService.price || 0,
      estimatedTime: newService.estimatedTime
    };
    
    setServiceTypes([...serviceTypes, serviceType]);
    setNewService({
      name: '',
      description: '',
      price: 0,
      estimatedTime: 0
    });
    
    saveSection('business', {
      ...businessSettings,
      serviceTypes: [...serviceTypes, serviceType]
    });
  };
  
  const deleteServiceType = (index: number) => {
    const updatedServices = [...serviceTypes];
    updatedServices.splice(index, 1);
    setServiceTypes(updatedServices);
    
    saveSection('business', {
      ...businessSettings,
      serviceTypes: updatedServices
    });
  };
  
  const startEditService = (index: number) => {
    setEditingServiceIndex(index);
    setNewService({ ...serviceTypes[index] });
  };
  
  const updateServiceType = () => {
    if (editingServiceIndex === null) return;
    if (!newService.name || newService.price === undefined) return;
    
    const updatedService: ServiceType = {
      id: serviceTypes[editingServiceIndex].id,
      name: newService.name,
      description: newService.description,
      price: newService.price || 0,
      estimatedTime: newService.estimatedTime
    };
    
    const updatedServices = [...serviceTypes];
    updatedServices[editingServiceIndex] = updatedService;
    
    setServiceTypes(updatedServices);
    setNewService({
      name: '',
      description: '',
      price: 0,
      estimatedTime: 0
    });
    setEditingServiceIndex(null);
    
    saveSection('business', {
      ...businessSettings,
      serviceTypes: updatedServices
    });
  };
  
  // Vehicle Category functions
  const addVehicleCategory = () => {
    if (!newCategory.name) return;
    
    const vehicleCategory: VehicleCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description
    };
    
    setVehicleCategories([...vehicleCategories, vehicleCategory]);
    setNewCategory({
      name: '',
      description: ''
    });
    
    saveSection('business', {
      ...businessSettings,
      vehicleCategories: [...vehicleCategories, vehicleCategory]
    });
  };
  
  const deleteVehicleCategory = (index: number) => {
    const updatedCategories = [...vehicleCategories];
    updatedCategories.splice(index, 1);
    setVehicleCategories(updatedCategories);
    
    saveSection('business', {
      ...businessSettings,
      vehicleCategories: updatedCategories
    });
  };
  
  const startEditCategory = (index: number) => {
    setEditingCategoryIndex(index);
    setNewCategory({ ...vehicleCategories[index] });
  };
  
  const updateVehicleCategory = () => {
    if (editingCategoryIndex === null) return;
    if (!newCategory.name) return;
    
    const updatedCategory: VehicleCategory = {
      id: vehicleCategories[editingCategoryIndex].id,
      name: newCategory.name,
      description: newCategory.description
    };
    
    const updatedCategories = [...vehicleCategories];
    updatedCategories[editingCategoryIndex] = updatedCategory;
    
    setVehicleCategories(updatedCategories);
    setNewCategory({
      name: '',
      description: ''
    });
    setEditingCategoryIndex(null);
    
    saveSection('business', {
      ...businessSettings,
      vehicleCategories: updatedCategories
    });
  };
  
  // Tax Settings functions
  const addTax = () => {
    if (!newTax.name || newTax.percentage === undefined) return;
    
    const tax: TaxSettings = {
      name: newTax.name,
      percentage: newTax.percentage,
      applies_to: newTax.applies_to || ['services', 'parts']
    };
    
    setTaxes([...taxes, tax]);
    setNewTax({
      name: '',
      percentage: 0,
      applies_to: []
    });
    
    saveSection('business', {
      ...businessSettings,
      taxes: [...taxes, tax]
    });
  };
  
  const deleteTax = (index: number) => {
    const updatedTaxes = [...taxes];
    updatedTaxes.splice(index, 1);
    setTaxes(updatedTaxes);
    
    saveSection('business', {
      ...businessSettings,
      taxes: updatedTaxes
    });
  };
  
  const startEditTax = (index: number) => {
    setEditingTaxIndex(index);
    setNewTax({ ...taxes[index] });
  };
  
  const updateTax = () => {
    if (editingTaxIndex === null) return;
    if (!newTax.name || newTax.percentage === undefined) return;
    
    const updatedTax: TaxSettings = {
      name: newTax.name,
      percentage: newTax.percentage,
      applies_to: newTax.applies_to || ['services', 'parts']
    };
    
    const updatedTaxes = [...taxes];
    updatedTaxes[editingTaxIndex] = updatedTax;
    
    setTaxes(updatedTaxes);
    setNewTax({
      name: '',
      percentage: 0,
      applies_to: []
    });
    setEditingTaxIndex(null);
    
    saveSection('business', {
      ...businessSettings,
      taxes: updatedTaxes
    });
  };
  
  // Save terms and conditions
  const saveTermsAndConditions = () => {
    saveSection('business', {
      ...businessSettings,
      termsAndConditions
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configurações do Negócio</h2>
      </div>
      
      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="vehicles">Categorias de Veículos</TabsTrigger>
          <TabsTrigger value="taxes">Impostos e Taxas</TabsTrigger>
          <TabsTrigger value="terms">Termos e Condições</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Serviço
                    </label>
                    <Input 
                      id="serviceName" 
                      value={newService.name || ''} 
                      onChange={(e) => setNewService({...newService, name: e.target.value})} 
                      placeholder="Ex: Troca de Óleo"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (R$)
                    </label>
                    <Input 
                      id="servicePrice"
                      type="number" 
                      value={newService.price || ''} 
                      onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})} 
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="serviceTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo Estimado (min)
                    </label>
                    <Input 
                      id="serviceTime"
                      type="number" 
                      value={newService.estimatedTime || ''} 
                      onChange={(e) => setNewService({...newService, estimatedTime: parseInt(e.target.value) || 0})} 
                      placeholder="60"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <Textarea 
                    id="serviceDescription"
                    value={newService.description || ''} 
                    onChange={(e) => setNewService({...newService, description: e.target.value})} 
                    placeholder="Descrição detalhada do serviço"
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end">
                  {editingServiceIndex !== null ? (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() =>  {
                        setEditingServiceIndex(null);
                        setNewService({
                          name: '',
                          description: '',
                          price: 0,
                          estimatedTime: 0
                        });
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={updateServiceType}>
                        Atualizar Serviço
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={addServiceType} disabled={!newService.name}>
                      <Plus size={16} className="mr-2" />
                      Adicionar Serviço
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-white rounded-md shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Serviços Cadastrados</h3>
            </div>
            
            {serviceTypes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum serviço cadastrado
              </div>
            ) : (
              <div className="divide-y">
                {serviceTypes.map((service, index) => (
                  <div key={service.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {service.description}
                      </div>
                      <div className="mt-1 flex gap-4 text-sm">
                        <span>Preço: R$ {service.price.toFixed(2)}</span>
                        {service.estimatedTime && <span>Tempo Estimado: {service.estimatedTime} min</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEditService(index)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteServiceType(index)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Categoria
                    </label>
                    <Input 
                      id="categoryName" 
                      value={newCategory.name || ''} 
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} 
                      placeholder="Ex: Carros de Passeio"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <Textarea 
                    id="categoryDescription"
                    value={newCategory.description || ''} 
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} 
                    placeholder="Descrição da categoria de veículo"
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end">
                  {editingCategoryIndex !== null ? (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() =>  {
                        setEditingCategoryIndex(null);
                        setNewCategory({
                          name: '',
                          description: ''
                        });
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={updateVehicleCategory}>
                        Atualizar Categoria
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={addVehicleCategory} disabled={!newCategory.name}>
                      <Plus size={16} className="mr-2" />
                      Adicionar Categoria
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-white rounded-md shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Categorias de Veículos</h3>
            </div>
            
            {vehicleCategories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhuma categoria cadastrada
              </div>
            ) : (
              <div className="divide-y">
                {vehicleCategories.map((category, index) => (
                  <div key={category.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEditCategory(index)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteVehicleCategory(index)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="taxes" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taxName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Imposto/Taxa
                    </label>
                    <Input 
                      id="taxName" 
                      value={newTax.name || ''} 
                      onChange={(e) => setNewTax({...newTax, name: e.target.value})} 
                      placeholder="Ex: ISS"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="taxPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                      Porcentagem (%)
                    </label>
                    <Input 
                      id="taxPercentage"
                      type="number"
                      step="0.01"
                      value={newTax.percentage || ''} 
                      onChange={(e) => setNewTax({...newTax, percentage: parseFloat(e.target.value) || 0})} 
                      placeholder="5.00"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Aplicar a:</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="applyToServices"
                      checked={newTax.applies_to?.includes('services') || false}
                      onChange={(e) => {
                        const currentAppliesTo = newTax.applies_to || [];
                        setNewTax({
                          ...newTax,
                          applies_to: e.target.checked 
                            ? [...currentAppliesTo, 'services']
                            : currentAppliesTo.filter(item => item !== 'services')
                        });
                      }}
                    />
                    <label htmlFor="applyToServices" className="text-sm text-gray-700">Serviços</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="applyToParts"
                      checked={newTax.applies_to?.includes('parts') || false}
                      onChange={(e) => {
                        const currentAppliesTo = newTax.applies_to || [];
                        setNewTax({
                          ...newTax,
                          applies_to: e.target.checked 
                            ? [...currentAppliesTo, 'parts']
                            : currentAppliesTo.filter(item => item !== 'parts')
                        });
                      }}
                    />
                    <label htmlFor="applyToParts" className="text-sm text-gray-700">Peças</label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  {editingTaxIndex !== null ? (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() =>  {
                        setEditingTaxIndex(null);
                        setNewTax({
                          name: '',
                          percentage: 0,
                          applies_to: []
                        });
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={updateTax}>
                        Atualizar Taxa
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={addTax} disabled={!newTax.name}>
                      <Plus size={16} className="mr-2" />
                      Adicionar Taxa
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-white rounded-md shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Impostos e Taxas</h3>
            </div>
            
            {taxes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum imposto/taxa cadastrado
              </div>
            ) : (
              <div className="divide-y">
                {taxes.map((tax, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{tax.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{tax.percentage}%</span> |
                        Aplica-se a: {tax.applies_to.map(item => 
                          item === 'services' ? 'Serviços' : 'Peças'
                        ).join(', ')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEditTax(index)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteTax(index)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-2">
                    Termos e Condições
                  </label>
                  <Textarea 
                    id="termsAndConditions"
                    value={termsAndConditions} 
                    onChange={(e) => setTermsAndConditions(e.target.value)} 
                    placeholder="Digite os termos e condições de serviço da sua oficina..."
                    rows={15}
                    className="h-96"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={saveTermsAndConditions}>
                    <Save size={16} className="mr-2" />
                    Salvar Termos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessSettings;
