
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizations } from '@/hooks/useOrganizations';
import { toast } from 'sonner';

interface OrganizationContextType {
  isLoading: boolean;
  error: string | null;
  selectedOrganizationId: string | null;
  organizations: any[];
  currentOrganization: any | null;
  selectOrganization: (orgId: string) => void;
  createOrganization: (name: string) => Promise<any>;
}

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isLoading,
    error,
    organizations,
    currentOrganization,
    createOrganization,
    switchOrganization
  } = useOrganizations();
  
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
    
    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Definir a organização selecionada
  useEffect(() => {
    if (currentOrganization && !selectedOrganizationId) {
      setSelectedOrganizationId(currentOrganization.id);
    }
  }, [currentOrganization, selectedOrganizationId]);

  // Função para alterar a organização selecionada
  const selectOrganization = (orgId: string) => {
    setSelectedOrganizationId(orgId);
    switchOrganization(orgId);
  };

  // Se a autenticação mudar para false, limpar dados de organização
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedOrganizationId(null);
    }
  }, [isAuthenticated]);
  
  return (
    <OrganizationContext.Provider value={{
      isLoading,
      error,
      selectedOrganizationId,
      organizations,
      currentOrganization,
      selectOrganization,
      createOrganization
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext deve ser usado dentro de um OrganizationProvider');
  }
  return context;
};
