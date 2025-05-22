
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { usersStore } from '../../services/localStorageService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se já existem usuários no sistema
    const users = usersStore.getAll();
    setShowForm(users.length === 0);
    
    if (users.length > 0) {
      toast.error('Já existe um usuário administrador registrado.');
      navigate('/login');
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Configuração de permissões baseadas no papel
      let permissions: string[] = [];
      
      if (role === 'admin') {
        permissions = ['all'];
      } else if (role === 'manager') {
        permissions = ['read:all', 'write:all', 'edit:all', 'delete:some'];
      } else if (role === 'attendant') {
        permissions = ['read:clients', 'write:clients', 'read:appointments', 'write:appointments'];
      } else if (role === 'mechanic') {
        permissions = ['read:orders', 'edit:orders'];
      } else if (role === 'marketing') {
        permissions = ['read:leads', 'write:leads', 'read:campaigns', 'write:campaigns'];
      }
      
      await authService.register({
        name,
        email,
        password,
        role: role as any,
        permissions,
        active: true
      });
      
      toast.success('Usuário registrado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      toast.error(`Erro ao registrar: ${error.message}`);
      console.error('Erro de registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-800">MecânicaPro</h1>
          <p className="mt-2 text-gray-600">Registrar Primeiro Administrador</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha segura"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Senha
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Função
            </label>
            <Select
              value={role}
              onValueChange={setRole}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              O primeiro usuário deve ser um administrador.
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Registrando...' : 'Registrar'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            Já tem uma conta?{' '}
            <Button variant="link" onClick={() => navigate('/login')} className="p-0">
              Faça login
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
