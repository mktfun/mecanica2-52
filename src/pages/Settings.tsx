
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building, Sliders, Briefcase, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AccountSettings from '../components/settings/AccountSettings';
import UnitSettings from '../components/settings/UnitSettings';
import AppSettings from '../components/settings/AppSettings';
import BusinessSettings from '../components/settings/BusinessSettings';
import UserSettings from '../components/settings/UserSettings';

const Settings = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gerencie as configurações do sistema e personalize-o conforme suas necessidades.
        </p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Conta</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Unidades</span>
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Aplicativo</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Negócio</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>
          
          <TabsContent value="units">
            <UnitSettings />
          </TabsContent>
          
          <TabsContent value="app">
            <AppSettings />
          </TabsContent>
          
          <TabsContent value="business">
            <BusinessSettings />
          </TabsContent>
          
          <TabsContent value="users">
            <UserSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
