
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Clipboard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { title: 'Dashboard', icon: Home, path: '/dashboard' },
  { title: 'Leads', icon: Users, path: '/leads' },
  { title: 'Agendamentos', icon: Calendar, path: '/appointments' },
  { title: 'O.S', icon: Clipboard, path: '/orders' },
  { title: 'Mkt', icon: TrendingUp, path: '/marketing' },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center shadow-lg z-50 lg:hidden">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.title}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex flex-col items-center justify-center text-xs font-medium p-2 rounded-md transition-colors duration-200 flex-1',
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="truncate">{tab.title}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
