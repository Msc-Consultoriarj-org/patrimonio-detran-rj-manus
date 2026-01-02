import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Lightbulb, Send, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Sugestoes() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState<"baixa" | "media" | "alta">("media");

  const utils = trpc.useUtils();
  
  const { data: sugestoes, isLoading } = trpc.sugestoes.myList.useQuery();

  const createMutation = trpc.sugestoes.create.useMutation({
    onSuccess: () => {
      toast.success("Sugestão enviada com sucesso!");
      setTitulo("");
      setDescricao("");
      setCategoria("");
      setPrioridade("media");
      utils.sugestoes.myList.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar sugestão");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim() || !categoria.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createMutation.mutate({ titulo, descricao, categoria, prioridade });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pendente: { label: "Pendente", icon: Clock, variant: "secondary" as const },
      em_analise: { label: "Em Análise", icon: AlertCircle, variant: "default" as const },
      aprovada: { label: "Aprovada", icon: CheckCircle2, variant: "default" as const },
      rejeitada: { label: "Rejeitada", icon: XCircle, variant: "destructive" as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeMap = {
      baixa: { label: "Baixa", className: "bg-blue-100 text-blue-800" },
      media: { label: "Média", className: "bg-yellow-100 text-yellow-800" },
      alta: { label: "Alta", className: "bg-red-100 text-red-800" },
    };
    
    const config = prioridadeMap[prioridade as keyof typeof prioridadeMap] || prioridadeMap.media;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00AA44] bg-clip-text text-transparent">
            Sugestões
          </h1>
          <p className="text-muted-foreground mt-2">
            Envie suas sugestões de melhorias para o sistema
          </p>
        </div>

        {/* Formulário de Nova Sugestão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Nova Sugestão
            </CardTitle>
            <CardDescription>
              Compartilhe suas ideias para melhorar o sistema de patrimônio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Título da sugestão"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    placeholder="Ex: Interface, Funcionalidade, Relatórios"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={prioridade}
                  onValueChange={(value) => setPrioridade(value as "baixa" | "media" | "alta")}
                  disabled={createMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva sua sugestão em detalhes..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={5}
                  disabled={createMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0066CC] to-[#00AA44]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Sugestão
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Sugestões Enviadas */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Sugestões</CardTitle>
            <CardDescription>
              Acompanhe o status das suas sugestões enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : sugestoes && sugestoes.length > 0 ? (
              <div className="space-y-4">
                {sugestoes.map((sugestao) => (
                  <div
                    key={sugestao.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{sugestao.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {sugestao.descricao}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {getStatusBadge(sugestao.status)}
                        {getPrioridadeBadge(sugestao.prioridade)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                      <span className="font-medium text-primary">{sugestao.categoria}</span>
                      <span>•</span>
                      <span>{new Date(sugestao.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Você ainda não enviou nenhuma sugestão</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
