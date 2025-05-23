
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOrganizationId, setUserOrganizationId] = useState<string | null>(null);

  // Função para buscar a organização do usuário atual
  const fetchUserOrganization = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        if (membershipError.code !== 'PGRST116') { // PGRST116 é o código para "no rows found"
          console.error('Erro ao buscar organização do usuário:', membershipError);
        }
        return null;
      }

      return memberships?.organization_id || null;
    } catch (err) {
      console.error('Erro ao buscar usuário ou organização:', err);
      return null;
    }
  }, []);

  // Buscar todos os clientes da organização
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Verificar se temos uma organização
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      setIsLoading(false);
      setError('Usuário não pertence a nenhuma organização');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err);
      setError(err.message || 'Erro ao carregar clientes');
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [userOrganizationId, fetchUserOrganization]);

  // Adicionar um novo cliente
  const addClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    // Verificar se temos uma organização
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      toast.error('Usuário não pertence a nenhuma organização');
      throw new Error('Usuário não pertence a nenhuma organização');
    }

    try {
      const clientWithOrg = {
        ...client,
        organization_id: orgId
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientWithOrg])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar a lista de clientes localmente
      setClients(prev => [...prev, data]);
      toast.success('Cliente adicionado com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao adicionar cliente:', err);
      toast.error('Erro ao adicionar cliente');
      throw err;
    }
  };

  // Atualizar um cliente existente
  const updateClient = async (id: string, client: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar a lista de clientes localmente
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      toast.success('Cliente atualizado com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      toast.error('Erro ao atualizar cliente');
      throw err;
    }
  };

  // Remover um cliente
  const removeClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualizar a lista de clientes localmente
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente removido com sucesso');
      return true;
    } catch (err: any) {
      console.error('Erro ao remover cliente:', err);
      toast.error('Erro ao remover cliente');
      throw err;
    }
  };

  // Buscar cliente por ID
  const getClientById = async (id: string): Promise<Client | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Erro ao buscar cliente por ID:', err);
      return null;
    }
  };

  // Inicializar o hook buscando a organização do usuário e então os clientes
  useEffect(() => {
    const init = async () => {
      const orgId = await fetchUserOrganization();
      setUserOrganizationId(orgId);
      
      if (orgId) {
        fetchClients();
      } else {
        setClients([]);
        setIsLoading(false);
        setError('Usuário não pertence a nenhuma organização');
      }
    };

    init();
  }, [fetchUserOrganization]);

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    addClient,
    updateClient,
    removeClient,
    getClientById,
    userOrganizationId
  };
};
