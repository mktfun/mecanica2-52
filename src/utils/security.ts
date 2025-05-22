
// Função simples para hash de senha (em um app real, usar bcrypt ou similar)
export const hashPassword = async (password: string): Promise<string> => {
  // Esta é uma implementação simplificada. Em produção, use bcrypt ou similar
  // Apenas para demonstração, usamos um hash simples
  return `hashed_${password}_${Date.now()}`;
};

// Verifica se a senha corresponde ao hash
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  // Esta é uma implementação simplificada.
  // Verifica se o hash começa com "hashed_" e contém a senha original
  return hashedPassword.startsWith('hashed_') && hashedPassword.includes(password);
};
