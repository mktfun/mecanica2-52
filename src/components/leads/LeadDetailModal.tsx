import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@/types/lead";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Car, Phone, Mail, Calendar, Coins, FileText, User, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { LeadFormModal } from './LeadFormModal';
import { useLeads } from '@/hooks/useLeads';

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LEAD_STATUS_MAP: Record<string, { label: string, color: string }> = {
  'new': { label: 'Novo', color: 'text-blue-500 bg-blue-50' },
  'contacted': { label: 'Contactado', color: 'text-indigo-500 bg-indigo-50' },
  'negotiation': { label: 'Em Negociação', color: 'text-purple-500 bg-purple-50' },
  'scheduled': { label: 'Agendado', color: 'text-amber-500 bg-amber-50' },
  'converted': { label: 'Convertido', color: 'text-green-500 bg-green-50' },
  'lost': { label: 'Perdido', color: 'text-red-500 bg-red-50' }
};

const LeadDetailModal = ({ lead, open, onOpenChange }: LeadDetailModalProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateLead } = useLeads();

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    toast.success("Lead atualizado com sucesso!");
  };

  const getFormattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PP 'às' p", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = LEAD_STATUS_MAP[status] || { label: status, color: 'text-gray-500 bg-gray-50' };
    
    return (
      <Badge className={`${statusInfo.color} px-2 py-1 text-xs`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const handleMarkAsLost = async () => {
    if (confirm("Tem certeza que deseja marcar este lead como perdido?")) {
      try {
        await updateLead(lead.id, { status: 'lost' });
        toast.success("Lead marcado como perdido");
        onOpenChange(false);
      } catch (error) {
        console.error('Erro ao atualizar status do lead:', error);
        toast.error("Falha ao atualizar o lead");
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Informações Pessoais</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>Nome:</strong> {lead.name}
              </div>
              <div>
                <strong>Telefone:</strong> {lead.phone}
              </div>
              <div>
                <strong>Email:</strong> {lead.email || "Não informado"}
              </div>
              <div>
                <strong>Atribuído a:</strong> {lead.assigned_to || "Não atribuído"}
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Informações do Veículo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>Marca:</strong> {lead.vehicle?.make || "Não informado"}
              </div>
              <div>
                <strong>Modelo:</strong> {lead.vehicle?.model || "Não informado"}
              </div>
              <div>
                <strong>Ano:</strong> {lead.vehicle?.year || "Não informado"}
              </div>
              <div>
                <strong>Serviço de Interesse:</strong> {lead.service_interest || "Não informado"}
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Detalhes do Lead</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>Fonte:</strong> {lead.source || "Não especificada"}
              </div>
              <div>
                <strong>Valor Potencial:</strong> {formatCurrency(lead.potential_value || 0)}
              </div>
              <div>
                <strong>Status:</strong> {getStatusBadge(lead.status)}
              </div>
              <div>
                <strong>Criado em:</strong> {getFormattedDate(lead.created_at)}
              </div>
              <div>
                <strong>Última atualização:</strong> {getFormattedDate(lead.updated_at)}
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">Observações</span>
            </div>
            <div>
              {lead.notes || "Nenhuma observação."}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={handleEditClick}>
              Editar Lead
            </Button>
            <Button variant="destructive" onClick={handleMarkAsLost}>
              Marcar como Perdido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isEditModalOpen && (
        <LeadFormModal
          lead={lead}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onLeadUpdated={handleEditComplete}
          isEdit={true}
        />
      )}
    </>
  );
};

export default LeadDetailModal;
