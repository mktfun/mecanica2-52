
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, Plus, Loader2 } from "lucide-react";
import { useOrganizationContext } from '@/context/OrganizationProvider';

export const OrganizationSelector = () => {
  const {
    isLoading,
    organizations,
    selectedOrganizationId,
    selectOrganization,
    createOrganization
  } = useOrganizationContext();

  const [newOrgName, setNewOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Manipular a criação de nova organização
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    setIsCreating(true);
    try {
      await createOrganization(newOrgName);
      setNewOrgName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar organização:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Manipular seleção de organização
  const handleSelectOrganization = (orgId: string) => {
    selectOrganization(orgId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Carregando organizações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Selecione uma Organização
          </CardTitle>
          <CardDescription>
            Escolha uma organização para continuar ou crie uma nova.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Você ainda não pertence a nenhuma organização.</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Organização
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateOrganization}>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Organização</DialogTitle>
                      <DialogDescription>
                        Insira o nome da sua oficina ou empresa.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="org-name">Nome da Organização</Label>
                      <Input
                        id="org-name"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="Oficina Exemplo Ltda."
                        className="mt-1"
                        disabled={isCreating}
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={isCreating || !newOrgName.trim()}
                      >
                        {isCreating && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                        {isCreating ? "Criando..." : "Criar Organização"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <RadioGroup 
              value={selectedOrganizationId || undefined}
              onValueChange={handleSelectOrganization}
              className="space-y-2"
            >
              {organizations.map((org) => (
                <div 
                  key={org.id}
                  className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted"
                  onClick={() => handleSelectOrganization(org.id)}
                >
                  <RadioGroupItem value={org.id} id={`org-${org.id}`} />
                  <Label htmlFor={`org-${org.id}`} className="flex-1 cursor-pointer">
                    {org.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>

        {organizations.length > 0 && (
          <CardFooter className="flex justify-between">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateOrganization}>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Organização</DialogTitle>
                    <DialogDescription>
                      Insira o nome da sua oficina ou empresa.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="org-name">Nome da Organização</Label>
                    <Input
                      id="org-name"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Oficina Exemplo Ltda."
                      className="mt-1"
                      disabled={isCreating}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={isCreating || !newOrgName.trim()}
                    >
                      {isCreating && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                      {isCreating ? "Criando..." : "Criar Organização"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button 
              disabled={!selectedOrganizationId}
              onClick={() => {}} // Aqui você pode navegar para a próxima página ou fechar o seletor
            >
              Continuar
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
