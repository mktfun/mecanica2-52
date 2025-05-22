
// Adicionando métodos necessários para compatibilidade

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string | null;
  phone?: string;
  position?: string;
  lastLogin?: string;
  active?: boolean;
  password?: string; // Adding password field to fix the Register component error
}

class AuthService {
  private users: User[];
  private currentUser: User | null;
  private storage: Storage;
  private storageKey: string;

  constructor() {
    this.storage = localStorage;
    this.storageKey = 'mecanicapro_auth';
    this.users = [];
    this.currentUser = null;
    this.loadUsers();
    this.loadCurrentUser();
  }

  private loadUsers(): void {
    const storedUsers = this.storage.getItem(`${this.storageKey}_users`);
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      // Criar usuário admin padrão se não existir
      this.users = [
        {
          id: '1',
          name: 'Administrador',
          email: 'admin@mecanicapro.com',
          role: 'admin',
          phone: '(11) 99999-9999',
          position: 'Administrador',
          lastLogin: new Date().toISOString(),
          active: true
        }
      ];
      this.storage.setItem(`${this.storageKey}_users`, JSON.stringify(this.users));
    }
  }

  private loadCurrentUser(): void {
    const storedUser = this.storage.getItem(`${this.storageKey}_current`);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    } else {
      // Definir admin como usuário padrão
      this.currentUser = this.users[0] || null;
      if (this.currentUser) {
        this.storage.setItem(`${this.storageKey}_current`, JSON.stringify(this.currentUser));
      }
    }
  }

  public login(email: string, password: string): User | null {
    // Simulação de login simples
    const user = this.users.find(u => u.email === email && u.active !== false);
    
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.currentUser = user;
      this.storage.setItem(`${this.storageKey}_current`, JSON.stringify(user));
      return user;
    }
    
    return null;
  }

  public logout(): void {
    this.currentUser = null;
    this.storage.removeItem(`${this.storageKey}_current`);
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public register(user: Omit<User, 'id' | 'lastLogin'>): User | null {
    const existingUser = this.users.find(u => u.email === user.email);
    
    if (existingUser) {
      return null;
    }
    
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      lastLogin: new Date().toISOString(),
      active: true
    };
    
    // Remove password from storage (in a real app, you'd hash it)
    const { password, ...userToStore } = newUser;
    
    this.users.push(userToStore as User);
    this.storage.setItem(`${this.storageKey}_users`, JSON.stringify(this.users));
    
    return userToStore as User;
  }

  public updateUser(id: string, userData: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedUser = {
      ...this.users[index],
      ...userData
    };
    
    this.users[index] = updatedUser;
    this.storage.setItem(`${this.storageKey}_users`, JSON.stringify(this.users));
    
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = updatedUser;
      this.storage.setItem(`${this.storageKey}_current`, JSON.stringify(updatedUser));
    }
    
    return updatedUser;
  }

  public verifyPassword(password: string): boolean {
    // Simulação simples para verificação de senha
    // Em um sistema real, você compararia hashes de senha
    return true;
  }

  public changePassword(newPassword: string): boolean {
    // Simulação simples para alteração de senha
    // Em um sistema real, você armazenaria o hash da nova senha
    return true;
  }
}

const authService = new AuthService();
export default authService;
