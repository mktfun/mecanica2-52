
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Pencil, Trash2, UserPlus, Shield, History } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Permission, Role, SystemUser } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Módulos do sistema
const systemModules = [
  { id: 'all', name: 'Todo o Sistema' },
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'leads', name: 'Leads' },
  { id: 'appointments', name: 'Agendamentos' },
  { id: 'orders', name: 'Ordens de Serviço' },
  { id: 'reports', name: 'Relatórios' },
  { id: 'settings', name: 'Configurações' },
  { id: 'marketing', name: 'Marketing Digital' },
  { id: 'inventory', name: 'Inventário' },
  { id: 'financial', name: 'Financeiro' }
];

// Esquemas de validação
const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  roleId: z.string({ required_error: 'Perfil é obrigatório' }),
  active: z.boolean().default(true)
});

const roleSchema = z.object({
  id: z.string().min(1, { message: 'ID do perfil é obrigatório' }),
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  permissions: z.array(z.object({
    module: z.string(),
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean()
  }))
});

const UserSettings = () => {
  const { settings, saveSection, loading } = useSettings('users');
  const [activeTab, setActiveTab] = useState('users');
  
  const [userDialog, setUserDialog] = useState({ open: false, isEdit: false, editId: '' });
  const [roleDialog, setRoleDialog] = useState({ open: false, isEdit: false, editId: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: '', type: '' });

  // Valores padrão para os perfis de acesso
  const defaultRoles: Role[] = [
    {
      id: 'admin',
      name: 'Administrador',
      permissions: [
        {
          module: 'all',
          create: true,
          read: true,
          update: true,
          delete: true
        }
      ]
    },
    {
      id: 'manager',
      name: 'Gerente',
      permissions: [
        {
          module: 'leads',
          create: true,
          read: true,
          update: true,
          delete: false
        },
        {
          module: 'appointments',
          create: true,
          read: true,
          update: true,
          delete: false
        },
        {
          module: 'orders',
          create: true,
          read: true,
          update: true,
          delete: false
        },
        {
          module: 'reports',
          create: false,
          read: true,
          update: false,
          delete: false
        }
      ]
    }
  ];

  // Formulários
  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: '',
      active: true
    }
  });

  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      id: '',
      name: '',
      permissions: systemModules.map(module => ({
        module: module.id,
        create: false,
        read: false,
        update: false,
        delete: false
      }))
    }
  });

  // Obter dados ou usar valores padrão
  const roles = settings?.roles || defaultRoles;
  const users = settings?.users || [];

  // Obter função pelo ID
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Desconhecido';
  };

  // Abrir diálogo para adicionar usuário
  const openAddUserDialog = () => {
    userForm.reset({
      name: '',
      email: '',
      roleId: roles.length > 0 ? roles[0].id : '',
      active: true
    });
    setUserDialog({ open: true, isEdit: false, editId: '' });
  };

  // Abrir diálogo para editar usuário
  const openEditUserDialog = (user: SystemUser) => {
    userForm.reset({
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      active: user.active
    });
    setUserDialog({ open: true, isEdit: true, editId: user.id });
  };

  // Abrir diálogo para adicionar perfil
  const openAddRoleDialog = () => {
    roleForm.reset({
      id: '',
      name: '',
      permissions: systemModules.map(module => ({
        module: module.id,
        create: false,
        read: false,
        update: false,
        delete: false
      }))
    });
    setRoleDialog({ open: true, isEdit: false, editId: '' });
  };

  // Abrir diálogo para editar perfil
  const openEditRoleDialog = (role: Role) => {
    // Garantir que todos os módulos estejam presentes
    const allPermissions = systemModules.map(module => {
      const existingPermission = role.permissions.find(p => p.module === module.id);
      
      return existingPermission || {
        module: module.id,
        create: false,
        read: false,
        update: false,
        delete: false
      };
    });
    
    roleForm.reset({
      id: role.id,
      name: role.name,
      permissions: allPermissions
    });
    
    setRoleDialog({ open: true, isEdit: true, editId: role.id });
  };

  // Remover usuário
  const removeUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    const success = saveSection('users', { users: updatedUsers });
    
    if (success) {
      toast.success('Usuário removido com sucesso');
    }
    
    setDeleteConfirm({ open: false, id: '', type: '' });
  };

  // Remover perfil
  const removeRole = (id: string) => {
    // Verificar se há usuários com este perfil
    const usersWithRole = users.filter(user => user.roleId === id);
    
    if (usersWithRole.length > 0) {
      toast.error(`Não é possível remover o perfil. Existem ${usersWithRole.length} usuários com este perfil.`);
      setDeleteConfirm({ open: false, id: '', type: '' });
      return;
    }
    
    // Verificar se é um dos perfis padrão
    if (id === 'admin') {
      toast.error('Não é possível remover o perfil de Administrador.');
      setDeleteConfirm({ open: false, id: '', type: '' });
      return;
    }
    
    const updatedRoles = roles.filter(role => role.id !== id);
    const success = saveSection('users', { roles: updatedRoles });
    
    if (success) {
      toast.success('Perfil removido com sucesso');
    }
    
    setDeleteConfirm({ open: false, id: '', type: '' });
  };

  // Salvar usuário
  const onUserSubmit = (data: z.infer<typeof userSchema>) => {
    let updatedUsers = [...users];
    
    if (userDialog.isEdit) {
      // Atualizar usuário existente
      updatedUsers = updatedUsers.map(user =>
        user.id === userDialog.editId ? {
          ...user,
          ...data,
          updated_at: new Date().toISOString()
        } : user
      );
    } else {
      // Adicionar novo usuário
      updatedUsers.push({
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    const success = saveSection('users', { users: updatedUsers });
    
    if (success) {
      toast.success(userDialog.isEdit ? 'Usuário atualizado com sucesso' : 'Usuário adicionado com sucesso');
      setUserDialog({ open: false, isEdit: false, editId: '' });
    }
  };

  // Salvar perfil
  const onRoleSubmit = (data: z.infer<typeof roleSchema>) => {
    // Verificar se o ID já existe em caso de novo perfil
    if (!roleDialog.isEdit && roles.some(role => role.id === data.id)) {
      roleForm.setError('id', {
        type: 'manual',
        message: 'Este ID de perfil já está em uso'
      });
      return;
    }
    
    let updatedRoles = [...roles];
    
    if (roleDialog.isEdit) {
      // Atualizar perfil existente
      updatedRoles = updatedRoles.map(role =>
        role.id === roleDialog.editId ? data : role
      );
    } else {
      // Adicionar novo perfil
      updatedRoles.push(data);
    }
    
    const success = saveSection('users', { roles: updatedRoles });
    
    if (success) {
      toast.success(roleDialog.isEdit ? 'Perfil atualizado com sucesso' : 'Perfil adicionado com sucesso');
      setRoleDialog({ open: false, isEdit: false, editId: '' });
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return 'Data desconhecida';
    }
  };

  // Alternar estado de um usuário
  const toggleUserActive = (id: string, currentState: boolean) => {
    const updatedUsers = users.map(user =>
      user.id === id ? {
        ...user,
        active: !currentState,
        updated_at: new Date().toISOString()
      } : user
    );
    
    const success = saveSection('users', { users: updatedUsers });
    
    if (success) {
      toast.success(currentState 
        ? 'Usuário desativado com sucesso' 
        : 'Usuário ativado com sucesso'
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Usuários e Permissões</h2>
        <p className="text-sm text-gray-500">
          Gerencie os usuários do sistema e seus perfis de acesso
        </p>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="users">
            <UserPlus className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Perfis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>
                  Gerenciar os usuários com acesso ao sistema
                </CardDescription>
              </div>
              <Button onClick={openAddUserDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500 mb-4">
                    Nenhum usuário cadastrado
                  </p>
                  <Button onClick={openAddUserDialog} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Usuário
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleName(user.roleId)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`mr-2 h-2.5 w-2.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditUserDialog(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant={user.active ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleUserActive(user.id, user.active)}
                              >
                                {user.active ? 'Desativar' : 'Ativar'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setDeleteConfirm({ open: true, id: user.id, type: 'user' })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Perfis de Acesso</CardTitle>
                <CardDescription>
                  Gerenciar os perfis de acesso e suas permissões
                </CardDescription>
              </div>
              <Button onClick={openAddRoleDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Perfil
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-xl">{role.name}</CardTitle>
                      <CardDescription className="text-xs">
                        ID: {role.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium mb-2">Permissões:</h4>
                      <ul className="space-y-2 text-sm">
                        {role.permissions.map((permission) => {
                          const module = systemModules.find(m => m.id === permission.module);
                          if (!module) return null;
                          
                          const actions = [];
                          if (permission.read) actions.push('Visualizar');
                          if (permission.create) actions.push('Criar');
                          if (permission.update) actions.push('Editar');
                          if (permission.delete) actions.push('Excluir');
                          
                          return (
                            <li key={permission.module} className="flex flex-col">
                              <span className="font-medium">{module.name}</span>
                              <span className="text-xs text-gray-500">
                                {actions.length > 0 
                                  ? actions.join(', ')
                                  : 'Sem permissões'}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditRoleDialog(role)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      {role.id !== 'admin' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteConfirm({ open: true, id: role.id, type: 'role' })}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para adicionar/editar usuário */}
      <Dialog open={userDialog.open} onOpenChange={(open) => setUserDialog({ ...userDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{userDialog.isEdit ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {userDialog.isEdit 
                ? 'Atualize as informações do usuário' 
                : 'Preencha os dados do novo usuário'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil*</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      O perfil define as permissões do usuário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status do Usuário</FormLabel>
                      <FormDescription>
                        Usuários inativos não podem acessar o sistema
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setUserDialog({ ...userDialog, open: false })}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {userDialog.isEdit ? 'Atualizar' : 'Adicionar'} Usuário
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para adicionar/editar perfil */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog({ ...roleDialog, open })}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{roleDialog.isEdit ? 'Editar Perfil' : 'Novo Perfil'}</DialogTitle>
            <DialogDescription>
              {roleDialog.isEdit 
                ? 'Atualize as informações do perfil' 
                : 'Preencha os dados do novo perfil'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={roleForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID do Perfil*</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={roleDialog.isEdit}
                          placeholder="ex: manager, operator"
                        />
                      </FormControl>
                      <FormDescription>
                        Identificador único do perfil (sem espaços ou caracteres especiais)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={roleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Perfil*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ex: Gerente, Operador" />
                      </FormControl>
                      <FormDescription>
                        Nome de exibição do perfil
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Permissões</h3>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Módulo</TableHead>
                        <TableHead className="text-center">Visualizar</TableHead>
                        <TableHead className="text-center">Criar</TableHead>
                        <TableHead className="text-center">Editar</TableHead>
                        <TableHead className="text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleForm.watch('permissions').map((permission, index) => {
                        const module = systemModules.find(m => m.id === permission.module);
                        
                        return (
                          <TableRow key={permission.module}>
                            <TableCell className="font-medium">
                              {module?.name || permission.module}
                              
                              {/* Se for o módulo 'all', mostrar alerta */}
                              {permission.module === 'all' && (
                                <p className="text-xs text-amber-600 font-normal">
                                  Esta opção concede acesso a todo o sistema
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={permission.read}
                                onCheckedChange={(checked) => {
                                  const newPermissions = [...roleForm.watch('permissions')];
                                  newPermissions[index].read = checked;
                                  roleForm.setValue('permissions', newPermissions);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={permission.create}
                                onCheckedChange={(checked) => {
                                  const newPermissions = [...roleForm.watch('permissions')];
                                  newPermissions[index].create = checked;
                                  roleForm.setValue('permissions', newPermissions);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={permission.update}
                                onCheckedChange={(checked) => {
                                  const newPermissions = [...roleForm.watch('permissions')];
                                  newPermissions[index].update = checked;
                                  roleForm.setValue('permissions', newPermissions);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={permission.delete}
                                onCheckedChange={(checked) => {
                                  const newPermissions = [...roleForm.watch('permissions')];
                                  newPermissions[index].delete = checked;
                                  roleForm.setValue('permissions', newPermissions);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRoleDialog({ ...roleDialog, open: false })}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {roleDialog.isEdit ? 'Atualizar' : 'Adicionar'} Perfil
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação</DialogTitle>
            <DialogDescription>
              {deleteConfirm.type === 'user'
                ? 'Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.'
                : 'Tem certeza que deseja remover este perfil? Esta ação não pode ser desfeita.'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (deleteConfirm.type === 'user') {
                  removeUser(deleteConfirm.id);
                } else {
                  removeRole(deleteConfirm.id);
                }
              }}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings;
