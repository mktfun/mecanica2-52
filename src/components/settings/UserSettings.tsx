import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Check, X } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { UserSettings as UserSettingsType, Role, Permission, SystemUser } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';

// Esquema de validação para papel (role)
const roleSchema = z.object({
  id: z.string().min(1, { message: 'ID é obrigatório' }),
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
});

// Esquema de validação para usuário
const userSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  roleId: z.string().min(1, { message: 'Papel é obrigatório' }),
  active: z.boolean().default(true),
});

const UserSettings = () => {
  const { settings, saveSection, loading } = useSettings('users');
  const userSettings = settings as UserSettingsType;
  
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Form para papel (role)
  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      id: '',
      name: '',
    }
  });

  // Form para usuário
  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: '',
      active: true,
    }
  });

  // Inicializar permissões padrão
  useEffect(() => {
    if (!editingRole && !isAddingRole) return;
    
    const defaultPermissions: Permission[] = [
      { module: 'dashboard', create: false, read: true, update: false, delete: false },
      { module: 'clients', create: false, read: false, update: false, delete: false },
      { module: 'vehicles', create: false, read: false, update: false, delete: false },
      { module: 'services', create: false, read: false, update: false, delete: false },
      { module: 'orders', create: false, read: false, update: false, delete: false },
      { module: 'inventory', create: false, read: false, update: false, delete: false },
      { module: 'reports', create: false, read: false, update: false, delete: false },
      { module: 'settings', create: false, read: false, update: false, delete: false },
    ];
    
    if (editingRole) {
      setPermissions(editingRole.permissions);
    } else {
      setPermissions(defaultPermissions);
    }
  }, [editingRole, isAddingRole]);

  // Inicializar formulário de papel ao editar
  useEffect(() => {
    if (editingRole) {
      roleForm.reset({
        id: editingRole.id,
        name: editingRole.name,
      });
    }
  }, [editingRole, roleForm]);

  // Inicializar formulário de usuário ao editar
  useEffect(() => {
    if (editingUser) {
      userForm.reset({
        name: editingUser.name,
        email: editingUser.email,
        roleId: editingUser.roleId,
        active: editingUser.active,
      });
    }
  }, [editingUser, userForm]);

  // Filtrar usuários por termo de busca
  const filteredUsers = userSettings.users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar papéis por termo de busca
  const filteredRoles = userSettings.roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obter nome do papel pelo ID
  const getRoleName = (roleId: string) => {
    const role = userSettings.roles.find(r => r.id === roleId);
    return role ? role.name : 'Desconhecido';
  };

  // Atualizar permissão
  const updatePermission = (moduleIndex: number, field: keyof Permission, value: boolean) => {
    const updatedPermissions = [...permissions];
    updatedPermissions[moduleIndex] = {
      ...updatedPermissions[moduleIndex],
      [field]: value
    };
    setPermissions(updatedPermissions);
  };

  // Adicionar novo papel
  const handleAddRole = (data: z.infer<typeof roleSchema>) => {
    // Verificar se ID já existe
    if (userSettings.roles.some(role => role.id === data.id)) {
      roleForm.setError('id', { message: 'Este ID já está em uso' });
      return;
    }
    
    const newRole: Role = {
      id: data.id,
      name: data.name,
      permissions: permissions
    };
    
    const updatedRoles = [...userSettings.roles, newRole];
    saveSection('users', { roles: updatedRoles });
    
    setIsAddingRole(false);
    roleForm.reset();
    toast.success('Papel adicionado com sucesso');
  };

  // Atualizar papel existente
  const handleUpdateRole = (data: z.infer<typeof roleSchema>) => {
    if (!editingRole) return;
    
    // Verificar se ID já existe e não é o mesmo do papel atual
    if (data.id !== editingRole.id && userSettings.roles.some(role => role.id === data.id)) {
      roleForm.setError('id', { message: 'Este ID já está em uso' });
      return;
    }
    
    const updatedRole: Role = {
      id: data.id,
      name: data.name,
      permissions: permissions
    };
    
    const updatedRoles = userSettings.roles.map(role => 
      role.id === editingRole.id ? updatedRole : role
    );
    
    saveSection('users', { roles: updatedRoles });
    
    // Atualizar roleId dos usuários se o ID do papel mudou
    if (data.id !== editingRole.id) {
      const updatedUsers = userSettings.users.map(user => 
        user.roleId === editingRole.id ? { ...user, roleId: data.id } : user
      );
      saveSection('users', { users: updatedUsers });
    }
    
    setEditingRole(null);
    roleForm.reset();
    toast.success('Papel atualizado com sucesso');
  };

  // Excluir papel
  const handleDeleteRole = (roleId: string) => {
    // Verificar se há usuários usando este papel
    if (userSettings.users.some(user => user.roleId === roleId)) {
      toast.error('Não é possível excluir um papel que está sendo usado por usuários');
      return;
    }
    
    const updatedRoles = userSettings.roles.filter(role => role.id !== roleId);
    saveSection('users', { roles: updatedRoles });
    
    setConfirmDelete(null);
    toast.success('Papel excluído com sucesso');
  };

  // Adicionar novo usuário
  const handleAddUser = (data: z.infer<typeof userSchema>) => {
    // Verificar se email já existe
    if (userSettings.users.some(user => user.email === data.email)) {
      userForm.setError('email', { message: 'Este email já está em uso' });
      return;
    }
    
    const newUser: SystemUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      roleId: data.roleId,
      active: data.active,
      created_at: new Date().toISOString()
    };
    
    const updatedUsers = [...userSettings.users, newUser];
    saveSection('users', { users: updatedUsers });
    
    setIsAddingUser(false);
    userForm.reset();
    toast.success('Usuário adicionado com sucesso');
  };

  // Atualizar usuário existente
  const handleUpdateUser = (data: z.infer<typeof userSchema>) => {
    if (!editingUser) return;
    
    // Verificar se email já existe e não é o mesmo do usuário atual
    if (data.email !== editingUser.email && userSettings.users.some(user => user.email === data.email)) {
      userForm.setError('email', { message: 'Este email já está em uso' });
      return;
    }
    
    const updatedUser: SystemUser = {
      ...editingUser,
      name: data.name,
      email: data.email,
      roleId: data.roleId,
      active: data.active,
      updated_at: new Date().toISOString()
    };
    
    const updatedUsers = userSettings.users.map(user => 
      user.id === editingUser.id ? updatedUser : user
    );
    
    saveSection('users', { users: updatedUsers });
    
    setEditingUser(null);
    userForm.reset();
    toast.success('Usuário atualizado com sucesso');
  };

  // Excluir usuário
  const handleDeleteUser = (userId: string) => {
    const updatedUsers = userSettings.users.filter(user => user.id !== userId);
    saveSection('users', { users: updatedUsers });
    
    setConfirmDelete(null);
    toast.success('Usuário excluído com sucesso');
  };

  // Alternar status ativo do usuário
  const toggleUserActive = (userId: string, active: boolean) => {
    const updatedUsers = userSettings.users.map(user => 
      user.id === userId ? { ...user, active, updated_at: new Date().toISOString() } : user
    );
    
    saveSection('users', { users: updatedUsers });
    toast.success(`Usuário ${active ? 'ativado' : 'desativado'} com sucesso`);
  };

  // Renderizar formulário de papel
  const renderRoleForm = () => {
    const isEditing = !!editingRole;
    
    return (
      <Form {...roleForm}>
        <form onSubmit={roleForm.handleSubmit(isEditing ? handleUpdateRole : handleAddRole)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={roleForm.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Papel</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEditing} />
                  </FormControl>
                  <FormDescription>
                    Identificador único para o papel (ex: admin, manager)
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
                  <FormLabel>Nome do Papel</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome descritivo para o papel (ex: Administrador, Gerente)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissões</h3>
            <p className="text-sm text-gray-500">
              Configure as permissões para este papel
            </p>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead className="w-[100px] text-center">Criar</TableHead>
                  <TableHead className="w-[100px] text-center">Ler</TableHead>
                  <TableHead className="w-[100px] text-center">Atualizar</TableHead>
                  <TableHead className="w-[100px] text-center">Excluir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission, index) => (
                  <TableRow key={permission.module}>
                    <TableCell className="font-medium capitalize">
                      {permission.module}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={permission.create}
                        onCheckedChange={(checked) => updatePermission(index, 'create', !!checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={permission.read}
                        onCheckedChange={(checked) => updatePermission(index, 'read', !!checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={permission.update}
                        onCheckedChange={(checked) => updatePermission(index, 'update', !!checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={permission.delete}
                        onCheckedChange={(checked) => updatePermission(index, 'delete', !!checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddingRole(false);
                setEditingRole(null);
                roleForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {isEditing ? 'Atualizar' : 'Adicionar'} Papel
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  // Renderizar formulário de usuário
  const renderUserForm = () => {
    const isEditing = !!editingUser;
    
    return (
      <Form {...userForm}>
        <form onSubmit={userForm.handleSubmit(isEditing ? handleUpdateUser : handleAddUser)} className="space-y-6">
          <FormField
            control={userForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
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
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Papel</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um papel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userSettings.roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={userForm.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Usuário Ativo</FormLabel>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddingUser(false);
                setEditingUser(null);
                userForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {isEditing ? 'Atualizar' : 'Adicionar'} Usuário
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Usuários</h2>
        <p className="text-sm text-gray-500">
          Gerencie usuários e papéis de acesso ao sistema
        </p>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Papéis</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="users" className="mt-6">
          {isAddingUser || editingUser ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderUserForm()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Usuários</CardTitle>
                  <CardDescription>
                    Gerencie os usuários do sistema
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingUser(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </CardHeader>
              <CardContent>
                {userSettings.users.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">Nenhum usuário cadastrado</p>
                    <Button onClick={() => setIsAddingUser(true)}>
                      Adicionar Primeiro Usuário
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleName(user.roleId)}</TableCell>
                          <TableCell>
                            {user.active ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => toggleUserActive(user.id, !user.active)}
                              >
                                {user.active ? (
                                  <X className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              
                              <Dialog open={confirmDelete === user.id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setConfirmDelete(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmar exclusão</DialogTitle>
                                    <DialogDescription>
                                      Tem certeza que deseja excluir o usuário "{user.name}"?
                                      Esta ação não pode ser desfeita.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setConfirmDelete(null)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      Excluir
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
          {isAddingRole || editingRole ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingRole ? 'Editar Papel' : 'Novo Papel'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderRoleForm()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Papéis</CardTitle>
                  <CardDescription>
                    Gerencie os papéis e permissões do sistema
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingRole(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Papel
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Permissões</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map(role => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.id}</TableCell>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.filter(p => p.read || p.create || p.update || p.delete).map(p => (
                              <Badge key={p.module} variant="outline" className="capitalize">
                                {p.module}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingRole(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Dialog open={confirmDelete === role.id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setConfirmDelete(role.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirmar exclusão</DialogTitle>
                                  <DialogDescription>
                                    Tem certeza que deseja excluir o papel "{role.name}"?
                                    Esta ação não pode ser desfeita.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setConfirmDelete(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleDeleteRole(role.id)}
                                  >
                                    Excluir
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;
