import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileDown, FileText, FileSpreadsheet, FileCode, Eye, Download, Loader2, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Relatorios() {
  const [formato, setFormato] = useState<"csv" | "pdf" | "markdown" | "visual">("visual");
  const [categoria, setCategoria] = useState<string>("todas");
  const [localizacao, setLocalizacao] = useState<string>("todas");
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [generatingPorLocalizacao, setGeneratingPorLocalizacao] = useState(false);

  const { data: patrimonios, isLoading } = trpc.patrimonio.list.useQuery();

  const excelQuery = trpc.relatorios.excel.useQuery(undefined, {
    enabled: false,
  });

  const porLocalizacaoQuery = trpc.relatorios.porLocalizacao.useQuery(undefined, {
    enabled: false,
  });

  const patrimoniosFiltrados = patrimonios?.filter((p) => {
    if (categoria !== "todas" && p.categoria !== categoria) return false;
    if (localizacao !== "todas" && !p.localizacao.includes(localizacao)) return false;
    return true;
  });

  const categorias = Array.from(new Set(patrimonios?.map((p) => p.categoria) || []));
  const localizacoes = Array.from(new Set(patrimonios?.map((p) => p.localizacao) || []));

  const exportCSV = () => {
    if (!patrimoniosFiltrados || patrimoniosFiltrados.length === 0) {
      toast.error("Nenhum patrimônio para exportar");
      return;
    }

    const headers = ["ID", "Descrição", "Categoria", "Valor", "Localização", "Número de Série", "Data de Aquisição", "Responsável"];
    const rows = patrimoniosFiltrados.map((p) => [
      p.id,
      p.descricao,
      p.categoria,
      p.valor,
      p.localizacao,
      p.numeroSerie || "",
      new Date(p.dataAquisicao).toLocaleDateString("pt-BR"),
      p.responsavel,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `patrimonios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Relatório CSV exportado com sucesso!");
  };

  const exportMarkdown = () => {
    if (!patrimoniosFiltrados || patrimoniosFiltrados.length === 0) {
      toast.error("Nenhum patrimônio para exportar");
      return;
    }

    let markdown = `# Relatório de Patrimônios - Detran-RJ\n\n`;
    markdown += `**Data:** ${new Date().toLocaleDateString("pt-BR")}\n\n`;
    markdown += `**Total de Itens:** ${patrimoniosFiltrados.length}\n\n`;
    
    if (categoria !== "todas") {
      markdown += `**Categoria:** ${categoria}\n\n`;
    }
    if (localizacao !== "todas") {
      markdown += `**Localização:** ${localizacao}\n\n`;
    }

    markdown += `## Patrimônios\n\n`;
    markdown += `| ID | Descrição | Categoria | Valor | Localização | Responsável |\n`;
    markdown += `|----|-----------|-----------|-------|-------------|-------------|\n`;

    patrimoniosFiltrados.forEach((p) => {
      markdown += `| ${p.id} | ${p.descricao} | ${p.categoria} | ${p.valor} | ${p.localizacao} | ${p.responsavel} |\n`;
    });

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `patrimonios_${new Date().toISOString().split("T")[0]}.md`;
    link.click();

    toast.success("Relatório Markdown exportado com sucesso!");
  };

  const exportPDF = () => {
    toast.info("Exportação para PDF será implementada em breve");
    // TODO: Implementar exportação PDF usando biblioteca como jsPDF
  };

  const downloadFile = (base64Data: string, fileName: string) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Relatório baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast.error("Erro ao baixar relatório");
    }
  };

  const handleGerarExcel = async () => {
    setGeneratingExcel(true);
    try {
      const result = await excelQuery.refetch();
      if (result.data) {
        downloadFile(result.data.data, result.data.fileName);
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório Excel");
    } finally {
      setGeneratingExcel(false);
    }
  };

  const handleGerarPorLocalizacao = async () => {
    setGeneratingPorLocalizacao(true);
    try {
      const result = await porLocalizacaoQuery.refetch();
      if (result.data) {
        downloadFile(result.data.data, result.data.fileName);
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório por localização");
    } finally {
      setGeneratingPorLocalizacao(false);
    }
  };

  const handleExport = () => {
    switch (formato) {
      case "csv":
        exportCSV();
        break;
      case "markdown":
        exportMarkdown();
        break;
      case "pdf":
        exportPDF();
        break;
      case "visual":
        toast.info("Visualização já está sendo exibida abaixo");
        break;
    }
  };

  const getFormatoIcon = () => {
    switch (formato) {
      case "csv":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "markdown":
        return <FileCode className="h-5 w-5" />;
      case "visual":
        return <Eye className="h-5 w-5" />;
    }
  };

  const totalValor = patrimoniosFiltrados?.reduce((acc, p) => {
    const valor = parseFloat(p.valor.replace(/[^\d,]/g, "").replace(",", "."));
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00AA44] bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-2">
            Gere e exporte relatórios de patrimônios
          </p>
        </div>

        {/* Relatórios Excel */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Relatório Geral Excel
              </CardTitle>
              <CardDescription>
                Relatório completo ordenado por andar e equipamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Todos os patrimônios cadastrados</p>
                <p>• Ordenação por localização e categoria</p>
                <p>• Indica itens sem patrimônio</p>
              </div>
              <Button
                onClick={handleGerarExcel}
                disabled={generatingExcel}
                className="w-full"
              >
                {generatingExcel ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Relatório por Localização
              </CardTitle>
              <CardDescription>
                Uma aba para cada andar/localização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Separado por localização</p>
                <p>• Patrimônios agrupados por local</p>
                <p>• Fácil visualização e impressão</p>
              </div>
              <Button
                onClick={handleGerarPorLocalizacao}
                disabled={generatingPorLocalizacao}
                className="w-full"
                variant="outline"
              >
                {generatingPorLocalizacao ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Exportação */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Relatório</CardTitle>
            <CardDescription>
              Selecione os filtros e o formato de exportação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Localização</Label>
                <Select value={localizacao} onValueChange={setLocalizacao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {localizacoes.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formato</Label>
                <Select value={formato} onValueChange={(v) => setFormato(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visualização</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-[#0066CC] to-[#00AA44]"
            >
              {getFormatoIcon()}
              <span className="ml-2">
                {formato === "visual" ? "Visualizar" : "Exportar"} Relatório
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Visualização */}
        {formato === "visual" && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Relatório</CardTitle>
              <CardDescription>
                {patrimoniosFiltrados?.length || 0} patrimônios encontrados
                {totalValor !== undefined && (
                  <span className="ml-2">
                    • Valor Total: R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : patrimoniosFiltrados && patrimoniosFiltrados.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Data Aquisição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patrimoniosFiltrados.map((patrimonio) => (
                        <TableRow key={patrimonio.id}>
                          <TableCell>{patrimonio.id}</TableCell>
                          <TableCell className="font-medium">{patrimonio.descricao}</TableCell>
                          <TableCell>{patrimonio.categoria}</TableCell>
                          <TableCell>{patrimonio.valor}</TableCell>
                          <TableCell>{patrimonio.localizacao}</TableCell>
                          <TableCell>{patrimonio.responsavel}</TableCell>
                          <TableCell>
                            {new Date(patrimonio.dataAquisicao).toLocaleDateString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum patrimônio encontrado com os filtros selecionados</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
