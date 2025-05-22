import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { AppSettings as AppSettingsType } from '@/types/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const AppSettings = () => {
  const { settings, saveSection } = useSettings('app');
  const appSettings = settings as AppSettingsType;

  // Default settings
  const defaultSettings: AppSettingsType = {
    theme: {
      mode: "light",
      primaryColor: "#1890ff",
      accentColor: "#52c41a"
    },
    display: {
      itemsPerPage: 10,
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      language: "pt-BR"
    },
    security: {
      requirePasswordChange: false,
      passwordExpirationDays: 90,
      sessionTimeout: 30,
      useEncryption: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: "daily",
      keepBackups: 7
    }
  };

  const [initialValues, setInitialValues] = useState(appSettings || defaultSettings);

  useEffect(() => {
    setInitialValues(appSettings || defaultSettings);
  }, [settings]);

  const appSchema = z.object({
    theme: z.object({
      mode: z.enum(["light", "dark", "system"]),
      primaryColor: z.string().min(4).max(7),
      accentColor: z.string().min(4).max(7)
    }),
    display: z.object({
      itemsPerPage: z.number().min(5).max(100),
      dateFormat: z.string(),
      timeFormat: z.enum(["24h", "12h"]),
      language: z.string()
    }),
    security: z.object({
      requirePasswordChange: z.boolean(),
      passwordExpirationDays: z.number().min(30).max(365),
      sessionTimeout: z.number().min(15).max(120),
      useEncryption: z.boolean()
    }),
    backup: z.object({
      autoBackup: z.boolean(),
      backupFrequency: z.enum(["daily", "weekly", "monthly"]),
      keepBackups: z.number().min(1).max(30)
    })
  });

  const form = useForm<z.infer<typeof appSchema>>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      theme: initialValues.theme,
      display: initialValues.display,
      security: initialValues.security,
      backup: initialValues.backup
    },
    mode: "onChange"
  });

  // Handle save
  const handleSave = (values: any) => {
    try {
      // Save settings
      saveSection('app', {
        theme: {
          mode: values.theme.mode,
          primaryColor: values.theme.primaryColor,
          accentColor: values.theme.accentColor
        },
        display: {
          itemsPerPage: values.display.itemsPerPage,
          dateFormat: values.display.dateFormat,
          timeFormat: values.display.timeFormat,
          language: values.display.language
        },
        security: {
          requirePasswordChange: values.security.requirePasswordChange,
          passwordExpirationDays: values.security.passwordExpirationDays,
          sessionTimeout: values.security.sessionTimeout,
          useEncryption: values.security.useEncryption
        },
        backup: {
          autoBackup: values.backup?.autoBackup || defaultSettings.backup.autoBackup,
          backupFrequency: values.backup?.backupFrequency || defaultSettings.backup.backupFrequency,
          keepBackups: values.backup?.keepBackups || defaultSettings.backup.keepBackups
        }
      });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error("Erro ao salvar configurações");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Aplicativo</CardTitle>
        <CardDescription>
          Gerencie as configurações gerais do seu aplicativo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div>
              <h3 className="text-xl font-medium mb-4">Tema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="theme.mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o modo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="theme.primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="theme.accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de Destaque</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Display</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="display.itemsPerPage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Itens por Página</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="display.dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato da Data</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="display.timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato da Hora</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="24h">24h</SelectItem>
                          <SelectItem value="12h">12h</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="display.language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linguagem</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Segurança</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="security.requirePasswordChange"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          Exigir troca de senha
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Exigir que os usuários troquem de senha periodicamente.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="security.passwordExpirationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias para expiração da senha</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="security.sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo limite da sessão (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="security.useEncryption"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          Usar criptografia
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Criptografar dados sensíveis para maior segurança.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-4">Backup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="backup.autoBackup"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          Backup Automático
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Realizar backups automaticamente.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backup.backupFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência de Backup</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="backup.keepBackups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manter Backups por (dias)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit">Salvar Configurações</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AppSettings;
