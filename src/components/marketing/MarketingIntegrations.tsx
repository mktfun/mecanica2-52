
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { GoogleAdsIntegration } from './integrations/GoogleAdsIntegration';
import { MetaAdsIntegration } from './integrations/MetaAdsIntegration';
import { UTMConfigForm } from './integrations/UTMConfigForm';

export const MarketingIntegrations = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GoogleAdsIntegration />
        <MetaAdsIntegration />
      </div>
      
      <UTMConfigForm />
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Sincronização</CardTitle>
          <CardDescription>
            Configure a frequência de sincronização e as campanhas que deseja monitorar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Frequência de Sincronização</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="w-full">1h</Button>
                <Button variant="outline" className="w-full">6h</Button>
                <Button variant="default" className="w-full">12h</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Período de Dados Históricos</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="w-full">7 dias</Button>
                <Button variant="default" className="w-full">30 dias</Button>
                <Button variant="outline" className="w-full">90 dias</Button>
              </div>
            </div>
          </div>
          
          <div>
            <Button 
              onClick={() => toast.success('Configurações salvas com sucesso!')}
              className="mt-4"
            >
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
