
import React, { useState, createContext, useContext } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import authService from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  HomeIcon, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  BarChart,
  Bell,
  Menu,
  X
} from 'lucide-react';

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
  
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    { path: '/leads', name: 'Leads', icon: <Users className="h-5 w-5" /> },
    { 
      path: '/appointments', 
      name: 'Agendamentos', 
      icon: <Calendar className="h-5 w-5" />,
      notification: 3,
    },
    { path: '/orders', name: 'Ordens de Serviço', icon: <FileText className="h-5 w-5" /> },
    { path: '/marketing', name: 'Marketing Digital', icon: <BarChart className="h-5 w-5" /> },
    { path: '/reports', name: 'Relatórios', icon: <BarChart className="h-5 w-5" /> },
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
      />
      <MobileSidebar 
        navItems={navItems} 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        handleNavClick={handleNavClick}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </>
  );
};

export const DesktopSidebar = ({
  navItems,
  currentUser,
  handleLogout,
  handleNavClick
}: {
  navItems: Array<{path: string; name: string; icon: React.ReactNode; notification?: number}>;
  currentUser: any;
  handleLogout: () => void;
  handleNavClick: () => void;
}) => {
  const { open, setOpen, animate } = useSidebar();
  
  return (
    <motion.div
      className="h-screen hidden md:flex md:flex-col bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex-shrink-0"
      animate={{
        width: animate ? (open ? "16rem" : "4rem") : "16rem",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="p-4 flex justify-center">
        <motion.h1 
          className="text-2xl font-bold text-blue-800 dark:text-blue-400 whitespace-nowrap"
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
        >
          MecânicaPro
        </motion.h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400",
                    isActive ? "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400" : ""
                  )
                }
                onClick={handleNavClick}
              >
                {item.icon}
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
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
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
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
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
  setMobileMenuOpen
}: {
  navItems: Array<{path: string; name: string; icon: React.ReactNode; notification?: number}>;
  currentUser: any;
  handleLogout: () => void;
  handleNavClick: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}) => {
  const { open, setOpen } = useSidebar();
  
  return (
    <>
      <div className="h-16 px-4 flex items-center justify-between md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 w-full">
        <h1 className="text-xl font-bold text-blue-800 dark:text-blue-400">MecânicaPro</h1>
        <div>
          <Menu
            className="text-gray-500 dark:text-gray-400 cursor-pointer h-6 w-6"
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="fixed h-full w-full inset-0 bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-xl font-bold text-blue-800 dark:text-blue-400">MecânicaPro</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 dark:text-gray-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink 
                      to={item.path} 
                      className={({ isActive }) => 
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400",
                          isActive ? "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400" : ""
                        )
                      }
                      onClick={handleNavClick}
                    >
                      {item.icon}
                      <span className="flex-1">{item.name}</span>
                      {item.notification && (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                          {item.notification}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-800 font-medium">
                    {currentUser?.name.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentUser?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{currentUser?.role || 'Funcionário'}</p>
                </div>
              </div>
              
              <button 
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
