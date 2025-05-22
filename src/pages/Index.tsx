
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Se o usuário já estiver autenticado, redireciona para o dashboard
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-3xl p-8 text-center">
        <h1 className="text-5xl font-bold text-blue-800 mb-6">MecânicaPro</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema completo de gerenciamento para oficinas mecânicas.
          Gerencie suas operações, clientes, agendamentos e muito mais!
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
          >
            Entrar no Sistema
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/register')}
          >
            Registrar
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Gestão Completa</h3>
            <p className="text-gray-600">
              Gerencie clientes, agendamentos, ordens de serviço e estoque em um único sistema.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Relatórios Detalhados</h3>
            <p className="text-gray-600">
              Visualize o desempenho do seu negócio com gráficos e métricas claras.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Interface Intuitiva</h3>
            <p className="text-gray-600">
              Sistema fácil de usar, projetado para a rotina de oficinas mecânicas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
