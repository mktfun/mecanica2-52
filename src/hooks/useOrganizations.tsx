
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  created_at: string;
}

type MemberRole = 'admin' | 'member' | 'viewer';

interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as organizações do usuário atual
  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Obter todas as organizações do usuário
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(id, name, created_at)')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Formatar os dados
      const formattedOrgs: Organization[] = data.map(item => ({
        id: item.organizations.id,
        name: item.organizations.name,
        created_at: item.organizations.created_at
      }));

      setOrganizations(formattedOrgs);

      // Definir a organização atual (por enquanto, vamos pegar a primeira)
      if (formattedOrgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(formattedOrgs[0]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar organizações:', err);
      setError(err.message || 'Erro ao carregar organizações');
      toast.error('Erro ao carregar organizações');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);

  // Buscar membros da organização atual
  const fetchOrganizationMembers = useCallback(async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId);

      if (error) {
        throw error;
      }

      // Certifique-se de que os membros correspondem ao tipo OrganizationMember
      const typedMembers: OrganizationMember[] = data.map(member => ({
        organization_id: member.organization_id,
        user_id: member.user_id,
        role: member.role as MemberRole,
        created_at: member.created_at
      }));

      setMembers(typedMembers);
      return typedMembers;
    } catch (err: any) {
      console.error('Erro ao buscar membros da organização:', err);
      toast.error('Erro ao carregar membros da organização');
      throw err;
    }
  }, []);

  // Criar uma nova organização
  const createOrganization = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Criar organização
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name }])
        .select();

      if (orgError) {
        throw orgError;
      }

      const newOrg = orgData[0];

      // Adicionar usuário atual como admin da organização
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: newOrg.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) {
        throw memberError;
      }

      // Atualizar estado local
      const formattedOrg: Organization = {
        id: newOrg.id,
        name: newOrg.name,
        created_at: newOrg.created_at
      };
      
      setOrganizations(prev => [...prev, formattedOrg]);
      setCurrentOrganization(formattedOrg);
      
      toast.success('Organização criada com sucesso');
      return formattedOrg;
    } catch (err: any) {
      console.error('Erro ao criar organização:', err);
      toast.error('Erro ao criar organização');
      throw err;
    }
  };

  // Adicionar membro à organização atual
  const addOrganizationMember = async (orgId: string, email: string, role: MemberRole) => {
    try {
      // Esta função precisa ser reescrita para lidar com a realidade do Supabase
      // Como não temos acesso direto à tabela auth.users via API, precisamos
      // de uma abordagem diferente
      
      // Em um cenário real, recomenda-se:
      // 1. Criar uma função RPC no Supabase para buscar um usuário por e-mail
      // 2. Ou criar uma tabela profiles que mantém o email associado ao user_id
      
      // Por enquanto, como solução temporária:
      toast.error('Funcionalidade ainda não implementada completamente');
      console.error('Funcionalidade de adicionar membros requer implementação adicional');
      
      // Exemplo de como seria a lógica caso tivéssemos o user_id:
      /*
      const userId = '...'; // ID do usuário obtido de alguma forma
      
      const { error } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgId,
          user_id: userId,
          role: role
        }]);

      if (error) {
        throw error;
      }
      
      // Atualizar lista de membros
      fetchOrganizationMembers(orgId);
      toast.success('Membro adicionado com sucesso');
      */
    } catch (err: any) {
      console.error('Erro ao adicionar membro:', err);
      toast.error('Erro ao adicionar membro');
      throw err;
    }
  };

  // Alterar organização atual
  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      // Recarregar dados da aplicação (leads, etc.)
      // Isso será tratado pelo efeito que observa mudanças em currentOrganization
    } else {
      toast.error('Organização não encontrada');
    }
  };

  // Inicializar o hook buscando as organizações
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Buscar membros quando a organização atual mudar
  useEffect(() => {
    if (currentOrganization) {
      fetchOrganizationMembers(currentOrganization.id);
    }
  }, [currentOrganization, fetchOrganizationMembers]);

  return {
    organizations,
    currentOrganization,
    members,
    isLoading,
    error,
    fetchOrganizations,
    fetchOrganizationMembers,
    createOrganization,
    addOrganizationMember,
    switchOrganization
  };
};
