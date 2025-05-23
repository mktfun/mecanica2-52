
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead, LeadStatus } from '@/types/lead';
import { toast } from 'sonner';

interface CustomLeadKanbanProps {
  leads: Lead[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onLeadClick: (lead: Lead) => void;
}

const LEAD_STATUSES = [
  { id: 'new' as LeadStatus, title: 'Novos Leads' },
  { id: 'contacted' as LeadStatus, title: 'Primeiro Contato' },
  { id: 'negotiation' as LeadStatus, title: 'Em Negociação' },
  { id: 'scheduled' as LeadStatus, title: 'Agendados' },
  { id: 'converted' as LeadStatus, title: 'Convertidos' },
  { id: 'lost' as LeadStatus, title: 'Perdidos' }
];

const CustomLeadKanban: React.FC<CustomLeadKanbanProps> = ({ 
  leads = [], // Default to empty array to prevent undefined
  onUpdateLead, 
  onLeadClick 
}) => {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  // Organizar leads por status with null safety
  const columns = LEAD_STATUSES.reduce((acc, status) => {
    acc[status.id] = {
      id: status.id,
      title: status.title,
      items: Array.isArray(leads) ? leads.filter(lead => lead.status === status.id) : []
    };
    return acc;
  }, {} as Record<LeadStatus, { id: LeadStatus; title: string; items: Lead[] }>);

  const handleDragStart = (result: any) => {
    if (!leads || !Array.isArray(leads)) return;
    const lead = leads.find(l => l.id === result.draggableId);
    setDraggedLead(lead || null);
  };

  const handleDragEnd = (result: any) => {
    setDraggedLead(null);
    
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    if (!leads || !Array.isArray(leads)) return;
    
    const lead = leads.find(l => l.id === draggableId);
    if (!lead) return;
    
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as LeadStatus;
      const destColumn = LEAD_STATUSES.find(s => s.id === newStatus);
      
      onUpdateLead(lead.id, {
        status: newStatus,
        status_changed_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString()
      });
      
      toast.success(`Lead movido para ${destColumn?.title}`);
    }
  };

  const getUrgencyClass = (lead: Lead) => {
    const lastInteraction = new Date(lead.last_interaction_at || lead.created_at);
    const daysSinceInteraction = Math.floor((new Date().getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceInteraction >= 4) return 'border-l-4 border-l-red-500';
    if (daysSinceInteraction >= 2) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-green-500';
  };

  // Show loading or empty state if leads is not properly loaded
  if (!leads || !Array.isArray(leads)) {
    return (
      <div className="w-full overflow-x-auto pb-6">
        <div className="flex gap-6 min-h-[calc(100vh-250px)]">
          {LEAD_STATUSES.map(status => (
            <div key={status.id} className="min-w-[280px] w-[280px] flex flex-col">
              <div className="bg-muted rounded-t-lg p-3 flex justify-between items-center border-b-2 border-border">
                <h3 className="font-semibold text-sm">{status.title}</h3>
                <Badge variant="secondary" className="rounded-full">0</Badge>
              </div>
              <div className="flex-1 p-2 bg-muted/40 rounded-b-lg overflow-y-auto">
                <div className="text-center p-4 text-sm text-muted-foreground">
                  Carregando leads...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-6">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                    {columns[status.id]?.items.map((lead, index) => (
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
                            onClick={() => onLeadClick(lead)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm truncate max-w-[70%]">{lead.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {lead.source || 'Não informado'}
                              </Badge>
                            </div>
                            
                            <div className="text-xs space-y-1 mb-2">
                              <div>{lead.phone}</div>
                              <div className="truncate">{lead.service_interest || 'Serviço não especificado'}</div>
                              <div className="text-muted-foreground">
                                {lead.vehicle ? 
                                  `${lead.vehicle.make} ${lead.vehicle.model} (${lead.vehicle.year || ''})` : 
                                  'Veículo não especificado'}
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                              <div>{lead.assigned_to || 'Não atribuído'}</div>
                              <div>
                                {lead.potential_value ? 
                                  `R$ ${lead.potential_value.toLocaleString('pt-BR')}` : 
                                  'Valor não informado'}
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
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
    </div>
  );
};

export default CustomLeadKanban;
