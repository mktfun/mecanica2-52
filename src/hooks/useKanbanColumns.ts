
import { useState, useEffect } from 'react';
import { eventBus, EVENTS } from '../core/events/EventBus';

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  order: number;
}

const STORAGE_KEY = 'mecanicapro_kanban_columns';

export function useKanbanColumns() {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configuração do Kanban
  useEffect(() => {
    loadColumns();

    // Inscrever para atualizações de colunas
    const unsubscribe = eventBus.subscribe(EVENTS.KANBAN_COLUMNS_UPDATED, () => {
      loadColumns();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadColumns = () => {
    setIsLoading(true);
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);

      if (savedConfig) {
        setColumns(JSON.parse(savedConfig));
      } else {
        // Configuração padrão se não existir
        const defaultColumns: KanbanColumn[] = [
          { id: 'new', title: 'Novos Leads', color: '#e6f7ff', order: 0 },
          { id: 'contacted', title: 'Primeiro Contato', color: '#fff7e6', order: 1 },
          { id: 'negotiation', title: 'Em Negociação', color: '#e6fffb', order: 2 },
          { id: 'scheduled', title: 'Agendados', color: '#f6ffed', order: 3 },
          { id: 'converted', title: 'Convertidos', color: '#f9f0ff', order: 4 },
          { id: 'lost', title: 'Perdidos', color: '#fff1f0', order: 5 }
        ];

        setColumns(defaultColumns);
        saveColumns(defaultColumns);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração do Kanban:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveColumns = (columnsToSave: KanbanColumn[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnsToSave));
      eventBus.publish(EVENTS.KANBAN_COLUMNS_UPDATED, columnsToSave);
    } catch (error) {
      console.error('Erro ao salvar configuração do Kanban:', error);
    }
  };

  const addColumn = (newColumn: Omit<KanbanColumn, 'id' | 'order'>) => {
    const columnToAdd = {
      ...newColumn,
      id: `column-${Date.now()}`,
      order: columns.length
    };

    const updatedColumns = [...columns, columnToAdd];
    setColumns(updatedColumns);
    saveColumns(updatedColumns);
    return columnToAdd;
  };

  const updateColumn = (columnId: string, updates: Partial<KanbanColumn>) => {
    const updatedColumns = columns.map(col =>
      col.id === columnId ? { ...col, ...updates } : col
    );

    setColumns(updatedColumns);
    saveColumns(updatedColumns);
    return updatedColumns.find(col => col.id === columnId);
  };

  const removeColumn = (columnId: string, fallbackColumnId?: string) => {
    const columnToRemove = columns.find(col => col.id === columnId);
    if (!columnToRemove) return false;

    const updatedColumns = columns.filter(col => col.id !== columnId);
    
    // Reordenar as colunas restantes
    const reorderedColumns = updatedColumns.map((col, index) => ({
      ...col,
      order: index
    }));

    setColumns(reorderedColumns);
    saveColumns(reorderedColumns);

    // Notificar sobre a remoção da coluna e o fallback para mover os leads
    eventBus.publish(EVENTS.KANBAN_COLUMN_REMOVED, { 
      removedColumn: columnToRemove,
      fallbackColumnId: fallbackColumnId || (reorderedColumns.length > 0 ? reorderedColumns[0].id : null)
    });

    return true;
  };

  const reorderColumns = (sourceColumnId: string, targetColumnId: string) => {
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    const targetColumn = columns.find(col => col.id === targetColumnId);

    if (!sourceColumn || !targetColumn) return false;

    const updatedColumns = columns.map(col => {
      if (col.id === sourceColumnId) {
        return { ...col, order: targetColumn.order };
      }
      if (col.id === targetColumnId) {
        return { ...col, order: sourceColumn.order };
      }
      return col;
    });

    setColumns(updatedColumns);
    saveColumns(updatedColumns);
    return true;
  };

  const getSortedColumns = () => {
    return [...columns].sort((a, b) => a.order - b.order);
  };

  return {
    columns: getSortedColumns(),
    isLoading,
    addColumn,
    updateColumn,
    removeColumn,
    reorderColumns
  };
}
