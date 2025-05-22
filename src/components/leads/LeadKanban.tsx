import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LeadDetailModal from './LeadDetailModal';
import { enhancedLeadsStore } from '@/core/storage/StorageService';
import { Lead, LeadStatus, LeadColumns } from '@/types/lead';
import { toast } from 'sonner';
import { useStorageData } from '@/hooks/useStorageData';

const LEAD_STATUSES = [
  { id: 'new' as LeadStatus, title: 'Novos Leads' },
  { id: 'contacted' as LeadStatus, title: 'Primeiro Contato' },
  { id: 'negotiation' as LeadStatus, title: 'Em Negociação' },
  { id: 'scheduled' as LeadStatus, title: 'Agendados' },
  { id: 'converted' as LeadStatus, title: 'Convertidos' },
  { id: 'lost' as LeadStatus, title: 'Perdidos' }
];

const LeadKanban = () => {
  // Usar hook de dados com atualização automática para leads
  const leads = useStorageData<Lead>(enhancedLeadsStore);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Organizar leads por status
  const columns: LeadColumns = LEAD_STATUSES.reduce((acc, status) => {
    acc[status.id] = {
      id: status.id,
      title: status.title,
      items: leads.filter(lead => lead.status === status.id) || []
    };
    return acc;
  }, {} as LeadColumns);

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    
    // Verificar se o item foi solto em uma área válida
    if (!destination) return;
    
    // Verificar se o item foi movido para uma coluna diferente
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Obter coluna de origem e destino
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    // Obter o lead que está sendo movido
    const lead = sourceColumn.items.find(item => item.id === draggableId);
    if (!lead) return;
    
    // Se movido para outra coluna, atualizar status
    if (source.droppableId !== destination.droppableId) {
      const updatedLead = {
        ...lead,
        status: destination.droppableId as LeadStatus,
        status_changed_at: new Date().toISOString()
      };
      
      // Atualizar no localStorage com o serviço aprimorado
      try {
        enhancedLeadsStore.update(lead.id, updatedLead);
        toast.success(`Lead movido para ${destColumn.title}`);
      } catch (error) {
        console.error('Erro ao atualizar status do lead:', error);
        toast.error('Não foi possível atualizar o status do lead.');
      }
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const getUrgencyClass = (lead: Lead) => {
    const lastInteraction = new Date(lead.last_interaction_at || lead.created_at);
    const daysSinceInteraction = Math.floor((new Date().getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceInteraction >= 4) return 'border-l-4 border-l-red-500';
    if (daysSinceInteraction >= 2) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-green-500';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando leads...</div>;
  }

  return (
    <div className="w-full overflow-x-auto pb-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 min-h-[calc(100vh-250px)]">
          {LEAD_STATUSES.map(status => (
            <div key={status.id} className="min-w-[280px] w-[280px] flex flex-col">
              <div className="bg-muted rounded-t-lg p-3 flex justify-between items-center border-b-2 border-border">
                <h3 className="font-semibold text-sm">{status.title}</h3>
                <Badge variant="secondary" className="rounded-full">
                  {columns[status.id]?.items.length || 0}
                </Badge>
              </div>
              
              <Droppable droppableId={status.id}>
                {(provided) => (
                  <div
                    className="flex-1 p-2 bg-muted/40 rounded-b-lg overflow-y-auto"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {columns[status.id]?.items.map((lead, index) => {
                      const timeInStatus = formatDistanceToNow(
                        new Date(lead.status_changed_at || lead.created_at),
                        { addSuffix: true, locale: ptBR }
                      );
                      
                      return (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 p-3 hover:shadow-md transition-all cursor-pointer ${
                                snapshot.isDragging ? 'rotate-2 scale-105' : ''
                              } ${getUrgencyClass(lead)}`}
                              onClick={() => handleLeadClick(lead)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm truncate max-w-[70%]">{lead.name}</h4>
                                <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                              </div>
                              
                              <div className="text-xs space-y-1 mb-2">
                                <div>{lead.phone}</div>
                                <div className="truncate">{lead.service_interest}</div>
                                <div className="text-muted-foreground">
                                  {lead.vehicle_brand} {lead.vehicle_model} ({lead.vehicle_year})
                                </div>
                              </div>
                              
                              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                                <div>Resp: {lead.assigned_to}</div>
                                <div>Na coluna: {timeInStatus}</div>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    
                    {columns[status.id]?.items.length === 0 && (
                      <div className="text-center p-4 text-sm text-muted-foreground">
                        Sem leads neste estágio
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {isDetailModalOpen && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
        />
      )}
    </div>
  );
};

export default LeadKanban;
