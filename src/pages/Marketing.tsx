
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingDashboard } from "@/components/marketing/MarketingDashboard";
import { MarketingIntegrations } from "@/components/marketing/MarketingIntegrations";
import { MarketingCampaigns } from "@/components/marketing/MarketingCampaigns";
import { Button } from '@/components/ui/button';
import { BarChart, Settings, ListFilter } from 'lucide-react';
import { toast } from 'sonner';

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Esta função seria usada quando a integração real com as APIs estiver implementada
  const handleRefreshData = () => {
    toast.success('Dados de marketing atualizados com sucesso!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Digital</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie suas campanhas do Google Ads e Meta Ads
          </p>
        </div>
        <Button onClick={handleRefreshData} variant="outline" size="sm" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          <span>Atualizar Dados</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            <span>Campanhas</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Integrações</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0 space-y-4">
          <MarketingDashboard />
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-0 space-y-4">
          <MarketingCampaigns />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-0 space-y-4">
          <MarketingIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketing;
