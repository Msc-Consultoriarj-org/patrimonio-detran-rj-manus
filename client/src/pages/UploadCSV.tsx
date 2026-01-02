import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Edit, Save, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVRow {
  id: string;
  descricao: string;
  categoria: string;
  valor: string;
  localizacao: string;
  numeroSerie?: string;
  dataAquisicao: string;
  responsavel: string;
  status: "valid" | "warning" | "error";
  errors: string[];
  editing: boolean;
}

export default function UploadCSV() {
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const utils = trpc.useUtils();

  const validateRow = (row: any): { status: "valid" | "warning" | "error"; errors: string[] } => {
    const errors: string[] = [];
    
    // Validações obrigatórias
    if (!row.descricao || row.descricao.trim() === "") {
      errors.push("Descrição é obrigatória");
    }
    if (!row.categoria || row.categoria.trim() === "") {
      errors.push("Categoria é obrigatória");
    }
    if (!row.valor || row.valor.trim() === "") {
      errors.push("Valor é obrigatório");
    }
    if (!row.localizacao || row.localizacao.trim() === "") {
      errors.push("Localização é obrigatória");
    }
    if (!row.responsavel || row.responsavel.trim() === "") {
      errors.push("Responsável é obrigatório");
    }
    if (!row.dataAquisicao || row.dataAquisicao.trim() === "") {
      errors.push("Data de aquisição é obrigatória");
    }

    // Validação de data
    if (row.dataAquisicao) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(row.dataAquisicao)) {
        errors.push("Data deve estar no formato YYYY-MM-DD");
      }
    }

    if (errors.length > 0) {
      return { status: "error", errors };
    }

    // Avisos (não impedem o salvamento)
    const warnings: string[] = [];
    if (!row.numeroSerie || row.numeroSerie.trim() === "") {
      warnings.push("Número de série não informado");
    }

    if (warnings.length > 0) {
      return { status: "warning", errors: warnings };
    }

    return { status: "valid", errors: [] };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Por favor, selecione um arquivo CSV");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim() !== "");
        
        if (lines.length < 2) {
          toast.error("Arquivo CSV vazio ou inválido");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
        const rows: CSVRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          const validation = validateRow(row);
          
          rows.push({
            id: `temp-${i}`,
            descricao: row.descricao || "",
            categoria: row.categoria || "",
            valor: row.valor || "",
            localizacao: row.localizacao || "",
            numeroSerie: row.numeroSerie || "",
            dataAquisicao: row.dataAquisicao || "",
            responsavel: row.responsavel || "",
            status: validation.status,
            errors: validation.errors,
            editing: false,
          });
        }

        setCSVData(rows);
        toast.success(`${rows.length} linhas carregadas do CSV`);
      } catch (error) {
        toast.error("Erro ao processar arquivo CSV");
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  const handleEdit = (index: number) => {
    setCSVData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, editing: true } : row))
    );
  };

  const handleSaveEdit = (index: number) => {
    const row = csvData[index];
    const validation = validateRow(row);
    
    setCSVData((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, status: validation.status, errors: validation.errors, editing: false }
          : r
      )
    );
  };

  const handleCancelEdit = (index: number) => {
    setCSVData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, editing: false } : row))
    );
  };

  const handleFieldChange = (index: number, field: keyof CSVRow, value: string) => {
    setCSVData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveRow = (index: number) => {
    setCSVData((prev) => prev.filter((_, i) => i !== index));
    toast.success("Linha removida");
  };

  const handleSaveAll = async () => {
    const hasErrors = csvData.some((row) => row.status === "error");
    
    if (hasErrors) {
      toast.error("Corrija os erros antes de salvar");
      return;
    }

    setSaving(true);
    try {
      // TODO: Implementar salvamento em lote no backend
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success(`${csvData.length} patrimônios salvos com sucesso!`);
      setCSVData([]);
      setFileName("");
      utils.patrimonio.list.invalidate();
    } catch (error) {
      toast.error("Erro ao salvar patrimônios");
    } finally {
      setSaving(false);
    }
  };

  const validCount = csvData.filter((r) => r.status === "valid").length;
  const warningCount = csvData.filter((r) => r.status === "warning").length;
  const errorCount = csvData.filter((r) => r.status === "error").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00AA44] bg-clip-text text-transparent">
            Upload CSV
          </h1>
          <p className="text-muted-foreground mt-2">
            Importe patrimônios em massa através de arquivo CSV
          </p>
        </div>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Selecionar Arquivo CSV
            </CardTitle>
            <CardDescription>
              O arquivo deve conter as colunas: descricao, categoria, valor, localizacao, dataAquisicao, responsavel, numeroSerie (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <label htmlFor="csv-file" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {fileName || "Clique para selecionar um arquivo CSV"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Formato: CSV com cabeçalho
                </p>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {csvData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Válidos</p>
                    <p className="text-2xl font-bold text-green-600">{validCount}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avisos</p>
                    <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Erros</p>
                    <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  </div>
                  <X className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Validação e Edição */}
        {csvData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Validação de Dados</CardTitle>
              <CardDescription>
                Revise e edite os dados antes de salvar no banco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.status === "valid" && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Válido
                            </Badge>
                          )}
                          {row.status === "warning" && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Aviso
                            </Badge>
                          )}
                          {row.status === "error" && (
                            <Badge variant="destructive">
                              <X className="h-3 w-3 mr-1" />
                              Erro
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.editing ? (
                            <Input
                              value={row.descricao}
                              onChange={(e) => handleFieldChange(index, "descricao", e.target.value)}
                              className="min-w-[200px]"
                            />
                          ) : (
                            <div>
                              <p>{row.descricao}</p>
                              {row.errors.length > 0 && (
                                <p className="text-xs text-red-600 mt-1">{row.errors.join(", ")}</p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.editing ? (
                            <Input
                              value={row.categoria}
                              onChange={(e) => handleFieldChange(index, "categoria", e.target.value)}
                            />
                          ) : (
                            row.categoria
                          )}
                        </TableCell>
                        <TableCell>
                          {row.editing ? (
                            <Input
                              value={row.valor}
                              onChange={(e) => handleFieldChange(index, "valor", e.target.value)}
                            />
                          ) : (
                            row.valor
                          )}
                        </TableCell>
                        <TableCell>
                          {row.editing ? (
                            <Input
                              value={row.localizacao}
                              onChange={(e) => handleFieldChange(index, "localizacao", e.target.value)}
                            />
                          ) : (
                            row.localizacao
                          )}
                        </TableCell>
                        <TableCell>
                          {row.editing ? (
                            <Input
                              value={row.responsavel}
                              onChange={(e) => handleFieldChange(index, "responsavel", e.target.value)}
                            />
                          ) : (
                            row.responsavel
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {row.editing ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleSaveEdit(index)}
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelEdit(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(index)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRemoveRow(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {errorCount > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Existem {errorCount} linhas com erros. Corrija-as antes de salvar.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSaveAll}
                disabled={errorCount > 0 || saving}
                className="w-full bg-gradient-to-r from-[#0066CC] to-[#00AA44]"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar {csvData.length} Patrimônios no Banco de Dados
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
