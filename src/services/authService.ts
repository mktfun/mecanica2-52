
import { usersStore } from './localStorageService';
import { hashPassword, comparePasswords } from '../utils/security';

// Tipos para o serviço de autenticação
export type UserRole = 'admin' | 'manager' | 'attendant' | 'mechanic' | 'marketing';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;

class AuthService {
  private currentUser: UserWithoutPassword | null = null;
  
  constructor() {
    this.checkSessionStorage();
  }
  
  private checkSessionStorage() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }
  
  // Registra um novo usuário
  async register(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<UserWithoutPassword> {
    try {
      // Verifica se o email já está em uso
      const existingUser = usersStore.query(user => user.email === userData.email);
      
      if (existingUser.length > 0) {
        throw new Error('Email já está em uso');
      }
      
      // Hash da senha antes de armazenar
      const hashedPassword = await hashPassword(userData.password);
      
      // Cria o novo usuário
      const newUser = {
        ...userData,
        password: hashedPassword,
        active: true
      };
      
      // Adiciona ao armazenamento
      const createdUser = usersStore.add(newUser);
      
      // Remove a senha antes de retornar
      const { password, ...userWithoutPassword } = createdUser;
      
      return userWithoutPassword as UserWithoutPassword;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }
  
  // Realiza login
  async login(email: string, password: string): Promise<UserWithoutPassword> {
    try {
      // Busca usuário pelo email
      const users = usersStore.query(user => user.email === email);
      
      if (users.length === 0) {
        throw new Error('Credenciais inválidas');
      }
      
      const user = users[0] as User;
      
      // Verifica se o usuário está ativo
      if (!user.active) {
        throw new Error('Usuário desativado');
      }
      
      // Verifica a senha
      const passwordMatch = await comparePasswords(password, user.password);
      
      if (!passwordMatch) {
        throw new Error('Credenciais inválidas');
      }
      
      // Armazena o usuário atual na sessão
      const { password: _, ...userWithoutPassword } = user;
      this.currentUser = userWithoutPassword;
      
      // Armazena na sessionStorage para persistir durante a sessão
      sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }
  
  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
  
  // Obtém o usuário atual
  getCurrentUser(): UserWithoutPassword | null {
    return this.currentUser;
  }
  
  // Verifica se o usuário tem determinada permissão
  hasPermission(permission: string): boolean {
    if (!this.isAuthenticated() || !this.currentUser) {
      return false;
    }
    
    // Administradores têm todas as permissões
    if (this.currentUser.role === 'admin') {
      return true;
    }
    
    // Verifica permissões específicas
    return !!this.currentUser.permissions && 
           this.currentUser.permissions.includes(permission);
  }
  
  // Realiza logout
  logout(): void {
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
  }
}

export default new AuthService();
