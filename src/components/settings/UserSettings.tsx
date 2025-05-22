import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { SystemUser, Role } from '@/types/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Copy, Edit, Trash, UserPlus, Lock, CheckCheck, Check, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserSettings = () => {
  const { settings, saveSection } = useSettings('users');
  const userSettings = settings as { users: SystemUser[]; roles: Role[] };
  const users = userSettings?.users || [];
  const roles = userSettings?.roles || [];

  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const userSchema = z.object({
    name: z.string().min(2, {
      message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Email inválido.",
    }),
    role: z.string().min(1, {
      message: "Selecione uma função.",
    }),
    active: z.boolean().default(true),
  })

  const addUserForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      active: true,
    },
  })

  // Update references from roleId to role
  const getUserRole = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    
    const role = roles.find(r => r.id === user.role);
    return role;
  };

  // Initialize or reset form with user data
  const initForm = (user?: SystemUser) => {
    if (user) {
      addUserForm.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      });
      setEditingUser(user);
    } else {
      addUserForm.reset({
        name: "",
        email: "",
        role: "",
        active: true,
      });
      setEditingUser(null);
    }
  };

  // Start adding a new user
  const startAddUser = () => {
    initForm();
    setIsAddingUser(true);
  };

  // Start editing an existing user
  const startEditUser = (user: SystemUser) => {
    initForm(user);
    setIsAddingUser(false);
  };

  // Cancel editing/adding
  const cancelEdit = () => {
    setIsAddingUser(false);
    setEditingUser(null);
    addUserForm.reset();
  };

  // Handle user activation
  const handleUserActivation = (userId: string, active: boolean) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, active: active };
      }
      return user;
    });

    saveSection('users', { users: updatedUsers, roles });
    toast.success(`Usuário ${active ? 'ativado' : 'desativado'} com sucesso`);
  };

  // Update user role
  const handleUserRoleChange = (userId: string, roleId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: roleId };
      }
      return user;
    });
    
    saveSection('users', { users: updatedUsers, roles });
    toast.success('Função do usuário atualizada com sucesso');
  };

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  // Confirm delete user
  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    const updatedUsers = users.filter(user => user.id !== userToDelete);
    saveSection('users', { users: updatedUsers, roles });
    setShowDeleteDialog(false);
    setUserToDelete(null);
    toast.success('Usuário removido com sucesso');
  };

  // Handle form submission for new user
  const handleAddUser = (data: any) => {
    const newUser: SystemUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
      lastLogin: '',
      permissions: [] // Will inherit from role
    };
    
    const updatedUsers = [...users, newUser];
    saveSection('users', { users: updatedUsers, roles });
    setIsAddingUser(false);
    setEditingUser(null);
    addUserForm.reset();
    toast.success('Usuário adicionado com sucesso');
  };

  // Handle form submission for updating user
  const handleUpdateUser = (data: any) => {
    if (!editingUser) return;

    const updatedUser: SystemUser = {
      ...editingUser,
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
    };

    const updatedUsers = users.map(user => {
      if (user.id === updatedUser.id) {
        return updatedUser;
      }
      return user;
    });

    saveSection('users', { users: updatedUsers, roles });
    setIsAddingUser(false);
    setEditingUser(null);
    addUserForm.reset();
    toast.success('Usuário atualizado com sucesso');
  };

  // Render single user row
  const renderUserRow = (user: SystemUser) => {
    const userRole = roles.find(r => r.id === user.role);
    
    return (
      <tr key={user.id} className={!user.active ? 'opacity-70' : ''}>
        <TableCell className="font-medium">{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <td>
          {userRole ? userRole.name : 'N/A'}
        </td>
        <TableCell>
          <Switch
            checked={user.active}
            onCheckedChange={(checked) => handleUserActivation(user.id, checked)}
          />
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => startEditUser(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-500">
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </tr>
    );
  };

  // Render user form for adding/editing
  const renderUserForm = () => {
    const isEditing = !!editingUser;

    return (
      <Form {...addUserForm}>
        <form onSubmit={addUserForm.handleSubmit(isEditing ? handleUpdateUser : handleAddUser)} className="space-y-4">
          <FormField
            control={addUserForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do usuário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addUserForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email do usuário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addUserForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addUserForm.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 rounded-md border p-4">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Ativo</FormLabel>
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Atualizar' : 'Adicionar'} Usuário</Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Usuários</h2>
        {!isAddingUser && !editingUser && (
          <Button onClick={startAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        )}
      </div>

      {isAddingUser || editingUser ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderUserForm()}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => renderUserRow(user))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserSettings;
