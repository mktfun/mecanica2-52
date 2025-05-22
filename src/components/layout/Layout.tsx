
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import authService from '../../services/authService';
import Sidebar from './Sidebar';
import Header from './Header';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Verifica se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar para Desktop */}
      <div className="hidden md:block">
        <Sidebar isMobile={false} setMobileMenuOpen={setMobileMenuOpen} />
      </div>
      
      {/* Sidebar móvel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 bottom-0 w-full max-w-xs">
            <div className="flex h-full flex-col bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400">MecânicaPro</h2>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                  <span className="sr-only">Fechar menu</span>
                </Button>
              </div>
              <Sidebar isMobile={true} setMobileMenuOpen={setMobileMenuOpen} />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header setMobileMenuOpen={setMobileMenuOpen} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
