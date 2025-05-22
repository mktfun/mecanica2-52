import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Filter, Calendar, Search, Plus, Edit, Trash2, Settings } from 'lucide-react';

import LeadDetailModal from './LeadDetailModal';
import ColumnSettingsModal from './ColumnSettingsModal';
import { leadsStore, kanbanConfigStore } from '@/services/localStorageService';
import { Lead, LeadStatus, LeadColumns, KanbanColumn } from '@/types/lead';

// Definição das colunas padrão caso não existam configurações salvas
const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'new', title: 'Novos Leads', color: '#e6f7ff', order: 0 },
  { id: 'contacted', title: 'Primeiro Contato', color: '#fff7e6', order: 1 },
  { id: 'negotiation', title: 'Em Negociação', color: '#e6fffb', order: 2 },
  { id: 'scheduled', title: 'Agendados', color: '#f6ffed', order: 3 },
  { id: 'converted', title: 'Convertidos', color: '#f9f0ff', order: 4 },
  { id: 'lost', title: 'Perdidos', color: '#fff1f0', order: 5 }
];

const LeadKanban = () => {
  const [columns, setColumns] = useState<LeadColumns>({});
  const [kanbanConfig, setKanbanConfig] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(null);
  const [filters, setFilters] = useState({
    source: '',
    dateFrom: '',
    dateTo: '',
    service: '',
    searchText: ''
  });
  
  const kanbanRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const scrollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadKanbanConfig();
  }, []);

  useEffect(() => {
    if (kanbanConfig.length > 0) {
      fetchLeads();
    }
  }, [kanbanConfig]);

  const loadKanbanConfig = () => {
    try {
      // Tentar carregar a configuração do Kanban do localStorage
      const config = kanbanConfigStore.getAll();
      
      if (config && config.length > 0) {
        setKanbanConfig(config);
      } else {
        // Se não existir configuração, usar a padrão e salvar
        setKanbanConfig(DEFAULT_COLUMNS);
        DEFAULT_COLUMNS.forEach(column => {
          kanbanConfigStore.add(column);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração do Kanban:', error);
      toast.error('Não foi possível carregar a configuração do Kanban');
      setKanbanConfig(DEFAULT_COLUMNS);
    }
  };

  const fetchLeads = () => {
    try {
      setIsLoading(true);
      const leads = leadsStore.getAll();
      
      // Organizar leads por status
      const columnData: LeadColumns = {};
      kanbanConfig.forEach(column => {
        columnData[column.id] = {
          id: column.id as LeadStatus,
          title: column.title,
          color: column.color,
          order: column.order,
          items: leads.filter(lead => lead.status === column.id) || []
        };
      });
      
      setColumns(columnData);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Não foi possível carregar os leads.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    
    // Limpar qualquer scroll automático
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    isDraggingRef.current = false;
    
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
    
    // Criar novas arrays de items
    const newSourceItems = [...sourceColumn.items];
    newSourceItems.splice(source.index, 1);
    
    const newDestItems = [...destColumn.items];
    
    // Se movido para a mesma coluna, apenas reordenar
    if (source.droppableId === destination.droppableId) {
      newSourceItems.splice(destination.index, 0, lead);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: newSourceItems
        }
      });
    } else {
      // Se movido para outra coluna, atualizar status e adicionar à nova coluna
      const updatedLead = {
        ...lead,
        status: destination.droppableId as LeadStatus,
        status_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      newDestItems.splice(destination.index, 0, updatedLead);
      
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: newSourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: newDestItems
        }
      });
      
      // Atualizar no localStorage
      try {
        leadsStore.update(lead.id, updatedLead);
        toast.success(`Lead movido para ${destColumn.title}`);
      } catch (error) {
        console.error('Erro ao atualizar status do lead:', error);
        toast.error('Não foi possível atualizar o status do lead.');
        fetchLeads(); // Recarrega em caso de erro
      }
    }
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragUpdate = (update: any) => {
    if (!isDraggingRef.current || !kanbanRef.current) return;
    
    const container = kanbanRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollSpeed = 15;
    
    // Limpar qualquer scroll automático existente
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    
    // Se o cursor estiver próximo às bordas, iniciar o scroll automático
    if (update.clientX < containerRect.left + 100) {
      scrollIntervalRef.current = window.setInterval(() => {
        container.scrollLeft -= scrollSpeed;
      }, 20);
    } else if (update.clientX > containerRect.right - 100) {
      scrollIntervalRef.current = window.setInterval(() => {
        container.scrollLeft += scrollSpeed;
      }, 20);
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleConfigClick = (column?: KanbanColumn) => {
    setSelectedColumn(column || null);
    setIsConfigModalOpen(true);
  };

  const handleColumnUpdate = (updatedColumn: KanbanColumn) => {
    try {
      // Atualizar ou adicionar coluna na configuração
      let newConfig: KanbanColumn[];
      
      if (updatedColumn.id) {
        // Atualizar coluna existente
        newConfig = kanbanConfig.map(col => 
          col.id === updatedColumn.id ? updatedColumn : col
        );
        kanbanConfigStore.update(updatedColumn.id, updatedColumn);
      } else {
        // Adicionar nova coluna
        const newId = `column-${Date.now()}`;
        const newColumn = {
          ...updatedColumn,
          id: newId,
          order: kanbanConfig.length
        };
        newConfig = [...kanbanConfig, newColumn];
        kanbanConfigStore.add(newColumn);
      }
      
      setKanbanConfig(newConfig);
      
      // Recarregar colunas e leads
      setIsConfigModalOpen(false);
      fetchLeads();
      
      toast.success(updatedColumn.id ? 'Coluna atualizada com sucesso' : 'Nova coluna adicionada');
    } catch (error) {
      console.error('Erro ao salvar configuração da coluna:', error);
      toast.error('Não foi possível salvar a configuração da coluna');
    }
  };

  const handleColumnDelete = (columnId: string) => {
    try {
      // Verificar se há leads nesta coluna
      const leadsInColumn = leadsStore.query(lead => lead.status === columnId);
      
      if (leadsInColumn.length > 0) {
        // Se houver leads, mover para a primeira coluna
        const firstColumnId = [...kanbanConfig]
          .sort((a, b) => a.order - b.order)[0]?.id;
          
        if (!firstColumnId || firstColumnId === columnId) {
          toast.error('Não é possível remover esta coluna pois é a única disponível');
          return;
        }
        
        // Atualizar todos os leads desta coluna
        leadsInColumn.forEach(lead => {
          const updatedLead = { 
            ...lead, 
            status: firstColumnId as LeadStatus,
            updated_at: new Date().toISOString() 
          };
          leadsStore.update(lead.id, updatedLead);
        });
      }
      
      // Remover coluna da configuração
      const newConfig = kanbanConfig.filter(col => col.id !== columnId);
      
      // Reordenar as colunas restantes
      const reorderedConfig = newConfig.map((col, idx) => ({
        ...col,
        order: idx
      }));
      
      setKanbanConfig(reorderedConfig);
      kanbanConfigStore.remove(columnId);
      
      // Atualizar as colunas reordenadas no localStorage
      reorderedConfig.forEach(col => {
        kanbanConfigStore.update(col.id, col);
      });
      
      setIsConfigModalOpen(false);
      fetchLeads();
      
      toast.success('Coluna removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover coluna:', error);
      toast.error('Não foi possível remover a coluna');
    }
  };

  // Atualizar filtros
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({
      source: '',
      dateFrom: '',
      dateTo: '',
      service: '',
      searchText: ''
    });
  };

  // Função para filtrar leads com base nos filtros atuais
  const getFilteredItems = (items: Lead[]) => {
    return items.filter(lead => {
      // Filtro por fonte
      if (filters.source && lead.source !== filters.source) {
        return false;
      }
      
      // Filtro por data
      if (filters.dateFrom || filters.dateTo) {
        const leadDate = new Date(lead.created_at);
        
        if (filters.dateFrom && new Date(filters.dateFrom) > leadDate) {
          return false;
        }
        
        if (filters.dateTo) {
          const endDate = new Date(filters.dateTo);
          endDate.setHours(23, 59, 59, 999);
          if (endDate < leadDate) {
            return false;
          }
        }
      }
      
      // Filtro por serviço
      if (filters.service && lead.service_interest !== filters.service) {
        return false;
      }
      
      // Busca por texto
      if (filters.searchText) {
        const searchText = filters.searchText.toLowerCase();
        return (
          lead.name.toLowerCase().includes(searchText) ||
          lead.email.toLowerCase().includes(searchText) ||
          lead.phone.toLowerCase().includes(searchText) ||
          lead.vehicle_brand.toLowerCase().includes(searchText) ||
          lead.vehicle_model.toLowerCase().includes(searchText) ||
          lead.service_interest.toLowerCase().includes(searchText) ||
          (lead.notes && lead.notes.toLowerCase().includes(searchText))
        );
      }
      
      return true;
    });
  };

  const getUrgencyClass = (lead: Lead) => {
    const lastInteraction = new Date(lead.last_interaction_at || lead.created_at);
    const daysSinceInteraction = Math.floor((new Date().getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceInteraction >= 4) return 'border-l-4 border-l-red-500';
    if (daysSinceInteraction >= 2) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-green-500';
  };

  // Ordenar colunas por ordem
  const sortedColumns = Object.values(columns)
    .sort((a, b) => a.order - b.order);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando leads...</div>;
  }

  // Obter todas as fontes únicas de leads
  const leadSources = Array.from(new Set(
    Object.values(columns)
      .flatMap(column => column.items)
      .map(lead => lead.source || "unknown") // Ensure no empty strings
  ));

  // Obter todos os serviços únicos
  const leadServices = Array.from(new Set(
    Object.values(columns)
      .flatMap(column => column.items)
      .map(lead => lead.service_interest || "unknown") // Ensure no empty strings
  ));

  return (
    <div className="w-full flex flex-col h-[calc(100vh-200px)]">
      {/* Barra de filtros */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-muted/30 rounded-lg mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar leads..." 
            className="pl-9"
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as fontes</SelectItem>
              {leadSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source === "unknown" ? "Desconhecido" : source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.service} onValueChange={(value) => handleFilterChange('service', value)}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os serviços</SelectItem>
              {leadServices.map((service) => (
                <SelectItem key={service} value={service}>
                  {service === "unknown" ? "Desconhecido" : service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Input 
              type="date"
              placeholder="Data inicial"
              className="w-[140px] bg-white"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
            <span>até</span>
            <Input 
              type="date"
              placeholder="Data final"
              className="w-[140px] bg-white"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          
          {(filters.source || filters.dateFrom || filters.dateTo || filters.service || filters.searchText) && (
            <Button variant="outline" onClick={handleClearFilters} className="bg-white">
              Limpar filtros
            </Button>
          )}
        </div>
        
        <Button onClick={() => handleConfigClick()} className="ml-auto">
          <Settings size={16} className="mr-1" />
          Configurar Colunas
        </Button>
      </div>

      {/* Kanban Board */}
      <div 
        className="flex-1 overflow-x-auto pb-6 min-h-[300px]"
        ref={kanbanRef}
      >
        <DragDropContext 
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
        >
          <div className="flex gap-4 h-full min-h-[calc(100vh-280px)]">
            {sortedColumns.map(column => (
              <div 
                key={column.id} 
                className="min-w-[280px] w-[280px] flex flex-col"
              >
                <div 
                  className="flex justify-between items-center p-3 rounded-t-lg border-b-2 border-border"
                  style={{ backgroundColor: column.color ? `${column.color}30` : undefined }}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="rounded-full">
                      {getFilteredItems(column.items).length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleConfigClick(column)}
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      className="flex-1 p-2 rounded-b-lg overflow-y-auto"
                      style={{ backgroundColor: column.color ? `${column.color}10` : undefined }}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {getFilteredItems(column.items).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-24 text-center p-4 text-sm text-muted-foreground">
                          <p>Sem leads neste estágio</p>
                        </div>
                      ) : (
                        getFilteredItems(column.items).map((lead, index) => {
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
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
      
      {isDetailModalOpen && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onLeadUpdated={fetchLeads}
        />
      )}
      
      {isConfigModalOpen && (
        <ColumnSettingsModal 
          open={isConfigModalOpen}
          onOpenChange={setIsConfigModalOpen}
          column={selectedColumn}
          columns={kanbanConfig}
          onSave={handleColumnUpdate}
          onDelete={handleColumnDelete}
        />
      )}
    </div>
  );
};

export default LeadKanban;
