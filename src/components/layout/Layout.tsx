
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import authService from '../../services/authService';
import Sidebar from './NewSidebar';
import Header from './Header';
import { ScrollArea } from "@/components/ui/scroll-area";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Verifica se o usuário está autenticado
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isMobile={false} setMobileMenuOpen={setMobileMenuOpen}>
        {/* This empty fragment serves as the children prop */}
        <></>
      </Sidebar>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header setMobileMenuOpen={setMobileMenuOpen} />
        
        <ScrollArea className="flex-1 h-[calc(100vh-64px)]">
          <main className="p-6">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Layout;
