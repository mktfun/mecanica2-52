
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { toast } from "sonner";

import LeadKanban from "@/components/leads/LeadKanban";
import LeadList from "@/components/leads/LeadList";
import LeadFormModal from "@/components/leads/LeadFormModal";
import { useEventSubscription } from "@/hooks/useEventSubscription";
import { EVENTS } from "@/core/events/EventBus";
import { useApp } from "@/contexts/AppContext";

const Leads = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { setIsLoading } = useApp();

  const handleAddLead = () => {
    setIsFormOpen(true);
  };

  const handleLeadAdded = () => {
    setIsFormOpen(false);
    toast.success("Lead adicionado com sucesso!");
  };

  // Subscribe to lead events for notifications
  useEventSubscription('leads:created', (lead) => {
    toast.success(`Novo lead criado: ${lead.name}`);
  });
  
  useEventSubscription('leads:updated', (lead) => {
    toast.info(`Lead atualizado: ${lead.name}`);
  });
  
  useEventSubscription('leads:deleted', (lead) => {
    toast.warning(`Lead removido: ${lead.name}`);
  });

  // Subscribe to storage changes to update loading state
  useEventSubscription(EVENTS.STORAGE_UPDATED, (data) => {
    if (data.entity === 'leads') {
      // Just to demonstrate loading effect - in real app this might depend on API calls
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Leads</h1>
        <Button onClick={handleAddLead} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Novo Lead</span>
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="mt-0">
          <LeadKanban />
        </TabsContent>
        <TabsContent value="list" className="mt-0">
          <LeadList />
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <LeadFormModal 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          onLeadAdded={handleLeadAdded}
        />
      )}
    </div>
  );
};

export default Leads;
