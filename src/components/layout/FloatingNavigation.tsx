
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import { Home, Users, Calendar, Clipboard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const tabs = [
  { title: 'Dashboard', icon: Home, path: '/dashboard' },
  { title: 'Leads', icon: Users, path: '/leads' },
  { title: 'Agendamentos', icon: Calendar, path: '/appointments' },
  { title: 'O.S', icon: Clipboard, path: '/orders' },
  { title: 'Mkt', icon: TrendingUp, path: '/marketing' },
];

// Variantes de animação para os botões e textos
const buttonVariants = {
  animate: (isSelected: boolean) => ({
    width: isSelected ? "auto" : "40px",
  }),
};

const spanVariants = {
  initial: { opacity: 0, width: 0 },
  animate: { opacity: 1, width: "auto" },
  exit: { opacity: 0, width: 0 },
};

const transition = {
  duration: 0.3,
  ease: "easeInOut",
};

const FloatingNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  // Encontrar índice inicial baseado na rota atual
  useEffect(() => {
    const currentPath = location.pathname;
    const initialIndex = tabs.findIndex(tab => currentPath.startsWith(tab.path));
    setSelected(initialIndex !== -1 ? initialIndex : null);
  }, [location.pathname]);

  const handleSelect = (index: number, path: string) => {
    setSelected(index);
    navigate(path);
  };

  // Só renderiza se for mobile
  if (!isMobile) {
    return null;
  }

  return (
    <motion.div 
      className={cn(
        "fixed bottom-6 left-0 right-0 z-50",
        "flex items-center justify-center",
        "bg-transparent",
        "px-4 py-2"
      )}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
    >
      <div className={cn(
        "flex items-center gap-1",
        "rounded-full",
        "bg-gray-50 dark:bg-gray-800 p-1.5 shadow-lg",
        "border border-gray-200 dark:border-gray-700"
      )}>
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isSelected = selected === index;
          return (
            <motion.button
              key={tab.title}
              variants={buttonVariants}
              initial={false}
              animate="animate"
              custom={isSelected}
              onClick={() => handleSelect(index, tab.path)}
              transition={transition}
              className={cn(
                "relative flex items-center justify-center rounded-full px-2 py-2 text-sm font-medium transition-all duration-300",
                isSelected
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className="size-5" />
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.span
                    variants={spanVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                    className="ml-1 overflow-hidden whitespace-nowrap"
                  >
                    {tab.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FloatingNavigation;
