
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KanbanColumn } from '@/types/lead';
import { AlertTriangle } from 'lucide-react';

interface ColumnSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: KanbanColumn | null;
  columns: KanbanColumn[];
  onSave: (column: KanbanColumn) => void;
  onDelete: (columnId: string) => void;
}

const ColumnSettingsModal = ({
  open,
  onOpenChange,
  column,
  columns,
  onSave,
  onDelete
}: ColumnSettingsModalProps) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#e6f7ff');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Carregar dados da coluna existente quando o modal é aberto
  useEffect(() => {
    if (column) {
      setTitle(column.title);
      setColor(column.color);
    } else {
      // Valores padrão para nova coluna
      setTitle('');
      setColor('#e6f7ff');
    }
    setError('');
    setShowDeleteConfirm(false);
  }, [column, open]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('O título da coluna é obrigatório');
      return;
    }
    
    // Se for edição, manter ID e ordem, caso contrário, cria nova coluna
    const updatedColumn: KanbanColumn = column 
      ? { ...column, title, color }
      : { id: '', title, color, order: columns.length };
    
    onSave(updatedColumn);
  };

  const handleDelete = () => {
    if (!column || !column.id) return;
    
    if (columns.length <= 1) {
      setError('Não é possível excluir todas as colunas. Deve haver pelo menos uma coluna no quadro.');
      return;
    }
    
    onDelete(column.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {column ? 'Editar Coluna' : 'Adicionar Nova Coluna'}
          </DialogTitle>
          <DialogDescription>
            {column 
              ? 'Modifique os detalhes da coluna existente'
              : 'Configure uma nova coluna para o quadro Kanban'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da coluna"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color">Cor da coluna</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#RRGGBB"
                className="uppercase"
                maxLength={7}
              />
              <div
                className="flex-1 h-8 rounded"
                style={{ backgroundColor: color }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/20 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center gap-2">
          <div className="flex-1">
            {column && !showDeleteConfirm && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto"
              >
                Excluir Coluna
              </Button>
            )}
            {showDeleteConfirm && (
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="flex-1"
                >
                  Confirmar Exclusão
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {column ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnSettingsModal;
