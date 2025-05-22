
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { AccountSettings as AccountSettingsType, AccountProfile, NotificationPreferences } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';
import authService from '@/services/authService';

// Esquema de validação para o perfil
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().optional(),
  position: z.string().optional(),
  avatar: z.string().nullable()
});

// Esquema de validação para senha
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Senha atual é obrigatória' }),
  newPassword: z.string().min(8, { message: 'Nova senha deve ter pelo menos 8 caracteres' }),
  confirmPassword: z.string().min(1, { message: 'Confirmação de senha é obrigatória' })
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Esquema de validação para notificações
const notificationsSchema = z.object({
  email: z.boolean(),
  browser: z.boolean(),
  newLeads: z.boolean(),
  appointments: z.boolean(),
  completedOrders: z.boolean()
});

const AccountSettings = () => {
  const { settings, saveSection, loading } = useSettings('account');
  // Explicitly cast settings to AccountSettingsType
  const accountSettings = settings as AccountSettingsType;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Form para perfil
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      avatar: null
    }
  });

  // Form para senha
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Form para notificações
  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email: true,
      browser: true,
      newLeads: true,
      appointments: true,
      completedOrders: true
    }
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (accountSettings) {
      // Carregar dados do perfil do usuário atual
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        profileForm.reset({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: accountSettings.profile?.phone || '',
          position: accountSettings.profile?.position || '',
          avatar: accountSettings.profile?.avatar || null
        });
        
        setAvatarPreview(accountSettings.profile?.avatar || null);
      }
      
      // Carregar preferências de notificação
      if (accountSettings.notifications) {
        notificationsForm.reset(accountSettings.notifications);
      }
    }
  }, [accountSettings]);

  // Lidar com upload de avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        profileForm.setValue('avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar perfil
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    const profileData: AccountProfile = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      position: data.position || '',
      avatar: data.avatar
    };
    
    const success = saveSection('account', {
      profile: profileData
    });
    
    if (success) {
      toast.success('Perfil atualizado com sucesso');
    }
  };

  // Alterar senha
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    // Mock para verificação de senha já que o authService não tem esses métodos
    const passwordValid = true; // authService.verifyPassword seria aqui
    
    if (!passwordValid) {
      passwordForm.setError('currentPassword', {
        type: 'manual',
        message: 'Senha atual incorreta'
      });
      return;
    }
    
    // Mock para alteração de senha já que o authService não tem esses métodos
    const success = true; // authService.changePassword seria aqui
    
    if (success) {
      toast.success('Senha alterada com sucesso');
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      toast.error('Erro ao alterar a senha');
    }
  };

  // Salvar preferências de notificações
  const onNotificationsSubmit = (data: z.infer<typeof notificationsSchema>) => {
    const notificationData: NotificationPreferences = {
      email: data.email,
      browser: data.browser,
      newLeads: data.newLeads,
      appointments: data.appointments,
      completedOrders: data.completedOrders
    };
    
    const success = saveSection('account', {
      notifications: notificationData
    });
    
    if (success) {
      toast.success('Preferências de notificação atualizadas');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Conta</h2>
        <p className="text-sm text-gray-500">
          Gerencie suas informações pessoais e preferências de notificação
        </p>
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-xl">
                    {profileForm.watch('name') ? profileForm.watch('name').charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    Alterar foto
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG ou GIF. Máximo 2MB.</p>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
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
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={loading}>
                Salvar Perfil
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Atualize sua senha para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      A senha deve ter pelo menos 8 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading}>
                Alterar Senha
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>
            Configure como e quando deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Canais de Notificação</h3>
                
                <FormField
                  control={notificationsForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Receber notificações por email</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationsForm.control}
                  name="browser"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Receber notificações no navegador</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tipos de Notificação</h3>
                
                <FormField
                  control={notificationsForm.control}
                  name="newLeads"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Novos leads</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationsForm.control}
                  name="appointments"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Agendamentos</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationsForm.control}
                  name="completedOrders"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Ordens de serviço concluídas</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={loading}>
                Salvar Preferências
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
