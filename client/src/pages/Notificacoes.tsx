import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Bell, 
  Mail, 
  Clock, 
  Send, 
  Settings, 
  History,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";

type FrequencyType = "daily" | "weekly" | "monthly";

export default function Notificacoes() {
  const [activeTab, setActiveTab] = useState("config");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [frequency, setFrequency] = useState<FrequencyType>("weekly");
  const [emailDestino, setEmailDestino] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Query para obter resumo de alertas
  const { data: alertasSummary } = trpc.alertas.summary.useQuery();

  // Mutation para enviar notificação
  const sendNotification = trpc.system.notifyOwner.useMutation({
    onSuccess: () => {
      toast.success("Notificação enviada com sucesso!");
      setIsSending(false);
    },
    onError: (error) => {
      toast.error(`Erro ao enviar notificação: ${error.message}`);
      setIsSending(false);
    },
  });

  // Enviar relatório de pendências agora
  const handleSendNow = async () => {
    if (!alertasSummary) return;
    
    setIsSending(true);
    
    const totalPendencias = 
      (alertasSummary.semNumeroSerie || 0) + 
      (alertasSummary.semResponsavel || 0) + 
      (alertasSummary.semLocalizacao || 0);

    const content = `
📊 RELATÓRIO DE PENDÊNCIAS - PATRIMÔNIO DTIC

📅 Data: ${new Date().toLocaleDateString("pt-BR")}

📋 RESUMO DE PENDÊNCIAS:
• Sem Número de Série: ${alertasSummary.semNumeroSerie || 0} itens
• Sem Responsável: ${alertasSummary.semResponsavel || 0} itens
• Sem Localização: ${alertasSummary.semLocalizacao || 0} itens

📈 TOTAL: ${totalPendencias} patrimônios precisam de atenção

${totalPendencias === 0 
  ? "✅ Parabéns! Todos os patrimônios estão com dados completos." 
  : "⚠️ Acesse o sistema para regularizar os itens pendentes."}

---
Sistema de Patrimônio DTIC - Detran-RJ
    `.trim();

    sendNotification.mutate({
      title: `[Patrimônio DTIC] Relatório de Pendências - ${totalPendencias} itens`,
      content,
    });
  };

  // Histórico simulado de notificações
  const historicoNotificacoes = [
    { id: 1, data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), tipo: "semanal", status: "enviado", pendencias: 5 },
    { id: 2, data: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), tipo: "semanal", status: "enviado", pendencias: 8 },
    { id: 3, data: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), tipo: "semanal", status: "enviado", pendencias: 12 },
  ];

  const totalPendencias = 
    (alertasSummary?.semNumeroSerie || 0) + 
    (alertasSummary?.semResponsavel || 0) + 
    (alertasSummary?.semLocalizacao || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#005A92] to-[#00A651] bg-clip-text text-transparent">
              Notificações
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure alertas automáticos e relatórios de pendências
            </p>
          </div>
          <Button 
            onClick={handleSendNow}
            disabled={isSending}
            className="bg-gradient-to-r from-[#005A92] to-[#00A651]"
          >
            {isSending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Agora
              </>
            )}
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Pendências Atuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalPendencias}</div>
              <p className="text-sm text-muted-foreground mt-1">
                patrimônios precisam de atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Próximo Envio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {frequency === "daily" && "Amanhã às 08:00"}
                {frequency === "weekly" && "Segunda-feira às 08:00"}
                {frequency === "monthly" && "Dia 1 às 08:00"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Frequência: {frequency === "daily" ? "Diária" : frequency === "weekly" ? "Semanal" : "Mensal"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={emailEnabled ? "default" : "secondary"}>
                  {emailEnabled ? "Ativo" : "Desativado"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Notificações automáticas
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Aba Configurações */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Configurações de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como e quando receber alertas de pendências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ativar/Desativar */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Notificações Automáticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba relatórios automáticos de pendências
                    </p>
                  </div>
                  <Switch
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                </div>

                {/* Frequência */}
                <div className="space-y-2">
                  <Label>Frequência de Envio</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as FrequencyType)}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária (todos os dias às 08:00)</SelectItem>
                      <SelectItem value="weekly">Semanal (segunda-feira às 08:00)</SelectItem>
                      <SelectItem value="monthly">Mensal (dia 1 às 08:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email adicional */}
                <div className="space-y-2">
                  <Label>Email Adicional (opcional)</Label>
                  <Input
                    type="email"
                    placeholder="email@detran.rj.gov.br"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    className="w-full md:w-[300px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Além do proprietário do sistema, enviar para este email
                  </p>
                </div>

                {/* Tipos de alerta */}
                <div className="space-y-3">
                  <Label>Tipos de Alerta Incluídos</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Patrimônios sem número de série</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Patrimônios sem responsável</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Patrimônios sem localização</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="bg-gradient-to-r from-[#005A92] to-[#00A651]"
                  onClick={() => toast.success("Configurações salvas com sucesso!")}
                >
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Preview do Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Preview do Relatório
                </CardTitle>
                <CardDescription>
                  Visualize como será o relatório enviado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
{`📊 RELATÓRIO DE PENDÊNCIAS - PATRIMÔNIO DTIC

📅 Data: ${new Date().toLocaleDateString("pt-BR")}

📋 RESUMO DE PENDÊNCIAS:
• Sem Número de Série: ${alertasSummary?.semNumeroSerie || 0} itens
• Sem Responsável: ${alertasSummary?.semResponsavel || 0} itens
• Sem Localização: ${alertasSummary?.semLocalizacao || 0} itens

📈 TOTAL: ${totalPendencias} patrimônios precisam de atenção

${totalPendencias === 0 
  ? "✅ Parabéns! Todos os patrimônios estão com dados completos." 
  : "⚠️ Acesse o sistema para regularizar os itens pendentes."}

---
Sistema de Patrimônio DTIC - Detran-RJ`}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Histórico de Notificações
                </CardTitle>
                <CardDescription>
                  Registro de notificações enviadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historicoNotificacoes.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Relatório {notif.tipo === "semanal" ? "Semanal" : notif.tipo === "diario" ? "Diário" : "Mensal"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notif.data.toLocaleDateString("pt-BR")} • {notif.pendencias} pendências
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enviado
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
