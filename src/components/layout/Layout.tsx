
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import authService from '../../services/authService';
import Sidebar from './NewSidebar';
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
      {/* Sidebar */}
      <Sidebar isMobile={false} setMobileMenuOpen={setMobileMenuOpen}>
        {/* This empty fragment serves as the children prop */}
        <></>
      </Sidebar>
      
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
