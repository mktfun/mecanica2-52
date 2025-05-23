
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Vehicle {
  id: string;
  client_id: string;
  make: string;
  model: string;
  year?: string;
  plate: string;
  color?: string;
  vin?: string;
  mileage?: number;
  notes?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useVehicles = (clientId?: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

  // Buscar todos os veículos da organização, filtrando por cliente se clientId for fornecido
  const fetchVehicles = useCallback(async (forceClientId?: string) => {
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
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('organization_id', orgId);
      
      // Filtrar por cliente se clientId for fornecido
      const currentClientId = forceClientId || clientId;
      if (currentClientId) {
        query = query.eq('client_id', currentClientId);
      }

      const { data, error } = await query.order('make', { ascending: true });

      if (error) {
        throw error;
      }

      setVehicles(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar veículos:', err);
      setError(err.message || 'Erro ao carregar veículos');
      toast.error('Erro ao carregar veículos');
    } finally {
      setIsLoading(false);
    }
  }, [userOrganizationId, clientId, fetchUserOrganization]);

  // Adicionar um novo veículo
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    // Verificar se temos uma organização
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      toast.error('Usuário não pertence a nenhuma organização');
      throw new Error('Usuário não pertence a nenhuma organização');
    }

    try {
      const vehicleWithOrg = {
        ...vehicle,
        organization_id: orgId
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleWithOrg])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar a lista de veículos localmente se o veículo pertence ao cliente atual
      if (!clientId || data.client_id === clientId) {
        setVehicles(prev => [...prev, data]);
      }
      
      toast.success('Veículo adicionado com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao adicionar veículo:', err);
      toast.error('Erro ao adicionar veículo');
      throw err;
    }
  };

  // Atualizar um veículo existente
  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar a lista de veículos localmente
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
      toast.success('Veículo atualizado com sucesso');
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar veículo:', err);
      toast.error('Erro ao atualizar veículo');
      throw err;
    }
  };

  // Remover um veículo
  const removeVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualizar a lista de veículos localmente
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Veículo removido com sucesso');
      return true;
    } catch (err: any) {
      console.error('Erro ao remover veículo:', err);
      toast.error('Erro ao remover veículo');
      throw err;
    }
  };

  // Buscar veículo por ID
  const getVehicleById = async (id: string): Promise<Vehicle | null> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
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
      console.error('Erro ao buscar veículo por ID:', err);
      return null;
    }
  };

  // Buscar todos os veículos de um cliente específico
  const getVehiclesByClientId = async (clientId: string): Promise<Vehicle[]> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('client_id', clientId)
        .order('make', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Erro ao buscar veículos por cliente:', err);
      return [];
    }
  };

  // Inicializar o hook buscando a organização do usuário e então os veículos
  useEffect(() => {
    const init = async () => {
      const orgId = await fetchUserOrganization();
      setUserOrganizationId(orgId);
      
      if (orgId) {
        fetchVehicles();
      } else {
        setVehicles([]);
        setIsLoading(false);
        setError('Usuário não pertence a nenhuma organização');
      }
    };

    init();
  }, [fetchUserOrganization, clientId]);

  return {
    vehicles,
    isLoading,
    error,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    removeVehicle,
    getVehicleById,
    getVehiclesByClientId,
    userOrganizationId
  };
};
