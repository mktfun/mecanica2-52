
import { useState, useEffect } from 'react';
import { Settings } from '@/types/settings';
import { settingsService } from '@/services/settingsService';
import { useEventSubscription } from '@/hooks/useEventSubscription';
import { eventBus, EVENTS } from '@/core/events/EventBus';
import { toast } from '@/components/ui/sonner';

export const useSettings = <K extends keyof Settings>(section?: K) => {
  const [settings, setSettings] = useState<Settings>(settingsService.getSettings());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações iniciais
  useEffect(() => {
    loadSettings();
  }, []);

  // Inscrever-se para atualizações de configurações
  useEventSubscription(EVENTS.STORAGE_UPDATED, (event) => {
    if (event.entity === 'mecanicapro_settings') {
      loadSettings();
    }
  });

  // Carregar configurações
  const loadSettings = () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = settingsService.getSettings();
      setSettings(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações. Tente novamente.');
      setLoading(false);
    }
  };

  // Salvar uma seção específica
  const saveSection = <T extends keyof Settings>(
    sectionName: T,
    data: Partial<Settings[T]>
  ): boolean => {
    try {
      setLoading(true);
      setError(null);
      
      const success = settingsService.saveSection(sectionName, data);
      
      if (success) {
        toast.success('Configurações salvas com sucesso');
      } else {
        toast.error('Erro ao salvar configurações');
        setError('Erro ao salvar configurações. Tente novamente.');
      }
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error(`Erro ao salvar configurações de ${String(sectionName)}:`, err);
      toast.error('Erro ao salvar configurações');
      setError('Erro ao salvar configurações. Tente novamente.');
      setLoading(false);
      return false;
    }
  };

  // Exportar configurações
  const exportSettings = (): string => {
    return settingsService.exportSettings();
  };

  // Importar configurações
  const importSettings = (jsonData: string): boolean => {
    try {
      const success = settingsService.importSettings(jsonData);
      
      if (success) {
        loadSettings();
        toast.success('Configurações importadas com sucesso');
      } else {
        toast.error('Erro ao importar configurações');
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao importar configurações:', err);
      toast.error('Erro ao importar configurações');
      return false;
    }
  };

  // Fazer backup das configurações
  const backupSettings = (): string => {
    const backup = settingsService.backupSettings();
    
    if (backup) {
      toast.success('Backup das configurações criado com sucesso');
    } else {
      toast.error('Erro ao criar backup das configurações');
    }
    
    return backup;
  };

  // Restaurar backup
  const restoreFromBackup = (backupData: string): boolean => {
    try {
      const success = settingsService.restoreFromBackup(backupData);
      
      if (success) {
        loadSettings();
        toast.success('Configurações restauradas com sucesso');
      } else {
        toast.error('Erro ao restaurar configurações');
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao restaurar configurações:', err);
      toast.error('Erro ao restaurar configurações');
      return false;
    }
  };

  return {
    settings: section ? settings[section] : settings,
    allSettings: settings,
    loading,
    error,
    saveSection,
    exportSettings,
    importSettings,
    backupSettings,
    restoreFromBackup
  };
};

export default useSettings;
