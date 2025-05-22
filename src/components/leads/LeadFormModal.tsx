import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { leadsStore } from '@/services/localStorageService';
import { Lead } from '@/types/lead';

interface LeadFormModalProps {
  lead?: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadAdded?: () => void;
  onLeadUpdated?: () => void;
}

const leadFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').or(z.string().length(0)),
  vehicle_brand: z.string().min(2, 'Informe a marca do veículo'),
  vehicle_model: z.string().min(2, 'Informe o modelo do veículo'),
  vehicle_year: z.string().regex(/^\d{4}$/, 'Ano deve conter 4 dígitos'),
  service_interest: z.string().min(3, 'Informe o serviço de interesse'),
  source: z.string().min(2, 'Informe a fonte do lead'),
  potential_value: z.coerce.number().min(0, 'Valor deve ser positivo'),
  assigned_to: z.string().min(2, 'Informe o responsável pelo lead'),
  notes: z.string().optional(),
  status: z.string().default('new')
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const LeadFormModal = ({ lead, open, onOpenChange, onLeadAdded, onLeadUpdated }: LeadFormModalProps) => {
  const isEditing = !!lead;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: isEditing
      ? {
          name: lead.name,
          phone: lead.phone,
          email: lead.email || '',
          vehicle_brand: lead.vehicle_brand,
          vehicle_model: lead.vehicle_model,
          vehicle_year: lead.vehicle_year,
          service_interest: lead.service_interest,
          source: lead.source || 'Site',  // Ensure source is never empty
          potential_value: lead.potential_value,
          assigned_to: lead.assigned_to,
          notes: lead.notes || '',
          status: lead.status,
        }
      : {
          name: '',
          phone: '',
          email: '',
          vehicle_brand: '',
          vehicle_model: '',
          vehicle_year: new Date().getFullYear().toString(),
          service_interest: '',
          source: 'Site',
          potential_value: 0,
          assigned_to: '',
          notes: '',
          status: 'new',
        }
  });

  const handleSubmit = (values: LeadFormValues) => {
    try {
      const now = new Date().toISOString();
      
      if (isEditing) {
        // Atualizar lead existente
        const updatedLead = {
          ...lead,
          ...values,
          updated_at: now,
        };
        
        leadsStore.update(lead.id, updatedLead);
        onOpenChange(false);
        onLeadUpdated?.();
      } else {
        // Criar novo lead
        const newLead = {
          ...values,
          id: Date.now().toString(),
          created_at: now,
          updated_at: now,
          status_changed_at: now,
          last_interaction_at: now,
        } as Lead;
        
        leadsStore.add(newLead);
        form.reset();
        onOpenChange(false);
        onLeadAdded?.();
      }
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    }
  };

  console.log("Source options in LeadFormModal:", ["Site", "Google Ads", "Meta Ads", "Indicação", "Telefone", "WhatsApp", "Presencial"]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lead' : 'Cadastrar Novo Lead'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone*</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vehicle_brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca do Veículo*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicle_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Corolla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicle_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="service_interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço de Interesse*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Revisão completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fonte do Lead*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "Site"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a fonte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Site">Site</SelectItem>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                        <SelectItem value="Indicação">Indicação</SelectItem>
                        <SelectItem value="Telefone">Telefone</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="potential_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Potencial (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "new"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">Novo Lead</SelectItem>
                        <SelectItem value="contacted">Primeiro Contato</SelectItem>
                        <SelectItem value="negotiation">Em Negociação</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="converted">Convertido</SelectItem>
                        <SelectItem value="lost">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o lead" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
