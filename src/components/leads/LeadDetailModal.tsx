
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Lead } from '@/types/lead';
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import LeadFormModal from './LeadFormModal';
import { eventBus } from '@/core/events/EventBus';

const LEAD_STATUS_LABELS: Record<string, string> = {
  'new': 'Novo Lead',
  'contacted': 'Primeiro Contato',
  'negotiation': 'Em Negociação',
  'scheduled': 'Agendado',
  'converted': 'Convertido',
  'lost': 'Perdido'
};

interface LeadHistoryItem {
  id: string;
  timestamp: string;
  text: string;
  type: 'comment' | 'status' | 'interaction';
}

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated?: () => void;
}

const LeadDetailModal = ({ lead, open, onOpenChange, onLeadUpdated }: LeadDetailModalProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [history, setHistory] = useState<LeadHistoryItem[]>(() => {
    // Criar histórico inicial com base nos timestamps do lead
    const initialHistory: LeadHistoryItem[] = [
      {
        id: '1',
        timestamp: lead.created_at,
        text: 'Lead criado',
        type: 'status'
      }
    ];
    
    if (lead.status_changed_at && lead.status_changed_at !== lead.created_at) {
      initialHistory.push({
        id: '2',
        timestamp: lead.status_changed_at,
        text: `Status alterado para ${LEAD_STATUS_LABELS[lead.status] || lead.status}`,
        type: 'status'
      });
    }
    
    return initialHistory;
  });
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    try {
      const now = new Date().toISOString();
      
      // Atualizar last_interaction_at no lead
      const updatedLead = {
        ...lead,
        last_interaction_at: now,
        updated_at: now
      };
      
      enhancedLeadsStore.update(lead.id, updatedLead);
      
      // Adicionar comentário ao histórico local
      const newHistoryItem: LeadHistoryItem = {
        id: Date.now().toString(),
        timestamp: now,
        text: newComment,
        type: 'comment'
      };
      
      setHistory([...history, newHistoryItem]);
      setNewComment('');
      
      // Notificar sobre atualização (opcional, pois o evento já será disparado pelo update)
      onLeadUpdated?.();
      
      toast.success('Comentário adicionado');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleAddInteraction = (type: string) => {
    try {
      const now = new Date().toISOString();
      
      // Atualizar last_interaction_at no lead
      const updatedLead = {
        ...lead,
        last_interaction_at: now,
        updated_at: now
      };
      
      enhancedLeadsStore.update(lead.id, updatedLead);
      
      // Adicionar interação ao histórico local
      const newHistoryItem: LeadHistoryItem = {
        id: Date.now().toString(),
        timestamp: now,
        text: `Interação registrada: ${type}`,
        type: 'interaction'
      };
      
      setHistory([...history, newHistoryItem]);
      
      // Notificar sobre atualização (opcional, pois o evento já será disparado pelo update)
      onLeadUpdated?.();
      
      // Publicar evento de interação
      eventBus.publish('lead:interaction', {
        leadId: lead.id,
        type,
        timestamp: now
      });
      
      toast.success('Interação registrada');
    } catch (error) {
      console.error('Erro ao registrar interação:', error);
      toast.error('Erro ao registrar interação');
    }
  };

  // Ordenar histórico por data (mais recente primeiro)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Detalhes do Lead</DialogTitle>
              <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                Editar Lead
              </Button>
            </div>
          </DialogHeader>
          
          <div className="mt-4 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{lead.name}</h2>
              <Badge>{LEAD_STATUS_LABELS[lead.status] || lead.status}</Badge>
            </div>
            
            <Card className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p>{lead.phone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{lead.email || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p>{lead.vehicle_brand} {lead.vehicle_model} ({lead.vehicle_year})</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Serviço de Interesse</p>
                    <p>{lead.service_interest}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Fonte</p>
                    <p>{lead.source}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Potencial</p>
                    <p>{formatCurrency(lead.potential_value)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Responsável</p>
                    <p>{lead.assigned_to}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                {lead.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="whitespace-pre-line">{lead.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Tabs defaultValue="history">
              <TabsList className="w-full">
                <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
                <TabsTrigger value="interaction" className="flex-1">Adicionar Interação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-4">
                <div className="space-y-3">
                  {sortedHistory.map(item => (
                    <div key={item.id} className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between text-sm">
                        <Badge variant={
                          item.type === 'comment' ? 'outline' : 
                          item.type === 'interaction' ? 'secondary' : 'default'
                        }>
                          {item.type === 'comment' ? 'Comentário' : 
                           item.type === 'interaction' ? 'Interação' : 'Sistema'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="mt-1">{item.text}</p>
                    </div>
                  ))}
                  
                  {history.length === 0 && (
                    <p className="text-center text-muted-foreground p-4">
                      Sem histórico registrado
                    </p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="interaction" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Button onClick={() => handleAddInteraction('Telefonema')}>
                      Registrar Telefonema
                    </Button>
                    <Button onClick={() => handleAddInteraction('WhatsApp')}>
                      Registrar WhatsApp
                    </Button>
                    <Button onClick={() => handleAddInteraction('E-mail')}>
                      Registrar E-mail
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Adicione um comentário..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={handleAddComment} className="w-full">
                      Adicionar Comentário
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      
      {isEditModalOpen && (
        <LeadFormModal 
          lead={lead}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onLeadUpdated={() => {
            onLeadUpdated();
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
};

export default LeadDetailModal;
