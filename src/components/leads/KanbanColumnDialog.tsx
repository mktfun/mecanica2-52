
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KanbanColumn } from '@/hooks/useKanbanColumns';

interface KanbanColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (column: { title: string; color: string }) => void;
  column?: KanbanColumn;
}

const KanbanColumnDialog = ({
  open,
  onOpenChange,
  onSave,
  column
}: KanbanColumnDialogProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(column?.title || '');
  const [color, setColor] = useState(column?.color || '#e6f7ff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe um título para a coluna.",
        variant: "destructive"
      });
      return;
    }
    
    onSave({ title, color });
    resetForm();
  };

  const resetForm = () => {
    if (!column) {
      setTitle('');
      setColor('#e6f7ff');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {column ? 'Editar Coluna' : 'Nova Coluna'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Digite o título da coluna..."
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <div 
                  className="flex-1 h-10 rounded-md border"
                  style={{ backgroundColor: color }}
                ></div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {column ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KanbanColumnDialog;
