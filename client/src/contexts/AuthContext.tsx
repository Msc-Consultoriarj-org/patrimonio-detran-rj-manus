import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

// Tipo do usuário
interface User {
  id: number;
  username: string | null;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  hasCompletedOnboarding?: boolean;
}

// Tipo do contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Chave do localStorage
const AUTH_STORAGE_KEY = "patrimonio_dtic_user";

// Criar contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const meQuery = trpc.auth.me.useQuery();

  // Carregar usuário do localStorage ao iniciar ou da API após OAuth
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar usuário do localStorage:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    // Se não tem no localStorage, tentar carregar da API (após OAuth)
    if (meQuery.data) {
      const userData: User = {
        id: meQuery.data.id,
        username: meQuery.data.username,
        name: meQuery.data.name,
        email: meQuery.data.email,
        role: meQuery.data.role,
        hasCompletedOnboarding: !!meQuery.data.hasCompletedOnboarding,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    }

    setLoading(false);
  }, [meQuery.data]);

  // Função de login - salva no localStorage e atualiza estado
  const login = useCallback((userData: User) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Erro ao salvar usuário no localStorage:", error);
    }
  }, []);

  // Função de logout - limpa localStorage e estado
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Erro ao limpar localStorage:", error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
