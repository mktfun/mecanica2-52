
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import authService from '@/services/authService';

interface HeaderProps {
  setMobileMenuOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setMobileMenuOpen }) => {
  const currentUser = authService.getCurrentUser();
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="w-72 pl-8 rounded-md border border-gray-200 dark:border-gray-800"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notificações</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser?.role === 'admin' ? 'Administrador' :
                 currentUser?.role === 'manager' ? 'Gerente' :
                 currentUser?.role === 'attendant' ? 'Atendente' :
                 currentUser?.role === 'mechanic' ? 'Mecânico' :
                 currentUser?.role === 'marketing' ? 'Marketing' : 'Funcionário'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-800 font-medium">
                {currentUser?.name.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
