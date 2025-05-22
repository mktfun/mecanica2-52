import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead } from '@/types/lead';
import { motion } from 'framer-motion';
import { Phone, Mail, Wrench, Car } from 'lucide-react';

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
  const getUrgencyData = () => {
    const lastInteraction = new Date(lead.last_interaction_at || lead.created_at);
    const daysSinceInteraction = Math.floor(
      (new Date().getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceInteraction >= 4) {
      return {
        borderClass: 'border-l-4 border-l-red-500',
        indicatorClass: 'bg-red-500',
        urgencyText: 'Urgente'
      };
    }
    if (daysSinceInteraction >= 2) {
      return {
        borderClass: 'border-l-4 border-l-yellow-500',
        indicatorClass: 'bg-yellow-500',
        urgencyText: 'Moderado'
      };
    }
    return {
      borderClass: 'border-l-4 border-l-green-500',
      indicatorClass: 'bg-green-500',
      urgencyText: 'Recente'
    };
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

  const urgencyData = getUrgencyData();
  const timeInStatus = getRelativeTime(lead.status_changed_at || lead.created_at);

  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 15
      }}
    >
      <Card
        className={`mb-3 p-3 transition-all cursor-grab active:cursor-grabbing ${
          urgencyData.borderClass
        }`}
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm truncate max-w-[70%]">{lead.name}</h4>
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 transition-colors`} 
            style={{ 
              backgroundColor: `${lead.source === 'google_ads' ? 'rgba(59, 130, 246, 0.1)' : 
                               lead.source === 'meta_ads' ? 'rgba(14, 165, 233, 0.1)' : 
                               lead.source === 'referral' ? 'rgba(16, 185, 129, 0.1)' : 
                               'rgba(245, 158, 11, 0.1)'}`
            }}
          >
            {formatSource(lead.source)}
          </Badge>
        </div>
        
        <div className="text-xs space-y-1.5 mb-2">
          <div className="flex items-center text-muted-foreground">
            <Phone className="h-3 w-3 mr-1 shrink-0" /> 
            <span>{lead.phone || "Não informado"}</span>
          </div>
          
          {lead.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-3 w-3 mr-1 shrink-0" /> 
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground">
            <Wrench className="h-3 w-3 mr-1 shrink-0" /> 
            <span className="truncate">{lead.service_interest || "Serviço não especificado"}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Car className="h-3 w-3 mr-1 shrink-0" /> 
            <span className="truncate">
              {lead.vehicle_brand} {lead.vehicle_model} {lead.vehicle_year ? `(${lead.vehicle_year})` : ''}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-1 ${urgencyData.indicatorClass}`}></div>
            <span>{lead.assigned_to || 'Não atribuído'}</span>
          </div>
          <div>{timeInStatus}</div>
        </div>
      </Card>
    </motion.div>
  );
};

export default LeadKanbanCard;
