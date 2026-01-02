import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, TrendingUp, MapPin, Layers, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = {
  primary: "#0066CC",
  secondary: "#00AA44",
  tertiary: "#0088AA",
  quaternary: "#00CC88",
  quinary: "#0044AA",
  senary: "#00DD66",
};

const COLOR_ARRAY = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.tertiary,
  COLORS.quaternary,
  COLORS.quinary,
  COLORS.senary,
];

export default function Home() {
  const { user } = useAuth();
  const { data: patrimonios, isLoading: loadingPatrimonios } = trpc.patrimonio.list.useQuery();
  const { data: byCategoria, isLoading: loadingCategoria } = trpc.analytics.byCategoria.useQuery();
  const { data: byLocalizacao, isLoading: loadingLocalizacao } = trpc.analytics.byLocalizacao.useQuery();

  const totalPatrimonios = patrimonios?.length || 0;
  const valorTotal = patrimonios?.reduce((sum, p) => sum + Number(p.valor), 0) || 0;
  const categorias = new Set(patrimonios?.map(p => p.categoria)).size;
  const localizacoes = new Set(patrimonios?.map(p => p.localizacao)).size;

  // Preparar dados para gráficos
  const categoriaChartData = byCategoria?.map(item => ({
    name: item.categoria,
    value: Number(item.count),
    valor: Number(item.totalValor || 0),
  })) || [];

  const localizacaoChartData = byLocalizacao?.map(item => ({
    name: item.localizacao,
    value: Number(item.count),
    valor: Number(item.totalValor || 0),
  })) || [];

  const categoriaValorData = byCategoria?.map(item => ({
    name: item.categoria,
    valor: Number(item.totalValor || 0),
  })) || [];

  const localizacaoValorData = byLocalizacao?.map(item => ({
    name: item.localizacao,
    valor: Number(item.totalValor || 0),
  })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Quantidade: <span className="font-bold">{payload[0].value}</span>
          </p>
          {payload[0].payload.valor && (
            <p className="text-sm text-gray-600">
              Valor: <span className="font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(payload[0].payload.valor)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            Valor Total: <span className="font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(payload[0].value)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loadingPatrimonios || loadingCategoria || loadingLocalizacao) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0066CC] via-[#0088AA] to-[#00AA44] rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user?.name || user?.username}!</h1>
          <p className="text-white/90 text-lg">
            Sistema de Gerenciamento de Patrimônio de Informática - Detran-RJ
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Patrimônios</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatrimonios}</div>
              <p className="text-xs text-muted-foreground">Itens cadastrados no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(valorTotal)}
              </div>
              <p className="text-xs text-muted-foreground">Valor total dos patrimônios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categorias}</div>
              <p className="text-xs text-muted-foreground">Tipos diferentes de equipamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Localizações</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localizacoes}</div>
              <p className="text-xs text-muted-foreground">Locais com patrimônios</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Categoria */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Quantidade de patrimônios por tipo de equipamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriaChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoriaChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_ARRAY[index % COLOR_ARRAY.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valor por Categoria</CardTitle>
              <CardDescription>Valor total investido por tipo de equipamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoriaValorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="valor" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Localização */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Localização</CardTitle>
              <CardDescription>Quantidade de patrimônios por local</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={localizacaoChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {localizacaoChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_ARRAY[index % COLOR_ARRAY.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valor por Localização</CardTitle>
              <CardDescription>Valor total investido por local</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={localizacaoValorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="valor" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Patrimônios</CardTitle>
              <CardDescription>Cadastre, edite e gerencie os patrimônios de informática</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/patrimonios"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#0066CC] to-[#00AA44] text-white hover:opacity-90 h-10 px-4 py-2 w-full"
              >
                <Package className="mr-2 h-4 w-4" />
                Acessar Patrimônios
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
              <CardDescription>Sistema desenvolvido para o Departamento de Tecnologia da Informação e Comunicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm"><strong>Versão:</strong> 1.0.0</p>
              <p className="text-sm"><strong>Departamento:</strong> DTIC - Detran-RJ</p>
              <p className="text-sm"><strong>Função:</strong> Gerenciamento de Patrimônio de Informática</p>
            </CardContent>
          </Card>
        </div>

        {/* Patrimônios Recentes */}
        {patrimonios && patrimonios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Patrimônios Recentes</CardTitle>
              <CardDescription>Últimos itens cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patrimonios.slice(0, 5).map((patrimonio) => (
                  <div key={patrimonio.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{patrimonio.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {patrimonio.categoria} • {patrimonio.localizacao}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(patrimonio.valor))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
