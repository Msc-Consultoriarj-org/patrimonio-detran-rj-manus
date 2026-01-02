import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery();

  // Se já está autenticado, redireciona para home
  if (!meQuery.isLoading && meQuery.data) {
    setLocation("/");
    return null;
  }

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Login realizado com sucesso!");
      // Invalida a query auth.me para forçar recarregamento do usuário
      await utils.auth.me.invalidate();
      // Refetch para garantir que o usuário seja carregado antes de redirecionar
      await utils.auth.me.refetch();
      // Aguarda 500ms para garantir que o estado foi completamente atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      // Redireciona para a home após login bem-sucedido
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Por favor, digite seu nome de usuário");
      return;
    }
    loginMutation.mutate({ username: username.trim() });
  };

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
              <Label htmlFor="username" className="text-base font-medium">
                Nome de Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-base"
                autoFocus
                disabled={loginMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0066CC] to-[#00AA44] hover:opacity-90 transition-opacity"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Usuários disponíveis: moises, pedro, phelipe</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
