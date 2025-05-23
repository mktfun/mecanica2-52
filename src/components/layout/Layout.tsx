
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import authService from '../../services/authService';
import Sidebar from './NewSidebar';
import Header from './Header';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { ScrollArea } from "@/components/ui/scroll-area";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Verifica se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar - apenas desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          isMobile={false} 
          setMobileMenuOpen={setMobileMenuOpen}
        >
          <></>
        </Sidebar>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header Desktop - apenas desktop */}
        <div className="hidden lg:block">
          <Header setMobileMenuOpen={setMobileMenuOpen} />
        </div>
        
        {/* Header Mobile - apenas mobile */}
        <div className="lg:hidden">
          <MobileHeader />
        </div>
        
        {/* Conteúdo principal */}
        <ScrollArea className="flex-1">
          <main className="p-4 lg:p-6 pb-20 lg:pb-6 min-h-full">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
      
      {/* Navegação inferior mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
