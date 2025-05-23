
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/lead';
import { toast } from 'sonner';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
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

  // Função para buscar todos os leads
  const fetchLeads = useCallback(async () => {
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
        .from('leads')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Mapear os dados do Supabase para o formato do Lead
      const formattedLeads: Lead[] = data.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone,
        vehicle_brand: lead.vehicle_brand || '',
        vehicle_model: lead.vehicle_model || '',
        vehicle_year: lead.vehicle_year || '',
        service_interest: lead.service_interest || '',
        source: lead.source || 'direct',
        potential_value: lead.potential_value || 0,
        assigned_to: lead.assigned_to || '',
        status: lead.status as LeadStatus, // Garantir que o status seja tratado como LeadStatus
        notes: lead.notes || '',
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        status_changed_at: lead.status_changed_at,
        last_interaction_at: lead.last_interaction_at,
        organization_id: lead.organization_id
      }));

      setLeads(formattedLeads);
    } catch (err: any) {
      console.error('Erro ao buscar leads:', err);
      setError(err.message || 'Erro ao carregar leads');
      toast.error('Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  }, [userOrganizationId, fetchUserOrganization]);

  // Função para adicionar um lead
  const addLead = async (newLead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status_changed_at' | 'last_interaction_at'>) => {
    // Verificar se temos uma organização
    const orgId = userOrganizationId || await fetchUserOrganization();
    
    if (!orgId) {
      toast.error('Usuário não pertence a nenhuma organização');
      throw new Error('Usuário não pertence a nenhuma organização');
    }

    try {
      const leadWithOrg = {
        ...newLead,
        organization_id: orgId
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([leadWithOrg])
        .select();

      if (error) {
        throw error;
      }

      // Atualizar a lista de leads localmente
      if (data && data[0]) {
        const formattedLead: Lead = {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email || '',
          phone: data[0].phone,
          vehicle_brand: data[0].vehicle_brand || '',
          vehicle_model: data[0].vehicle_model || '',
          vehicle_year: data[0].vehicle_year || '',
          service_interest: data[0].service_interest || '',
          source: data[0].source || 'direct',
          potential_value: data[0].potential_value || 0,
          assigned_to: data[0].assigned_to || '',
          status: data[0].status as LeadStatus, // Cast para LeadStatus
          notes: data[0].notes || '',
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          status_changed_at: data[0].status_changed_at,
          last_interaction_at: data[0].last_interaction_at,
          organization_id: data[0].organization_id
        };
        
        setLeads(prevLeads => [formattedLead, ...prevLeads]);
        toast.success('Lead adicionado com sucesso');
        return formattedLead;
      }
    } catch (err: any) {
      console.error('Erro ao adicionar lead:', err);
      toast.error('Erro ao adicionar lead');
      throw err;
    }
  };

  // Função para atualizar um lead
  const updateLead = async (id: string, updatedData: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updatedData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      // Atualizar a lista de leads localmente
      if (data && data[0]) {
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === id ? { 
              ...lead, 
              ...data[0], 
              status: data[0].status as LeadStatus // Cast para LeadStatus
            } : lead
          )
        );
        
        toast.success('Lead atualizado com sucesso');
        return data[0];
      }
    } catch (err: any) {
      console.error('Erro ao atualizar lead:', err);
      toast.error('Erro ao atualizar lead');
      throw err;
    }
  };

  // Função específica para atualizar o status do lead (para drag-and-drop no Kanban)
  const updateLeadStatus = async (id: string, newStatus: string) => {
    return updateLead(id, { status: newStatus as LeadStatus });
  };

  // Inicializar o hook buscando a organização do usuário e então os leads
  useEffect(() => {
    const init = async () => {
      const orgId = await fetchUserOrganization();
      setUserOrganizationId(orgId);
      
      if (orgId) {
        // Se o usuário tem uma organização, buscar leads
        fetchLeads();
        
        // Configurar a escuta em tempo real para atualizações de leads
        const channel = supabase
          .channel('realtime_leads')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'leads',
            filter: `organization_id=eq.${orgId}`
          }, (payload) => {
            console.log('Alteração em tempo real detectada:', payload);
            // Recarregar todos os leads quando houver uma alteração
            fetchLeads();
          })
          .subscribe();

        return () => {
          // Limpar a assinatura ao desmontar o componente
          supabase.removeChannel(channel);
        };
      } else {
        // Se o usuário não tem uma organização, definir o estado como vazio
        setLeads([]);
        setIsLoading(false);
        setError('Usuário não pertence a nenhuma organização');
      }
    };

    init();
  }, [fetchUserOrganization]);

  return {
    leads,
    isLoading,
    error,
    fetchLeads,
    addLead,
    updateLead,
    updateLeadStatus,
    userOrganizationId
  };
};
