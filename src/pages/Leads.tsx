
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useEventSubscription } from '@/hooks/useEventSubscription';

import CustomLeadKanban from "@/components/leads/CustomLeadKanban";
import LeadList from "@/components/leads/LeadList";
import LeadFormModal from "@/components/leads/LeadFormModal";

const Leads = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddLead = () => {
    setIsFormOpen(true);
  };

  const handleLeadAdded = () => {
    setIsFormOpen(false);
    toast.success("Lead adicionado com sucesso!");
  };

  // Subscrever a eventos específicos de leads
  useEventSubscription('mecanicapro_leads:created', (lead) => {
    console.log('Novo lead criado:', lead);
    // Você pode fazer algo aqui, como mostrar uma notificação específica
  });

  useEventSubscription('mecanicapro_leads:updated', (lead) => {
    console.log('Lead atualizado:', lead);
    // Você pode fazer algo aqui, como atualizar estatísticas
  });

  useEventSubscription('lead:interaction', (data) => {
    console.log('Interação com lead:', data);
    // Você pode fazer algo aqui, como registrar em analytics
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

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="mt-0">
          <CustomLeadKanban />
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
