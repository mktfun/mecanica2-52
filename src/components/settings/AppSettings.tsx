
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload, Laptop, Moon, Sun } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { AppSettings as AppSettingsType, ThemeSettings, DisplaySettings, SecuritySettings } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';

// Esquema de validação para tema
const themeSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']),
  primaryColor: z.string().min(4),
  accentColor: z.string().min(4)
});

// Esquema de validação para exibição
const displaySchema = z.object({
  itemsPerPage: z.number().min(5).max(100),
  dateFormat: z.string().min(1),
  timeFormat: z.enum(['12h', '24h']),
  language: z.string().min(2)
});

// Esquema de validação para segurança
const securitySchema = z.object({
  requirePasswordChange: z.boolean(),
  passwordExpirationDays: z.number().min(0),
  sessionTimeout: z.number().min(1),
  useEncryption: z.boolean()
});

// Esquema completo de configurações do aplicativo
const appSettingsSchema = z.object({
  theme: themeSchema,
  display: displaySchema,
  security: securitySchema
});

const AppSettings = () => {
  const { settings, saveSection, loading, exportSettings, importSettings, backupSettings, restoreFromBackup } = useSettings('app');
  // Explicitly cast settings to AppSettingsType
  const appSettings = settings as AppSettingsType;
  const [file, setFile] = useState<File | null>(null);
  const [backupData, setBackupData] = useState<string | null>(null);
  
  // Configurações padrão
  const defaultAppSettings: AppSettingsType = {
    theme: {
      mode: 'light',
      primaryColor: '#0050b3',
      accentColor: '#1890ff'
    },
    display: {
      itemsPerPage: 10,
      dateFormat: 'dd/MM/yyyy',
      timeFormat: '24h',
      language: 'pt-BR'
    },
    security: {
      requirePasswordChange: false,
      passwordExpirationDays: 90,
      sessionTimeout: 30,
      useEncryption: true
    }
  };

  // Form para configurações do aplicativo
  const form = useForm<z.infer<typeof appSettingsSchema>>({
    resolver: zodResolver(appSettingsSchema),
    defaultValues: {
      theme: appSettings?.theme || defaultAppSettings.theme,
      display: {
        ...defaultAppSettings.display,
        ...appSettings?.display,
        timeFormat: (appSettings?.display?.timeFormat as '12h' | '24h') || '24h'
      },
      security: appSettings?.security || defaultAppSettings.security
    }
  });

  // Handler para submissão do formulário
  const onSubmit = (data: z.infer<typeof appSettingsSchema>) => {
    const updatedSettings: AppSettingsType = {
      theme: {
        mode: data.theme.mode,
        primaryColor: data.theme.primaryColor,
        accentColor: data.theme.accentColor
      },
      display: {
        itemsPerPage: data.display.itemsPerPage,
        dateFormat: data.display.dateFormat,
        timeFormat: data.display.timeFormat,
        language: data.display.language
      },
      security: {
        requirePasswordChange: data.security.requirePasswordChange,
        passwordExpirationDays: data.security.passwordExpirationDays,
        sessionTimeout: data.security.sessionTimeout,
        useEncryption: data.security.useEncryption
      }
    };
    
    const success = saveSection('app', updatedSettings);
    
    if (success) {
      toast.success('Configurações do aplicativo salvas com sucesso');
    }
  };

  // Handler para exportação de dados
  const handleExport = () => {
    try {
      const data = exportSettings();
      
      if (!data) {
        toast.error('Erro ao exportar configurações');
        return;
      }
      
      // Criar blob e link para download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mecanicapro_config_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Configurações exportadas com sucesso');
    } catch (error) {
      console.error('Erro ao exportar configurações:', error);
      toast.error('Erro ao exportar configurações');
    }
  };

  // Handler para seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handler para importação de arquivo
  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }
    
    try {
      // Ler o conteúdo do arquivo
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        try {
          // Verificar se é um JSON válido
          JSON.parse(content);
          
          // Importar configurações
          const success = importSettings(content);
          
          if (success) {
            setFile(null);
            
            // Atualizar formulário com novas configurações
            const settings = JSON.parse(content);
            if (settings && settings.app) {
              form.reset(settings.app);
            }
            
            toast.success('Configurações importadas com sucesso');
          } else {
            toast.error('Erro ao importar configurações');
          }
        } catch (jsonError) {
          toast.error('O arquivo não contém um JSON válido');
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      toast.error('Erro ao importar configurações');
    }
  };

  // Criar backup dos dados
  const handleCreateBackup = () => {
    const backup = backupSettings();
    
    if (backup) {
      setBackupData(backup);
      
      // Criar blob e link para download
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mecanicapro_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Backup criado com sucesso');
    }
  };

  // Restaurar backup
  const handleRestoreBackup = async () => {
    if (!file) {
      toast.error('Selecione um arquivo de backup');
      return;
    }
    
    try {
      // Ler o conteúdo do arquivo
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        try {
          // Verificar se é um backup válido
          const data = JSON.parse(content);
          
          if (!data.timestamp || !data.settings) {
            toast.error('O arquivo não contém um backup válido');
            return;
          }
          
          // Restaurar backup
          const success = restoreFromBackup(content);
          
          if (success) {
            setFile(null);
            
            // Atualizar formulário com configurações restauradas
            if (data.settings && data.settings.app) {
              form.reset(data.settings.app);
            }
            
            toast.success('Backup restaurado com sucesso');
          } else {
            toast.error('Erro ao restaurar backup');
          }
        } catch (jsonError) {
          toast.error('O arquivo não contém um backup válido');
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configurações do Aplicativo</h2>
        <p className="text-sm text-gray-500">
          Personalize a aparência e o comportamento do sistema
        </p>
      </div>
      
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize o tema e as cores do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="theme.mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema</FormLabel>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`p-4 rounded-lg border flex flex-col items-center cursor-pointer ${field.value === 'light' ? 'bg-primary/10 border-primary' : ''}`}
                        onClick={() => form.setValue('theme.mode', 'light')}
                      >
                        <Sun className="h-6 w-6 mb-2" />
                        <span>Claro</span>
                      </div>
                      
                      <div 
                        className={`p-4 rounded-lg border flex flex-col items-center cursor-pointer ${field.value === 'dark' ? 'bg-primary/10 border-primary' : ''}`}
                        onClick={() => form.setValue('theme.mode', 'dark')}
                      >
                        <Moon className="h-6 w-6 mb-2" />
                        <span>Escuro</span>
                      </div>
                      
                      <div 
                        className={`p-4 rounded-lg border flex flex-col items-center cursor-pointer ${field.value === 'system' ? 'bg-primary/10 border-primary' : ''}`}
                        onClick={() => form.setValue('theme.mode', 'system')}
                      >
                        <Laptop className="h-6 w-6 mb-2" />
                        <span>Sistema</span>
                      </div>
                    </div>
                    <FormDescription>
                      O tema será aplicado em todo o sistema
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="theme.primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          className="w-10 h-10 rounded border cursor-pointer"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="theme.accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de Destaque</FormLabel>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          className="w-10 h-10 rounded border cursor-pointer"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Exibição</CardTitle>
              <CardDescription>
                Configure as preferências de exibição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="display.itemsPerPage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itens por página</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={5} 
                        max={100} 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Número de itens exibidos por página em listas e tabelas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="display.dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formato de Data</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um formato de data" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dd/MM/yyyy">DD/MM/AAAA (31/12/2023)</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/DD/AAAA (12/31/2023)</SelectItem>
                        <SelectItem value="yyyy-MM-dd">AAAA-MM-DD (2023-12-31)</SelectItem>
                        <SelectItem value="dd-MM-yyyy">DD-MM-AAAA (31-12-2023)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="display.timeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formato de Hora</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um formato de hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="12h">12h (1:30 PM)</SelectItem>
                        <SelectItem value="24h">24h (13:30)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="display.language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configure as opções de segurança do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="security.requirePasswordChange"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Exigir troca de senha</FormLabel>
                      <FormDescription>
                        Novos usuários serão solicitados a trocar a senha no primeiro login
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
              
              <FormField
                control={form.control}
                name="security.passwordExpirationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiração de Senha (dias)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Número de dias até que a senha expire (0 = sem expiração)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="security.sessionTimeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de Sessão (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Tempo de inatividade até que a sessão expire
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="security.useEncryption"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usar Criptografia</FormLabel>
                      <FormDescription>
                        Criptografar dados sensíveis no armazenamento local
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
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={loading}>
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      <Card>
        <CardHeader>
          <CardTitle>Backup e Exportação</CardTitle>
          <CardDescription>
            Faça backup ou exporte suas configurações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Exportar Configurações</h3>
              <p className="text-sm text-gray-500">
                Exporte todas as configurações do sistema para um arquivo JSON
              </p>
              <Button onClick={handleExport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar Configurações
              </Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Importar Configurações</h3>
              <p className="text-sm text-gray-500">
                Importe configurações de um arquivo JSON exportado anteriormente
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button onClick={handleImport} disabled={!file}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Criar Backup Completo</h3>
              <p className="text-sm text-gray-500">
                Faça backup de todas as configurações e dados do sistema
              </p>
              <Button onClick={handleCreateBackup} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Criar Backup
              </Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Restaurar Backup</h3>
              <p className="text-sm text-gray-500">
                Restaure todas as configurações e dados do sistema a partir de um backup
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button onClick={handleRestoreBackup} disabled={!file}>
                  <Upload className="mr-2 h-4 w-4" />
                  Restaurar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;
