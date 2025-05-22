
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export const UTMConfigForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Configurações de UTM salvas com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de UTM Parameters</CardTitle>
        <CardDescription>
          Configure os parâmetros UTM para rastreamento de campanhas e correlação com leads.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="utm-source-google">UTM Source (Google Ads)</Label>
              <Input 
                id="utm-source-google" 
                defaultValue="google" 
                placeholder="google_ads" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utm-medium-google">UTM Medium (Google Ads)</Label>
              <Input 
                id="utm-medium-google" 
                defaultValue="cpc" 
                placeholder="cpc" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="utm-source-meta">UTM Source (Meta Ads)</Label>
              <Input 
                id="utm-source-meta" 
                defaultValue="facebook" 
                placeholder="facebook" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utm-medium-meta">UTM Medium (Meta Ads)</Label>
              <Input 
                id="utm-medium-meta" 
                defaultValue="social" 
                placeholder="social" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="utm-campaign-template">Template de UTM Campaign</Label>
            <Input 
              id="utm-campaign-template" 
              defaultValue="{campaign_name}_{ad_group}_{{creative}}" 
              placeholder="nome_da_campanha" 
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{campaign_name}'}, {'{ad_group}'} e {'{creative}'} como variáveis para substituição automática.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-source-field">Campo para Fonte do Lead</Label>
            <Input 
              id="lead-source-field" 
              defaultValue="source" 
              placeholder="source" 
            />
            <p className="text-xs text-gray-500 mt-1">
              Nome do campo que armazenará a fonte do lead no banco de dados.
            </p>
          </div>

          <Button type="submit">Salvar Configurações de UTM</Button>
        </form>
      </CardContent>
    </Card>
  );
};
