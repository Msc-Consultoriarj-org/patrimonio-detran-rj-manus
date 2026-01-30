import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import QRCodeScanner from "@/components/QRCodeScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ClipboardList, Upload, X, Image as ImageIcon, QrCode, Search, CheckCircle, AlertCircle, Edit } from "lucide-react";

export default function Levantamento() {
  const [formData, setFormData] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    localizacao: "",
    numeroSerie: "",
    dataAquisicao: "",
    responsavel: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner");
  
  // Estado para patrimônio encontrado via scanner
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannedFormat, setScannedFormat] = useState<string | null>(null);
  const [foundPatrimonio, setFoundPatrimonio] = useState<any | null>(null);
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");

  const utils = trpc.useUtils();

  // Query para buscar patrimônio por número de série
  const searchPatrimonioMutation = trpc.patrimonio.searchByNumeroSerie.useMutation({
    onSuccess: (data) => {
      if (data) {
        setFoundPatrimonio(data);
        setSearchStatus("found");
        toast.success("Patrimônio encontrado!");
      } else {
        setFoundPatrimonio(null);
        setSearchStatus("not_found");
        toast.info("Patrimônio não encontrado. Deseja cadastrar?");
      }
    },
    onError: (error) => {
      setSearchStatus("not_found");
      toast.error(error.message || "Erro ao buscar patrimônio");
    },
  });

  const uploadImageMutation = trpc.upload.image.useMutation();
  const createPatrimonioMutation = trpc.patrimonio.create.useMutation({
    onSuccess: () => {
      toast.success("Patrimônio cadastrado com sucesso!");
      resetForm();
      utils.patrimonio.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar patrimônio");
    },
  });

  const resetForm = () => {
    setFormData({
      descricao: "",
      categoria: "",
      valor: "",
      localizacao: "",
      numeroSerie: "",
      dataAquisicao: "",
      responsavel: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setScannedCode(null);
    setScannedFormat(null);
    setFoundPatrimonio(null);
    setSearchStatus("idle");
  };

  const handleScan = (decodedText: string, format: string) => {
    setScannedCode(decodedText);
    setScannedFormat(format);
    setSearchStatus("searching");
    
    // Buscar patrimônio pelo código escaneado
    searchPatrimonioMutation.mutate({ numeroSerie: decodedText });
  };

  const handleUseScannedCode = () => {
    if (scannedCode) {
      setFormData((prev) => ({ ...prev, numeroSerie: scannedCode }));
      setActiveTab("cadastro");
      toast.info("Código preenchido no formulário. Complete os dados.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descricao || !formData.categoria || !formData.valor || !formData.localizacao || !formData.dataAquisicao || !formData.responsavel) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setUploading(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile && imagePreview) {
        const uploadResult = await uploadImageMutation.mutateAsync({
          base64: imagePreview,
          fileName: imageFile.name,
          mimeType: imageFile.type,
        });
        imageUrl = uploadResult.url;
      }

      await createPatrimonioMutation.mutateAsync({
        ...formData,
        dataAquisicao: new Date(formData.dataAquisicao),
        imageUrl,
      });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#005A92] to-[#00A651] bg-clip-text text-transparent">
            Levantamento de Patrimônio
          </h1>
          <p className="text-muted-foreground mt-2">
            Escaneie códigos de barras ou cadastre novos patrimônios
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="cadastro" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Cadastro Manual
            </TabsTrigger>
          </TabsList>

          {/* Aba Scanner */}
          <TabsContent value="scanner" className="space-y-4">
            <QRCodeScanner
              onScan={handleScan}
              onError={(error) => toast.error(error)}
              title="Scanner de Patrimônio"
              description="Aponte a câmera para o código de barras ou QR Code do equipamento"
            />

            {/* Resultado da leitura */}
            {scannedCode && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Resultado da Leitura
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={resetForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Código lido:</p>
                      <p className="font-mono font-bold text-lg">{scannedCode}</p>
                    </div>
                    <Badge variant="outline">{scannedFormat}</Badge>
                  </div>

                  {searchStatus === "searching" && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span className="text-muted-foreground">Buscando patrimônio...</span>
                    </div>
                  )}

                  {searchStatus === "found" && foundPatrimonio && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Patrimônio Encontrado!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">Descrição</p>
                          <p className="font-medium">{foundPatrimonio.descricao}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Categoria</p>
                          <p className="font-medium">{foundPatrimonio.categoria}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Localização</p>
                          <p className="font-medium">{foundPatrimonio.localizacao}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Responsável</p>
                          <p className="font-medium">{foundPatrimonio.responsavel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor</p>
                          <p className="font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(foundPatrimonio.valor))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Nº Série</p>
                          <p className="font-medium font-mono">{foundPatrimonio.numeroSerie || "-"}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.location.href = `/patrimonios?edit=${foundPatrimonio.id}`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Patrimônio
                      </Button>
                    </div>
                  )}

                  {searchStatus === "not_found" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-semibold">Patrimônio não encontrado</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nenhum patrimônio com este código foi encontrado no sistema.
                        Deseja cadastrar um novo?
                      </p>
                      <Button
                        className="w-full bg-gradient-to-r from-[#005A92] to-[#00A651]"
                        onClick={handleUseScannedCode}
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Cadastrar Novo Patrimônio
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Cadastro Manual */}
          <TabsContent value="cadastro">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Novo Patrimônio
                </CardTitle>
                <CardDescription>
                  Preencha todos os campos para registrar um novo item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Upload de Imagem */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Foto do Patrimônio (Opcional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="image" className="cursor-pointer block">
                          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Clique para adicionar uma foto
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG ou JPEG (máx. 5MB)
                          </p>
                          <input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Campos do Formulário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Input
                        id="descricao"
                        placeholder="Ex: Notebook Dell Latitude 5420"
                        value={formData.descricao}
                        onChange={(e) => handleInputChange("descricao", e.target.value)}
                        disabled={uploading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Input
                        id="categoria"
                        placeholder="Ex: Notebook, Monitor, Impressora"
                        value={formData.categoria}
                        onChange={(e) => handleInputChange("categoria", e.target.value)}
                        disabled={uploading}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor *</Label>
                      <Input
                        id="valor"
                        placeholder="Ex: R$ 3.500,00"
                        value={formData.valor}
                        onChange={(e) => handleInputChange("valor", e.target.value)}
                        disabled={uploading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="localizacao">Localização *</Label>
                      <Input
                        id="localizacao"
                        placeholder="Ex: DTIC - Sala 101"
                        value={formData.localizacao}
                        onChange={(e) => handleInputChange("localizacao", e.target.value)}
                        disabled={uploading}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroSerie">Número de Série / Patrimônio</Label>
                      <Input
                        id="numeroSerie"
                        placeholder="Ex: SN123456789"
                        value={formData.numeroSerie}
                        onChange={(e) => handleInputChange("numeroSerie", e.target.value)}
                        disabled={uploading}
                        className={scannedCode && formData.numeroSerie === scannedCode ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
                      />
                      {scannedCode && formData.numeroSerie === scannedCode && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Código escaneado
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataAquisicao">Data de Aquisição *</Label>
                      <Input
                        id="dataAquisicao"
                        type="date"
                        value={formData.dataAquisicao}
                        onChange={(e) => handleInputChange("dataAquisicao", e.target.value)}
                        disabled={uploading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável *</Label>
                    <Input
                      id="responsavel"
                      placeholder="Ex: João Silva"
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange("responsavel", e.target.value)}
                      disabled={uploading}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#005A92] to-[#00A651]"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {imageFile ? "Enviando imagem e cadastrando..." : "Cadastrando..."}
                      </div>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Cadastrar Patrimônio
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
