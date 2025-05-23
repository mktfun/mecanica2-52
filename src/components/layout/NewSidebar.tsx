import React, { useState, createContext, useContext } from "react";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import authService from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  Clipboard, 
  Settings, 
  LogOut,
  TrendingUp,
  PieChart,
  Bell,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(true);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  isMobile,
  setMobileMenuOpen,
}: {
  children: React.ReactNode;
  isMobile: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}) => {
  return (
    <SidebarProvider>
      <SidebarBody isMobile={isMobile} setMobileMenuOpen={setMobileMenuOpen}>
        {children}
      </SidebarBody>
    </SidebarProvider>
  );
};

export const SidebarBody = ({ 
  children, 
  isMobile, 
  setMobileMenuOpen 
}: { 
  children?: React.ReactNode;
  isMobile: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();
  const { open, setOpen } = useSidebar();
  
  const handleLogout = () => {
    authService.logout();
    toast.add({
      description: "Logout realizado com sucesso"
    });
    navigate('/login');
  };
  
  // Atualização dos ícones para Feather Icons (equivalentes em lucide-react)
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/leads', name: 'Leads', icon: <Users className="h-5 w-5" /> },
    { 
      path: '/appointments', 
      name: 'Agendamentos', 
      icon: <Calendar className="h-5 w-5" />,
      notification: 3,
    },
    { path: '/orders', name: 'Ordens de Serviço', icon: <Clipboard className="h-5 w-5" /> },
    { path: '/marketing', name: 'Marketing Digital', icon: <TrendingUp className="h-5 w-5" /> },
    { path: '/reports', name: 'Relatórios', icon: <PieChart className="h-5 w-5" /> },
    { path: '/settings', name: 'Configurações', icon: <Settings className="h-5 w-5" /> },
  ];
  
  const handleNavClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };
  
  return (
    <>
      <DesktopSidebar 
        navItems={navItems} 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        handleNavClick={handleNavClick} 
        currentPath={location.pathname}
      />
      <MobileSidebar 
        navItems={navItems} 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        handleNavClick={handleNavClick}
        setMobileMenuOpen={setMobileMenuOpen}
        currentPath={location.pathname}
      />
    </>
  );
};

export const DesktopSidebar = ({
  navItems,
  currentUser,
  handleLogout,
  handleNavClick,
  currentPath
}: {
  navItems: Array<{path: string; name: string; icon: React.ReactNode; notification?: number}>;
  currentUser: any;
  handleLogout: () => void;
  handleNavClick: () => void;
  currentPath: string;
}) => {
  const { open, setOpen, animate } = useSidebar();
  
  return (
    <motion.div
      className="h-screen hidden lg:flex lg:flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0"
      animate={{
        width: animate ? (open ? "280px" : "80px") : "280px",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="p-4 flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
        <motion.div 
          className="flex items-center gap-3"
          animate={{
            justifyContent: animate ? (open ? "flex-start" : "center") : "flex-start"
          }}
        >
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <motion.h1 
            className="text-xl font-bold text-blue-800 dark:text-blue-400 whitespace-nowrap"
            animate={{
              opacity: animate ? (open ? 1 : 0) : 1,
              display: animate ? (open ? "block" : "none") : "block",
            }}
          >
            MecânicaPro
          </motion.h1>
        </motion.div>
      </div>
      
      <ScrollArea className="flex-1 overflow-hidden py-2">
        <nav className="px-2 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <li key={item.path}>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => 
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden",
                        isActive 
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                          : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      )
                    }
                    onClick={handleNavClick}
                  >
                    <div className={`${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}>
                      {item.icon}
                    </div>
                    <motion.span 
                      className="flex-1 whitespace-nowrap"
                      animate={{
                        display: animate ? (open ? "inline-block" : "none") : "inline-block",
                        opacity: animate ? (open ? 1 : 0) : 1,
                      }}
                    >
                      {item.name}
                    </motion.span>
                    {item.notification && (
                      <motion.span 
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                        animate={{
                          display: animate ? (open ? "inline-flex" : "none") : "inline-flex",
                          opacity: animate ? (open ? 1 : 0) : 1,
                        }}
                      >
                        {item.notification}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div 
                        className="absolute inset-y-0 left-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full" 
                        layoutId="activeDesktopNav"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-medium">
              {currentUser?.name.charAt(0) || 'U'}
            </span>
          </div>
          <motion.div
            animate={{
              display: animate ? (open ? "block" : "none") : "block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentUser?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{currentUser?.role || 'Funcionário'}</p>
          </motion.div>
        </div>
        
        <button 
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
          >
            Sair
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  navItems,
  currentUser,
  handleLogout,
  handleNavClick,
  setMobileMenuOpen,
  currentPath
}: {
  navItems: Array<{path: string; name: string; icon: React.ReactNode; notification?: number}>;
  currentUser: any;
  handleLogout: () => void;
  handleNavClick: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  currentPath: string;
}) => {
  // Este componente não é mais usado, mas mantendo para compatibilidade
  return null;
};

export default Sidebar;
