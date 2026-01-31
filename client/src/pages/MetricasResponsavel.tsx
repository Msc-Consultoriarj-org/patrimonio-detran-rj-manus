import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Users, 
  BarChart3, 
  PieChart, 
  Table,
  Download,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function MetricasResponsavel() {
  const [activeTab, setActiveTab] = useState("responsavel");

  // Queries
  const { data: metricasResponsavel, isLoading: loadingResponsavel, refetch: refetchResponsavel } = 
    trpc.metricas.porResponsavel.useQuery();
  const { data: metricasCategoria, isLoading: loadingCategoria } = 
    trpc.metricas.porCategoria.useQuery();
  const { data: metricasLocalizacao, isLoading: loadingLocalizacao } = 
    trpc.metricas.porLocalizacao.useQuery();

  const isLoading = loadingResponsavel || loadingCategoria || loadingLocalizacao;

  // Cores do Detran-RJ
  const coresDetran = [
    '#005A92', // Azul
    '#00A651', // Verde
    '#0088CC', // Azul claro
    '#33B864', // Verde claro
    '#003D66', // Azul escuro
    '#007A3D', // Verde escuro
    '#4DA6D9', // Azul médio
    '#66C285', // Verde médio
    '#A0A0A0', // Cinza
    '#6B7280', // Cinza escuro
  ];

  // Dados para gráfico de barras por responsável
  const dadosBarras = {
    labels: metricasResponsavel?.porResponsavel.slice(0, 10).map(r => 
      r.responsavel.length > 15 ? r.responsavel.substring(0, 15) + '...' : r.responsavel
    ) || [],
    datasets: [
      {
        label: 'Patrimônios',
        data: metricasResponsavel?.porResponsavel.slice(0, 10).map(r => r.total) || [],
        backgroundColor: coresDetran,
        borderColor: coresDetran.map(c => c),
        borderWidth: 1,
      },
    ],
  };

  // Dados para gráfico de pizza por categoria
  const dadosPizzaCategoria = {
    labels: metricasCategoria?.map(c => c.categoria) || [],
    datasets: [
      {
        data: metricasCategoria?.map(c => c.total) || [],
        backgroundColor: coresDetran,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Dados para gráfico de pizza por localização (top 8)
  const dadosPizzaLocalizacao = {
    labels: metricasLocalizacao?.slice(0, 8).map(l => 
      l.localizacao.length > 20 ? l.localizacao.substring(0, 20) + '...' : l.localizacao
    ) || [],
    datasets: [
      {
        data: metricasLocalizacao?.slice(0, 8).map(l => l.total) || [],
        backgroundColor: coresDetran,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Opções dos gráficos
  const opcoesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 10 Responsáveis por Quantidade de Patrimônios',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const opcoesPizza = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  // Exportar para CSV
  const handleExportCSV = () => {
    if (!metricasResponsavel) return;

    const headers = ['Responsável', 'Total de Patrimônios'];
    const rows = metricasResponsavel.porResponsavel.map(r => [r.responsavel, r.total]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `metricas-responsavel-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success("Arquivo CSV exportado com sucesso!");
  };

  // Total de patrimônios
  const totalPatrimonios = metricasResponsavel?.porResponsavel.reduce((acc, r) => acc + r.total, 0) || 0;
  const totalResponsaveis = metricasResponsavel?.porResponsavel.length || 0;
  const mediaPatrimonios = totalResponsaveis > 0 ? Math.round(totalPatrimonios / totalResponsaveis) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#005A92] to-[#00A651] bg-clip-text text-transparent">
              Métricas por Responsável
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize a distribuição de patrimônios por colaborador
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchResponsavel()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button 
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-[#005A92] to-[#00A651]"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total de Responsáveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalResponsaveis}</div>
              <p className="text-sm text-muted-foreground mt-1">
                colaboradores com patrimônios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Total de Patrimônios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalPatrimonios}</div>
              <p className="text-sm text-muted-foreground mt-1">
                itens cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Média por Responsável
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{mediaPatrimonios}</div>
              <p className="text-sm text-muted-foreground mt-1">
                patrimônios por colaborador
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="responsavel" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Por Responsável
            </TabsTrigger>
            <TabsTrigger value="categoria" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Por Categoria
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Por Localização
            </TabsTrigger>
            <TabsTrigger value="tabela" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Tabela Detalhada
            </TabsTrigger>
          </TabsList>

          {/* Aba Por Responsável */}
          <TabsContent value="responsavel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Distribuição por Responsável
                </CardTitle>
                <CardDescription>
                  Quantidade de patrimônios atribuídos a cada colaborador
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <Bar data={dadosBarras} options={opcoesBarras} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Por Categoria */}
          <TabsContent value="categoria">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Distribuição por Categoria
                </CardTitle>
                <CardDescription>
                  Proporção de patrimônios por tipo de equipamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-full max-w-[500px]">
                      <Pie data={dadosPizzaCategoria} options={opcoesPizza} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Por Localização */}
          <TabsContent value="localizacao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Distribuição por Localização
                </CardTitle>
                <CardDescription>
                  Proporção de patrimônios por local (top 8)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-full max-w-[500px]">
                      <Pie data={dadosPizzaLocalizacao} options={opcoesPizza} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Tabela Detalhada */}
          <TabsContent value="tabela">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5 text-primary" />
                  Tabela Detalhada por Responsável
                </CardTitle>
                <CardDescription>
                  Lista completa de patrimônios por colaborador
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">#</th>
                          <th className="text-left p-3 font-medium">Responsável</th>
                          <th className="text-right p-3 font-medium">Quantidade</th>
                          <th className="text-right p-3 font-medium">% do Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metricasResponsavel?.porResponsavel.map((r, index) => (
                          <tr key={index} className="border-b hover:bg-muted/30">
                            <td className="p-3 text-muted-foreground">{index + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: coresDetran[index % coresDetran.length] }}
                                />
                                {r.responsavel}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <Badge variant="outline">{r.total}</Badge>
                            </td>
                            <td className="p-3 text-right text-muted-foreground">
                              {((r.total / totalPatrimonios) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/50 font-medium">
                          <td className="p-3" colSpan={2}>Total</td>
                          <td className="p-3 text-right">{totalPatrimonios}</td>
                          <td className="p-3 text-right">100%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
