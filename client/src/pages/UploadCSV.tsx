import { useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  Loader2,
  FileText,
  Table as TableIcon,
} from "lucide-react";

type ParsedRow = {
  index: number;
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
};

type ParsedData = {
  headers: string[];
  rows: ParsedRow[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
  };
};

export default function UploadCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const parseMutation = trpc.csv.parse.useMutation();
  const importMutation = trpc.csv.import.useMutation();
  const utils = trpc.useUtils();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    // Validar tipo de arquivo
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const hasValidExtension = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(selectedFile.type) && !hasValidExtension) {
      toast.error("Formato de arquivo inválido. Use CSV, XLSX ou XLS.");
      return;
    }

    // Validar tamanho (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }

    setFile(selectedFile);
    setParsedData(null);

    // Converter para base64 e enviar para o backend
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      try {
        const result = await parseMutation.mutateAsync({
          base64,
          fileName: selectedFile.name,
          mimeType: selectedFile.type || "text/csv",
        });

        setParsedData(result);
        toast.success(`Arquivo processado: ${result.stats.total} registros encontrados`);
      } catch (error) {
        toast.error("Erro ao processar arquivo");
        console.error(error);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData(null);
    setShowOnlyErrors(false);
  };

  const handleImport = async () => {
    if (!parsedData) return;

    // Filtrar apenas linhas válidas
    const validRows = parsedData.rows.filter(row => row.isValid);

    if (validRows.length === 0) {
      toast.error("Nenhum registro válido para importar");
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      // Mapear dados para o formato esperado
      const mappedRows = validRows.map(row => {
        const data = row.data;
        
        // Normalizar nomes de campos (case-insensitive)
        const getValue = (field: string) => {
          const keys = Object.keys(data);
          const matchingKey = keys.find(k => k.toLowerCase() === field.toLowerCase());
          return matchingKey ? data[matchingKey] : "";
        };

        const valor = getValue("valor");
        const valorNum = Number(String(valor).replace(/[^0-9.,]/g, "").replace(",", "."));

        return {
          descricao: getValue("descricao") || "",
          categoria: getValue("categoria") || "",
          valor: valorNum,
          localizacao: getValue("localizacao") || getValue("localização") || "",
          numeroSerie: getValue("numeroSerie") || getValue("numero_serie") || getValue("número de série") || undefined,
          dataAquisicao: getValue("dataAquisicao") || getValue("data_aquisicao") || getValue("data de aquisição") || undefined,
          responsavel: getValue("responsavel") || getValue("responsável") || undefined,
          imageUrl: getValue("imageUrl") || getValue("imagem") || undefined,
        };
      });

      // Simular progresso
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await importMutation.mutateAsync({ rows: mappedRows });

      clearInterval(progressInterval);
      setImportProgress(100);

      await utils.patrimonio.list.invalidate();

      toast.success(`Importação concluída! ${result.imported} registros importados.`);
      
      if (result.failed > 0) {
        toast.warning(`${result.failed} registros falharam na importação.`);
      }

      // Resetar após sucesso
      setTimeout(() => {
        handleRemoveFile();
        setImporting(false);
        setImportProgress(0);
      }, 2000);
    } catch (error) {
      toast.error("Erro ao importar dados");
      console.error(error);
      setImporting(false);
      setImportProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = `descricao,categoria,valor,localizacao,numeroSerie,dataAquisicao,responsavel
Monitor Dell 24",Monitor,2500.00,Sala 101,MON-001,2024-01-15,João Silva
Impressora HP LaserJet,Impressora,4500.00,Sala 102,IMP-001,2024-01-20,Maria Santos`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template_patrimonio.csv";
    link.click();
  };

  const filteredRows = parsedData
    ? showOnlyErrors
      ? parsedData.rows.filter(row => !row.isValid)
      : parsedData.rows
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload de CSV</h1>
          <p className="text-muted-foreground mt-2">
            Importe patrimônios em massa através de arquivos CSV ou Excel
          </p>
        </div>

        {/* Instruções e Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Instruções
            </CardTitle>
            <CardDescription>
              Siga estas orientações para garantir uma importação bem-sucedida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Formatos aceitos:</h4>
              <div className="flex gap-2">
                <Badge variant="secondary">CSV (.csv)</Badge>
                <Badge variant="secondary">Excel (.xlsx)</Badge>
                <Badge variant="secondary">Excel 97-2003 (.xls)</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Campos obrigatórios:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>descricao</strong> - Descrição do patrimônio</li>
                <li><strong>categoria</strong> - Categoria do equipamento (Monitor, Impressora, etc.)</li>
                <li><strong>valor</strong> - Valor em reais (use ponto ou vírgula como decimal)</li>
                <li><strong>localizacao</strong> - Local onde está o patrimônio</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Campos opcionais:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>numeroSerie</strong> - Número de série do equipamento</li>
                <li><strong>dataAquisicao</strong> - Data de aquisição (formato: YYYY-MM-DD)</li>
                <li><strong>responsavel</strong> - Nome do responsável pelo patrimônio</li>
              </ul>
            </div>

            <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Baixar Template CSV
            </Button>
          </CardContent>
        </Card>

        {/* Área de Upload */}
        {!file && (
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Arquivo</CardTitle>
              <CardDescription>Arraste e solte ou clique para selecionar</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50"
                }`}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Arraste seu arquivo aqui
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  ou clique para selecionar
                </p>
                <Label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Selecionar Arquivo
                    </span>
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Arquivo Selecionado */}
        {file && !parsedData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {parseMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        {parsedData && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parsedData.stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Registros Válidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{parsedData.stats.valid}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Registros Inválidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{parsedData.stats.invalid}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview dos Dados */}
        {parsedData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Preview dos Dados
                  </CardTitle>
                  <CardDescription>
                    Revise os dados antes de importar
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={showOnlyErrors ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyErrors(!showOnlyErrors)}
                  >
                    {showOnlyErrors ? "Mostrar Todos" : "Mostrar Apenas Erros"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Linha</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      {parsedData.headers.map((header, i) => (
                        <th key={i} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-t ${
                          !row.isValid
                            ? "bg-red-50"
                            : row.warnings.length > 0
                            ? "bg-yellow-50"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3">{row.index}</td>
                        <td className="px-4 py-3">
                          {row.isValid ? (
                            row.warnings.length > 0 ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </td>
                        {parsedData.headers.map((header, j) => (
                          <td key={j} className="px-4 py-3 whitespace-nowrap">
                            {row.data[header] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Alertas de Erro */}
              {parsedData.stats.invalid > 0 && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{parsedData.stats.invalid} registro(s) com erro.</strong>
                    <br />
                    Apenas registros válidos serão importados. Corrija os erros no arquivo e faça upload novamente para importar todos os registros.
                  </AlertDescription>
                </Alert>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleImport}
                  disabled={parsedData.stats.valid === 0 || importing}
                  className="flex-1"
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Importar {parsedData.stats.valid} Registro(s) Válido(s)
                    </>
                  )}
                </Button>
              </div>

              {/* Barra de Progresso */}
              {importing && (
                <div className="mt-4 space-y-2">
                  <Progress value={importProgress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Importando... {importProgress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
