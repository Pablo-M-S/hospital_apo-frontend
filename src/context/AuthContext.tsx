import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthUser, LoginResponse } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function lerUsuarioSalvo(): AuthUser | null {
  const bruto = localStorage.getItem('user');
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(lerUsuarioSalvo);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/api/auth/login', { email, senha });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }
  return context;
}
