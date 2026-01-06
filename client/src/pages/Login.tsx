import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [detranLogin, setDetranLogin] = useState("");
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Se já está autenticado, redireciona para home
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!detranLogin.trim()) {
      toast.error("Por favor, digite seu login do DETRAN");
      return;
    }

    // Validar formato do login (nome.sobrenome)
    const loginPattern = /^[a-z]+\.[a-z]+$/i;
    if (!loginPattern.test(detranLogin.trim())) {
      toast.error("Formato inválido. Use: nome.sobrenome (ex: moises.costa)");
      return;
    }

    // Salvar login DETRAN em cookie temporariamente (expira em 10 minutos)
    const detranLoginValue = detranLogin.trim().toLowerCase();
    document.cookie = `detran_login_pending=${detranLoginValue}; path=/; max-age=600; SameSite=Lax`;
    
    // Redirecionar para OAuth Google do Manus
    const oauthUrl = getLoginUrl();
    window.location.href = oauthUrl;
  };

  // Mostra loading enquanto verifica autenticação inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066CC] via-[#0088AA] to-[#00AA44]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066CC] via-[#0088AA] to-[#00AA44] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <img src="/LogoDetran.png" alt="Detran-RJ" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00AA44] bg-clip-text text-transparent">
            Sistema Patrimônio DTIC
          </CardTitle>
          <CardDescription className="text-base">
            Detran-RJ - Departamento de Tecnologia da Informação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="detranLogin" className="text-base font-medium">
                Login DETRAN
              </Label>
              <Input
                id="detranLogin"
                type="text"
                placeholder="nome.sobrenome (ex: moises.costa)"
                value={detranLogin}
                onChange={(e) => setDetranLogin(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite seu login do DETRAN no formato: nome.sobrenome
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0066CC] to-[#00AA44] hover:opacity-90 transition-opacity"
            >
              Continuar com Google
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Login seguro via Google OAuth
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
