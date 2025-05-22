
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

export const GoogleAdsIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Simular processo de autenticação
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsConnected(true);
      toast.success('Conta do Google Ads conectada com sucesso!');
    } catch (error) {
      toast.error('Erro ao conectar com o Google Ads.');
      console.error('Erro ao conectar com o Google Ads:', error);
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
      toast.success('Conta do Google Ads desconectada com sucesso!');
    } catch (error) {
      toast.error('Erro ao desconectar a conta do Google Ads.');
      console.error('Erro ao desconectar a conta do Google Ads:', error);
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
              <path d="M6 12L9 3L18 12L9 21L6 12Z" fill="#FBBC05" />
              <path d="M16 16L24 12L16 8V16Z" fill="#4285F4" />
              <path d="M13.0762 10.156L3.45573 5.99958L0 12L3.45573 18.0004L13.0762 13.844L9.35287 12L13.0762 10.156Z" fill="#34A853" />
            </svg>
            Google Ads
          </CardTitle>
          <CardDescription>Conecte sua conta para visualizar e gerenciar campanhas</CardDescription>
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
                <span className="text-sm font-medium">MecânicaPro Marketing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm font-medium">marketing@mecanicapro.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">ID da conta:</span>
                <span className="text-sm font-medium">123-456-7890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Campanhas ativas:</span>
                <span className="text-sm font-medium">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Última sincronização:</span>
                <span className="text-sm font-medium">Hoje às 14:32</span>
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
              Conecte sua conta do Google Ads para importar campanhas, visualizar métricas de desempenho e correlacionar com os leads gerados.
            </p>
            <Button 
              onClick={handleConnect}
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Conectando...' : 'Conectar com Google Ads'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
