import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function OAuthCallback() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const meQuery = trpc.auth.me.useQuery();

  useEffect(() => {
    // Aguardar dados do usuário
    if (meQuery.isLoading) {
      console.log("[OAuthCallback] Carregando dados do usuário...");
      return;
    }

    if (meQuery.error) {
      console.error("[OAuthCallback] Erro ao carregar usuário:", meQuery.error);
      toast.error("Erro ao autenticar. Tente novamente.");
      setTimeout(() => setLocation("/login"), 2000);
      return;
    }

    if (meQuery.data) {
      console.log("[OAuthCallback] Usuário autenticado:", meQuery.data);
      
      // Salvar usuário no localStorage via AuthContext
      login({
        id: meQuery.data.id,
        username: meQuery.data.username,
        name: meQuery.data.name,
        email: meQuery.data.email,
        role: meQuery.data.role,
        hasCompletedOnboarding: !!meQuery.data.hasCompletedOnboarding,
      });

      toast.success(`Bem-vindo, ${meQuery.data.name || meQuery.data.username}!`);
      
      // Redirecionar para dashboard após 500ms
      setTimeout(() => {
        setLocation("/");
      }, 500);
    }
  }, [meQuery.isLoading, meQuery.error, meQuery.data, login, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066CC] via-[#0088AA] to-[#00AA44] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0066CC]/10">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
          </div>
          <CardTitle className="text-2xl">Finalizando autenticação...</CardTitle>
          <CardDescription>
            Aguarde enquanto configuramos sua sessão
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Você será redirecionado automaticamente.</p>
        </CardContent>
      </Card>
    </div>
  );
}
