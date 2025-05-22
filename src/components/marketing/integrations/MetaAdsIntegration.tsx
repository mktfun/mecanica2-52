
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

export const MetaAdsIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Simular processo de autenticação
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsConnected(true);
      toast.success('Conta do Meta Ads conectada com sucesso!');
    } catch (error) {
      toast.error('Erro ao conectar com o Meta Ads.');
      console.error('Erro ao conectar com o Meta Ads:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      // Simular processo de desconexão
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsConnected(false);
      toast.success('Conta do Meta Ads desconectada com sucesso!');
    } catch (error) {
      toast.error('Erro ao desconectar a conta do Meta Ads.');
      console.error('Erro ao desconectar a conta do Meta Ads:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2"/>
            </svg>
            Meta Ads
          </CardTitle>
          <CardDescription>Conecte sua conta do Facebook Ads Manager</CardDescription>
        </div>
        {isConnected && (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Conectado
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Conta:</span>
                <span className="text-sm font-medium">MecânicaPro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm font-medium">marketing@mecanicapro.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">ID da conta:</span>
                <span className="text-sm font-medium">act_987654321</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Campanhas ativas:</span>
                <span className="text-sm font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Última sincronização:</span>
                <span className="text-sm font-medium">Hoje às 14:30</span>
              </div>
            </div>
            <Button 
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Desconectando...' : 'Desconectar Conta'}
            </Button>
          </>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Conecte sua conta do Meta Ads (Facebook e Instagram) para importar campanhas, visualizar métricas de desempenho e correlacionar com os leads gerados.
            </p>
            <Button 
              onClick={handleConnect}
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Conectando...' : 'Conectar com Meta Ads'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
