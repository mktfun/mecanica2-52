import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Lead, LeadStatus } from "@/types/lead";
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";

export interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadAdded?: () => void;
  onLeadUpdated?: () => void;
  initialData?: Lead;
  lead?: Lead;
  isEdit?: boolean;
}

const DEFAULT_LEAD: Partial<Lead> = {
  name: '',
  email: '',
  phone: '',
  vehicle_brand: '',
  vehicle_model: '',
  vehicle_year: '',
  service_interest: '',
  source: 'direct',
  potential_value: 0,
  assigned_to: '',
  status: 'new',
  notes: '',
};

export function LeadFormModal({
  open,
  onOpenChange,
  onLeadAdded,
  onLeadUpdated,
  initialData,
  lead,
  isEdit = false
}: LeadFormModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>(DEFAULT_LEAD);

  useEffect(() => {
    if ((initialData || lead) && open) {
      setFormData(initialData || lead || DEFAULT_LEAD);
    } else if (!isEdit && !(initialData || lead) && open) {
      setFormData(DEFAULT_LEAD);
    }
  }, [initialData, lead, open, isEdit]);

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.name?.trim()) {
        toast.error("Nome é obrigatório");
        return;
      }
      
      if (!formData.phone?.trim()) {
        toast.error("Telefone é obrigatório");
        return;
      }
      
      if (isEdit && (initialData?.id || lead?.id)) {
        // Atualizar lead existente
        enhancedLeadsStore.update(initialData?.id || lead?.id || '', {
          ...formData,
          updated_at: new Date().toISOString(),
        } as Lead);
        toast.success("Lead atualizado com sucesso!");
        if (onLeadUpdated) onLeadUpdated();
      } else {
        // Adicionar novo lead
        enhancedLeadsStore.add({
          ...formData,
          status_changed_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString(),
        } as Omit<Lead, 'id' | 'created_at'>);
        toast.success("Lead adicionado com sucesso!");
        if (onLeadAdded) onLeadAdded();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      toast.error("Erro ao salvar o lead");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Atualize as informações do lead existente.' 
              : 'Preencha os dados para cadastrar um novo lead no sistema.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="potential_value">Valor Potencial</Label>
                <Input
                  id="potential_value"
                  type="number"
                  value={formData.potential_value || 0}
                  onChange={(e) => handleChange('potential_value', parseFloat(e.target.value))}
                  placeholder="R$ 0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vehicle_brand">Marca do Veículo</Label>
                <Input
                  id="vehicle_brand"
                  value={formData.vehicle_brand || ''}
                  onChange={(e) => handleChange('vehicle_brand', e.target.value)}
                  placeholder="Marca"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vehicle_model">Modelo do Veículo</Label>
                <Input
                  id="vehicle_model"
                  value={formData.vehicle_model || ''}
                  onChange={(e) => handleChange('vehicle_model', e.target.value)}
                  placeholder="Modelo"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vehicle_year">Ano do Veículo</Label>
                <Input
                  id="vehicle_year"
                  value={formData.vehicle_year || ''}
                  onChange={(e) => handleChange('vehicle_year', e.target.value)}
                  placeholder="Ano"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="service_interest">Serviço de Interesse</Label>
                <Input
                  id="service_interest"
                  value={formData.service_interest || ''}
                  onChange={(e) => handleChange('service_interest', e.target.value)}
                  placeholder="Serviço"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="source">Fonte</Label>
                <Select 
                  value={formData.source || 'direct'} 
                  onValueChange={(value) => handleChange('source', value)}
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direto</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="meta_ads">Meta Ads</SelectItem>
                    <SelectItem value="referral">Indicação</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="assigned_to">Atribuído a</Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={(e) => handleChange('assigned_to', e.target.value)}
                  placeholder="Responsável"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status as string || 'new'} 
                  onValueChange={(value) => handleChange('status', value as LeadStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="contacted">Contatado</SelectItem>
                    <SelectItem value="negotiation">Em Negociação</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="lost">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Observações sobre o lead"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEdit ? 'Atualizar Lead' : 'Adicionar Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
