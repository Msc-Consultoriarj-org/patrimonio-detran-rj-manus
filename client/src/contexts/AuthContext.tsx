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
  logout: () => void;
  refetch: () => void;
}

// Chave do localStorage
const AUTH_STORAGE_KEY = "patrimonio_dtic_user";

// Criar contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Query para buscar usuário autenticado via cookie de sessão
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Efeito para sincronizar estado com a query
  useEffect(() => {
    if (meQuery.isLoading) {
      setLoading(true);
      return;
    }

    if (meQuery.data) {
      // Usuário autenticado via sessão
      const userData: User = {
        id: meQuery.data.id,
        username: meQuery.data.username,
        name: meQuery.data.name,
        email: meQuery.data.email,
        role: meQuery.data.role,
        hasCompletedOnboarding: !!meQuery.data.hasCompletedOnboarding,
      };
      setUser(userData);
      // Salvar no localStorage como cache
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
      }
    } else if (meQuery.isError || !meQuery.data) {
      // Não autenticado - limpar estado
      setUser(null);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
        console.error("Erro ao limpar localStorage:", e);
      }
    }

    setLoading(false);
  }, [meQuery.data, meQuery.isLoading, meQuery.isError]);

  // Função de logout
  const logoutMutation = trpc.auth.logout.useMutation();
  
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error("Erro no logout:", e);
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = "/login";
  }, [logoutMutation]);

  // Função para refetch manual
  const refetch = useCallback(() => {
    meQuery.refetch();
  }, [meQuery]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refetch,
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
