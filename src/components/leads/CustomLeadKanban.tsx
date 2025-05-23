import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, MoreHorizontal, AlertCircle } from "lucide-react";
import { Lead, LeadStatus } from '@/types/lead';
import { useLeads } from '@/hooks/useLeads';
import { useKanbanColumns, KanbanColumn } from '@/hooks/useKanbanColumns';
import KanbanColumnDialog from './KanbanColumnDialog';
import LeadKanbanCard from './LeadKanbanCard';
import LeadDetailModal from './LeadDetailModal';
import LeadFilters, { LeadFilters as LeadFiltersType } from './LeadFilters';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const CustomLeadKanban = () => {
  // Dados do Kanban
  const { columns, isLoading: isColumnsLoading, addColumn, updateColumn, removeColumn, reorderColumns } = useKanbanColumns();
  const { leads, isLoading: isLeadsLoading, updateLeadStatus } = useLeads();

  // Estado do modal
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | undefined>(undefined);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Estado para filtros
  const [filters, setFilters] = useState<LeadFiltersType>({
    source: '',
    dateFrom: '',
    dateTo: '',
    service: '',
    searchText: ''
  });

  // Referência para o container do Kanban (para scroll automático)
  const kanbanContainerRef = useRef<HTMLDivElement>(null);
  const [autoScrollDirection, setAutoScrollDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Auto-scrolling quando arrastando
  useEffect(() => {
    if (!isDragging || !autoScrollDirection) return;
    
    const container = kanbanContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 5;
    const scrollInterval = setInterval(() => {
      if (autoScrollDirection === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }, 10);
    
    return () => clearInterval(scrollInterval);
  }, [isDragging, autoScrollDirection]);

  // Gerenciar auto-scroll durante o arrastar
  const handleDragScroll = (clientX: number) => {
    const container = kanbanContainerRef.current;
    if (!container || !isDragging) return;
    
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 50; // pixels da borda para começar a rolar
    
    if (clientX < rect.left + scrollThreshold) {
      setAutoScrollDirection('left');
    } else if (clientX > rect.right - scrollThreshold) {
      setAutoScrollDirection('right');
    } else {
      setAutoScrollDirection(null);
    }
  };

  // Filtrar leads
  const getFilteredLeads = () => {
    return leads.filter(lead => {
      // Filtro por fonte
      if (filters.source && lead.source !== filters.source) {
        return false;
      }
      
      // Filtro por data
      if (filters.dateFrom || filters.dateTo) {
        const leadDate = new Date(lead.created_at);
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (leadDate < fromDate) {
            return false;
          }
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // Fim do dia
          if (leadDate > toDate) {
            return false;
          }
        }
      }
      
      // Filtro por serviço
      if (filters.service && lead.service_interest !== filters.service) {
        return false;
      }
      
      // Filtro por texto
      if (filters.searchText) {
        const searchText = filters.searchText.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(searchText) ||
          lead.email?.toLowerCase().includes(searchText) ||
          lead.phone?.toLowerCase().includes(searchText) ||
          lead.vehicle_brand?.toLowerCase().includes(searchText) ||
          lead.vehicle_model?.toLowerCase().includes(searchText) ||
          lead.service_interest?.toLowerCase().includes(searchText) ||
          lead.notes?.toLowerCase().includes(searchText)
        );
      }
      
      return true;
    });
  };

  // Obter leads para uma coluna específica
  const getLeadsForColumn = (columnId: string) => {
    return getFilteredLeads().filter(lead => lead.status === columnId);
  };

  // Lidar com o arrasto e soltura de leads
  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    setAutoScrollDirection(null);
    
    const { source, destination, type, draggableId } = result;
    
    // Verificar se o item foi solto em uma área válida
    if (!destination) return;
    
    // Verificar se o item foi movido para uma posição diferente
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    // Se é uma coluna sendo reordenada
    if (type === 'column') {
      reorderColumns(draggableId, destination.droppableId);
      return;
    }
    
    // Se é um lead sendo movido entre colunas
    if (source.droppableId !== destination.droppableId) {
      // Obter o lead que está sendo movido
      const lead = leads.find(item => item.id === draggableId);
      if (!lead) return;
      
      // Atualizar o status do lead
      try {
        updateLeadStatus(lead.id, destination.droppableId);
        
        // Mostrar notificação
        const targetColumn = columns.find(col => col.id === destination.droppableId);
        if (targetColumn) {
          toast.success(`Lead movido para ${targetColumn.title}`);
        }
      } catch (error) {
        console.error('Erro ao atualizar status do lead:', error);
        toast.error('Não foi possível atualizar o status do lead.');
      }
    }
  };

  // Verificar se há leads em uma coluna antes de removê-la
  const handleRemoveColumn = async (column: KanbanColumn) => {
    const leadsInColumn = leads.filter(lead => lead.status === column.id);
    
    if (leadsInColumn.length > 0) {
      const fallbackColumn = columns.find(col => col.id !== column.id);
      
      if (!fallbackColumn) {
        toast.error('Não é possível remover a única coluna com leads.');
        return;
      }
      
      // Mover todos os leads para a coluna de fallback
      try {
        for (const lead of leadsInColumn) {
          enhancedLeadsStore.update(lead.id, {
            ...lead,
            status: fallbackColumn.id as LeadStatus,
            status_changed_at: new Date().toISOString()
          });
        }
        
        toast.success(`${leadsInColumn.length} leads movidos para ${fallbackColumn.title}`);
        removeColumn(column.id, fallbackColumn.id);
      } catch (error) {
        console.error('Erro ao mover leads:', error);
        toast.error('Não foi possível mover os leads para outra coluna.');
      }
    } else {
      removeColumn(column.id);
    }
  };

  // Gerenciar a edição de coluna
  const handleEditColumn = (column: KanbanColumn) => {
    setEditingColumn(column);
    setIsColumnDialogOpen(true);
  };

  // Salvar alterações da coluna
  const handleSaveColumn = (columnData: { title: string; color: string }) => {
    if (editingColumn) {
      updateColumn(editingColumn.id, columnData);
      toast.success('Coluna atualizada com sucesso!');
    } else {
      addColumn(columnData);
      toast.success('Coluna adicionada com sucesso!');
    }
    
    setIsColumnDialogOpen(false);
    setEditingColumn(undefined);
  };

  // Lidar com o clique em um lead
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  // Manipulador para o início do arrasto
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Manipulador de movimento do mouse durante o arrasto
  const handleDragUpdate = (e: any) => {
    if (e.type === 'dragupdate' && e.movementX !== 0) {
      const clientX = e.clientX || 
        (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      
      if (clientX) {
        handleDragScroll(clientX);
      }
    }
  };

  const isLoading = isColumnsLoading || isLeadsLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Kanban de Leads</h2>
        
        <Button 
          onClick={() => {
            setEditingColumn(undefined);
            setIsColumnDialogOpen(true);
          }}
          className="transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Coluna
        </Button>
      </div>

      <LeadFilters 
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={() => setFilters({
          source: '',
          dateFrom: '',
          dateTo: '',
          service: '',
          searchText: ''
        })}
      />
      
      <div 
        ref={kanbanContainerRef}
        className="overflow-x-auto pb-6"
        style={{ height: 'calc(100vh - 250px)' }}
      >
        <DragDropContext 
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max">
            <AnimatePresence>
              {columns.map((column, index) => (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-[280px] w-[280px] flex flex-col"
                >
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        className="flex flex-col h-full"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        <Card className="mb-2">
                          <div 
                            className="p-3 flex justify-between items-center border-b-2"
                            style={{ borderColor: column.color }}
                          >
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm">{column.title}</h3>
                              <Badge variant="secondary" className="rounded-full">
                                {getLeadsForColumn(column.id).length}
                              </Badge>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditColumn(column)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  <span>Editar coluna</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleRemoveColumn(column)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Remover coluna</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                        
                        <ScrollArea className="flex-1 p-2 bg-muted/40 rounded-lg">
                          <div className="min-h-full">
                            <AnimatePresence>
                              {getLeadsForColumn(column.id).map((lead, index) => (
                                <Draggable
                                  key={lead.id}
                                  draggableId={lead.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => {
                                    // Create a wrapper to handle the drag start properly
                                    const handleItemDragStart = () => {
                                      // This function is intentionally empty because
                                      // react-beautiful-dnd handles the drag functionality
                                      // The onDragStart prop here is actually not being used
                                    };

                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`${snapshot.isDragging ? 'rotate-2 scale-105 z-10' : ''}`}
                                      >
                                        <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.9 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <LeadKanbanCard 
                                            lead={lead}
                                            onDragStart={handleItemDragStart}
                                            onClick={() => handleLeadClick(lead)}
                                          />
                                        </motion.div>
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              ))}
                            </AnimatePresence>
                            {provided.placeholder}
                            
                            {getLeadsForColumn(column.id).length === 0 && (
                              <motion.div 
                                className="text-center p-4 text-sm text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.2 }}
                              >
                                <AlertCircle className="mx-auto h-5 w-5 mb-1 opacity-50" />
                                <p>Sem leads neste estágio</p>
                              </motion.div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {columns.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg min-w-[300px]"
              >
                <p className="text-muted-foreground mb-4">Nenhuma coluna configurada.</p>
                <Button onClick={() => setIsColumnDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
                </Button>
              </motion.div>
            )}
          </div>
        </DragDropContext>
      </div>
      
      {/* Modais */}
      <KanbanColumnDialog
        open={isColumnDialogOpen}
        onOpenChange={setIsColumnDialogOpen}
        onSave={handleSaveColumn}
        column={editingColumn}
      />
      
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
        />
      )}
    </motion.div>
  );
};

export default CustomLeadKanban;
