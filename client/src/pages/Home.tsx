import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, MapPin, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: patrimonios } = trpc.patrimonio.list.useQuery();

  const totalPatrimonios = patrimonios?.length || 0;
  const totalValor = patrimonios?.reduce((acc, p) => acc + Number(p.valor), 0) || 0;
  const categorias = new Set(patrimonios?.map(p => p.categoria)).size;
  const localizacoes = new Set(patrimonios?.map(p => p.localizacao)).size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Boas-vindas */}
        <div className="bg-gradient-to-r from-[var(--detran-blue)] to-[var(--detran-green)] text-white rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {user?.name || "Usuário"}!
          </h1>
          <p className="text-white/90 text-lg">
            Sistema de Gerenciamento de Patrimônio de Informática - Detran-RJ
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Patrimônios
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatrimonios}</div>
              <p className="text-xs text-muted-foreground">
                Itens cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalValor)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total dos patrimônios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Categorias
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categorias}</div>
              <p className="text-xs text-muted-foreground">
                Tipos diferentes de equipamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Localizações
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localizacoes}</div>
              <p className="text-xs text-muted-foreground">
                Locais com patrimônios
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Patrimônios</CardTitle>
              <CardDescription>
                Cadastre, edite e gerencie os patrimônios de informática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/patrimonios")}
                className="w-full"
              >
                <Package className="mr-2 h-4 w-4" />
                Acessar Patrimônios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
              <CardDescription>
                Sistema desenvolvido para o Departamento de Tecnologia da Informação e Comunicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Versão:</strong> 1.0.0
              </p>
              <p>
                <strong>Departamento:</strong> DTIC - Detran-RJ
              </p>
              <p>
                <strong>Função:</strong> Gerenciamento de Patrimônio de Informática
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patrimônios Recentes */}
        {patrimonios && patrimonios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Patrimônios Recentes</CardTitle>
              <CardDescription>
                Últimos itens cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patrimonios.slice(0, 5).map((patrimonio) => (
                  <div
                    key={patrimonio.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{patrimonio.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {patrimonio.categoria} • {patrimonio.localizacao}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(patrimonio.valor))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(patrimonio.dataAquisicao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {patrimonios.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setLocation("/patrimonios")}
                >
                  Ver Todos os Patrimônios
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
