
import React, { useState } from 'react';
import { Plus, LayoutGrid, List as ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeadKanban from '@/components/leads/LeadKanban';
import LeadList from '@/components/leads/LeadList';
import CustomLeadKanban from '@/components/leads/CustomLeadKanban';
import { LeadFormModal } from '@/components/leads/LeadFormModal';
import { useLeads } from '@/hooks/useLeads';

type ViewType = 'kanban' | 'list';

const Leads = () => {
  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const { leads, updateLead } = useLeads();

  const handleUpdateLead = (leadId: string, updates: any) => {
    updateLead(leadId, updates);
  };

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
  };

  const handleNewLeadAdded = () => {
    setIsNewLeadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('list')}
            >
              <ListIcon className="h-4 w-4 mr-1" />
              Lista
            </Button>
          </div>
          
          <Button onClick={() => setIsNewLeadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentView === 'kanban' ? 'Pipeline de Leads' : 'Lista de Leads'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentView === 'kanban' ? (
            <CustomLeadKanban
              leads={leads}
              onUpdateLead={handleUpdateLead}
              onLeadClick={handleLeadClick}
            />
          ) : (
            <LeadList />
          )}
        </CardContent>
      </Card>

      <LeadFormModal
        open={isNewLeadModalOpen}
        onOpenChange={setIsNewLeadModalOpen}
        onLeadAdded={handleNewLeadAdded}
      />
    </div>
  );
};

export default Leads;
