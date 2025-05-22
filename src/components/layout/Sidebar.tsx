
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
import { 
  HomeIcon, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Car,
  BarChart,
  Bell
} from 'lucide-react';

interface SidebarProps {
  isMobile: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();
  
  const handleLogout = () => {
    authService.logout();
    toast({
      description: "Logout realizado com sucesso"
    });
    navigate('/login');
  };
  
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    { path: '/leads', name: 'Leads', icon: Users },
    { path: '/clients', name: 'Clientes', icon: Users },
    { path: '/vehicles', name: 'Veículos', icon: Car },
    { path: '/appointments', name: 'Agendamentos', icon: Calendar },
    { path: '/orders', name: 'Ordens de Serviço', icon: FileText },
    { path: '/marketing', name: 'Marketing Digital', icon: BarChart },
    { path: '/reports', name: 'Relatórios', icon: BarChart },
    { path: '/settings', name: 'Configurações', icon: Settings },
  ];
  
  const handleNavClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };
  
  const linkClassName = "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400";
  const activeLinkClassName = "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400";
  
  return (
    <div className={`h-screen flex flex-col bg-white border-r border-gray-200 w-64 dark:bg-gray-900 dark:border-gray-800 ${isMobile ? 'w-full' : ''}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-400">MecânicaPro</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `${linkClassName} ${isActive ? activeLinkClassName : ''}`
                }
                onClick={handleNavClick}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
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
    </div>
  );
};

export default Sidebar;
