import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [detranLogin, setDetranLogin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Limpar localStorage ao carregar a página de login
  useEffect(() => {
    localStorage.removeItem("auth_user");
    console.log("[Login] localStorage limpo");
  }, []);

  // Verificar se está retornando do OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback = urlParams.has("code") || urlParams.has("state");
    
    if (isOAuthCallback) {
      setIsLoading(true);
      console.log("[Login] Detectado retorno do OAuth, aguardando autenticação...");
      
      // Timeout de 30 segundos
      const timeout = setTimeout(() => {
        setIsLoading(false);
        toast.error("Tempo esgotado. Tente fazer login novamente.");
        window.location.href = "/login";
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, []);

  const handleLogin = () => {
    if (!detranLogin.trim()) {
      toast.error("Digite seu login DETRAN");
      return;
    }

    // Validar formato do login (nome.sobrenome)
    if (!detranLogin.includes(".")) {
      toast.error("Login deve estar no formato nome.sobrenome");
      return;
    }

    // Salvar detranLogin em cookie para o backend usar
    document.cookie = `detran_login_pending=${detranLogin}; path=/; max-age=300; SameSite=Lax`;
    
    console.log("[Login] Redirecionando para OAuth com login:", detranLogin);
    setIsLoading(true);
    
    // Redirecionar para OAuth
    window.location.href = getLoginUrl();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066CC] via-[#0088AA] to-[#00AA44] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0066CC]/10">
              <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
            </div>
            <CardTitle className="text-2xl">Autenticando...</CardTitle>
            <CardDescription>
              Aguarde enquanto validamos suas credenciais
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Este processo pode levar alguns segundos.</p>
            <p className="mt-2">Se demorar muito, a página será recarregada automaticamente.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066CC] via-[#0088AA] to-[#00AA44] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-[#0066CC]"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Sistema Patrimônio DTIC</CardTitle>
          <CardDescription>
            Detran-RJ - Departamento de Tecnologia de Informação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="detranLogin" className="text-base font-medium">
                Login DETRAN
              </Label>
              <Input
                id="detranLogin"
                type="text"
                placeholder="nome.sobrenome"
                value={detranLogin}
                onChange={(e) => setDetranLogin(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="h-12 text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Digite seu login corporativo no formato nome.sobrenome
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base bg-[#0066CC] hover:bg-[#0055AA]"
              disabled={!detranLogin.trim()}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ao continuar, você será redirecionado para fazer login com sua conta Google corporativa
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
