
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead } from '@/types/lead';

interface LeadKanbanCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}

const LeadKanbanCard = ({ lead, onDragStart, onClick }: LeadKanbanCardProps) => {
  // Formatar data relativa
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Determinar urgência baseada na última interação
  const getUrgencyClass = () => {
    const lastInteraction = new Date(lead.last_interaction_at || lead.created_at);
    const daysSinceInteraction = Math.floor(
      (new Date().getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceInteraction >= 4) return 'border-l-4 border-l-red-500';
    if (daysSinceInteraction >= 2) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-green-500';
  };

  // Formatar fonte
  const formatSource = (source: string) => {
    const sources: Record<string, string> = {
      'google_ads': 'Google Ads',
      'meta_ads': 'Meta Ads',
      'referral': 'Indicação',
      'organic': 'Orgânico',
      'direct': 'Direto',
      'website': 'Website'
    };
    
    return sources[source] || source;
  };

  const timeInStatus = getRelativeTime(lead.status_changed_at || lead.created_at);

  return (
    <Card
      className={`mb-3 p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        getUrgencyClass()
      }`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm truncate max-w-[70%]">{lead.name}</h4>
        <Badge variant="outline" className="text-xs">{formatSource(lead.source)}</Badge>
      </div>
      
      <div className="text-xs space-y-1 mb-2">
        <div>{lead.phone}</div>
        <div className="truncate">{lead.service_interest}</div>
        <div className="text-muted-foreground">
          {lead.vehicle_brand} {lead.vehicle_model} ({lead.vehicle_year})
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <div>Resp: {lead.assigned_to || 'Não atribuído'}</div>
        <div>Na coluna: {timeInStatus}</div>
      </div>
    </Card>
  );
};

export default LeadKanbanCard;
