
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-6xl font-bold text-blue-800">404</h1>
        <h2 className="text-2xl font-semibold mt-4">Página não encontrada</h2>
        <p className="text-gray-600 mt-2">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button 
          className="mt-6"
          onClick={() => navigate('/dashboard')}
        >
          Voltar para o Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
