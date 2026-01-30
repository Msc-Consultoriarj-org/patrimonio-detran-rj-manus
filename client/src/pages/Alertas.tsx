import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  MapPin, 
  User, 
  Hash, 
  RefreshCw,
  CheckCircle,
  Clock,
  Edit
} from "lucide-react";
import { useLocation } from "wouter";

export default function Alertas() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("resumo");

  // Queries
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = trpc.alertas.summary.useQuery();
  const { data: semNumeroSerie, isLoading: loadingSemNumero, refetch: refetchSemNumero } = trpc.alertas.semNumeroSerie.useQuery();
  const { data: semResponsavel, isLoading: loadingSemResponsavel, refetch: refetchSemResponsavel } = trpc.alertas.semResponsavel.useQuery();
  const { data: semLocalizacao, isLoading: loadingSemLocalizacao, refetch: refetchSemLocalizacao } = trpc.alertas.semLocalizacao.useQuery();
  const { data: historicoRecente, isLoading: loadingHistorico, refetch: refetchHistorico } = trpc.historico.recent.useQuery({ limit: 20 });

  const refetchAll = () => {
    refetchSummary();
    refetchSemNumero();
    refetchSemResponsavel();
    refetchSemLocalizacao();
    refetchHistorico();
  };

  const totalAlertas = (summary?.semNumeroSerie || 0) + (summary?.semResponsavel || 0) + (summary?.semLocalizacao || 0);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoAcaoColor = (tipo: string) => {
    switch (tipo) {
      case "criacao": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "edicao": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "exclusao": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "movimentacao": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoAcaoLabel = (tipo: string) => {
    switch (tipo) {
      case "criacao": return "Criação";
      case "edicao": return "Edição";
      case "exclusao": return "Exclusão";
      case "movimentacao": return "Movimentação";
      default: return tipo;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#005A92] to-[#00A651] bg-clip-text text-transparent">
              Alertas e Pendências
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitore patrimônios com dados incompletos e histórico de alterações
            </p>
          </div>
          <Button variant="outline" onClick={refetchAll} disabled={loadingSummary}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingSummary ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="resumo" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Resumo
              {totalAlertas > 0 && (
                <Badge variant="destructive" className="ml-1">{totalAlertas}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sem-numero" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Sem Nº Série
              {(summary?.semNumeroSerie || 0) > 0 && (
                <Badge variant="secondary" className="ml-1">{summary?.semNumeroSerie}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sem-responsavel" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Sem Responsável
              {(summary?.semResponsavel || 0) > 0 && (
                <Badge variant="secondary" className="ml-1">{summary?.semResponsavel}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sem-localizacao" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Sem Local
              {(summary?.semLocalizacao || 0) > 0 && (
                <Badge variant="secondary" className="ml-1">{summary?.semLocalizacao}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Aba Resumo */}
          <TabsContent value="resumo" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${(summary?.semNumeroSerie || 0) > 0 ? 'border-amber-500' : 'border-green-500'}`}
                onClick={() => setActiveTab("sem-numero")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5 text-amber-500" />
                    Sem Número de Série
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {loadingSummary ? "..." : summary?.semNumeroSerie || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    patrimônios sem identificação
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${(summary?.semResponsavel || 0) > 0 ? 'border-amber-500' : 'border-green-500'}`}
                onClick={() => setActiveTab("sem-responsavel")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-500" />
                    Sem Responsável
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {loadingSummary ? "..." : summary?.semResponsavel || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    patrimônios sem responsável
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${(summary?.semLocalizacao || 0) > 0 ? 'border-amber-500' : 'border-green-500'}`}
                onClick={() => setActiveTab("sem-localizacao")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-500" />
                    Sem Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {loadingSummary ? "..." : summary?.semLocalizacao || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    patrimônios sem local definido
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {totalAlertas === 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Tudo em Ordem!
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Atenção Necessária
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {totalAlertas === 0 
                    ? "Todos os patrimônios estão com dados completos."
                    : `Existem ${totalAlertas} patrimônios que precisam de atenção.`
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Histórico Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Últimas Alterações
                </CardTitle>
                <CardDescription>
                  Histórico das últimas movimentações no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistorico ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : historicoRecente && historicoRecente.length > 0 ? (
                  <div className="space-y-3">
                    {historicoRecente.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge className={getTipoAcaoColor(item.tipoAcao)}>
                          {getTipoAcaoLabel(item.tipoAcao)}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.descricaoAcao}</p>
                          {item.campoAlterado && (
                            <p className="text-xs text-muted-foreground">
                              {item.valorAnterior} → {item.valorNovo}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    ))}
                    {historicoRecente.length > 5 && (
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setActiveTab("historico")}
                      >
                        Ver mais {historicoRecente.length - 5} registros
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma alteração registrada ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sem Número de Série */}
          <TabsContent value="sem-numero">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-amber-500" />
                  Patrimônios sem Número de Série
                </CardTitle>
                <CardDescription>
                  Estes itens precisam ter o número de série/patrimônio cadastrado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSemNumero ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : semNumeroSerie && semNumeroSerie.length > 0 ? (
                  <div className="space-y-2">
                    {semNumeroSerie.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.categoria} • {item.localizacao}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation(`/patrimonios?edit=${item.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Todos os patrimônios possuem número de série cadastrado!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sem Responsável */}
          <TabsContent value="sem-responsavel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-500" />
                  Patrimônios sem Responsável
                </CardTitle>
                <CardDescription>
                  Estes itens precisam ter um responsável definido
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSemResponsavel ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : semResponsavel && semResponsavel.length > 0 ? (
                  <div className="space-y-2">
                    {semResponsavel.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.categoria} • {item.localizacao}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation(`/patrimonios?edit=${item.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Todos os patrimônios possuem responsável definido!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sem Localização */}
          <TabsContent value="sem-localizacao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-500" />
                  Patrimônios sem Localização
                </CardTitle>
                <CardDescription>
                  Estes itens precisam ter a localização definida
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSemLocalizacao ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : semLocalizacao && semLocalizacao.length > 0 ? (
                  <div className="space-y-2">
                    {semLocalizacao.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.categoria} • Responsável: {item.responsavel}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation(`/patrimonios?edit=${item.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Todos os patrimônios possuem localização definida!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Histórico Completo */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Histórico de Alterações
                </CardTitle>
                <CardDescription>
                  Registro completo de todas as movimentações no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistorico ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : historicoRecente && historicoRecente.length > 0 ? (
                  <div className="space-y-3">
                    {historicoRecente.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                        <Badge className={getTipoAcaoColor(item.tipoAcao)}>
                          {getTipoAcaoLabel(item.tipoAcao)}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{item.descricaoAcao}</p>
                          {item.campoAlterado && (
                            <div className="mt-1 text-sm">
                              <span className="text-muted-foreground">Campo: </span>
                              <span className="font-mono">{item.campoAlterado}</span>
                            </div>
                          )}
                          {item.valorAnterior && item.valorNovo && (
                            <div className="mt-1 text-sm">
                              <span className="line-through text-red-500">{item.valorAnterior}</span>
                              <span className="mx-2">→</span>
                              <span className="text-green-500">{item.valorNovo}</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Patrimônio ID: {item.patrimonioId} • Usuário ID: {item.userId}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma alteração registrada ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
