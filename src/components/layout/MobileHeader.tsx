
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Settings, User } from 'lucide-react';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';

const MobileHeader = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
            M
          </div>
          <h1 className="text-lg font-bold text-blue-800 dark:text-blue-400">MecânicaPro</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/reports')}
            className="h-9 w-9"
          >
            <PieChart className="h-5 w-5" />
            <span className="sr-only">Relatórios</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-9 w-9"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Configurações</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-9 w-9"
          >
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-800 font-medium text-xs">
                {currentUser?.name.charAt(0) || 'U'}
              </span>
            </div>
            <span className="sr-only">Perfil</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
