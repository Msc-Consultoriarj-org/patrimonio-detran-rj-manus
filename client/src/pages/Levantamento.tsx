import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ClipboardList, Upload, X, Image as ImageIcon } from "lucide-react";

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

  const utils = trpc.useUtils();

  const uploadImageMutation = trpc.upload.image.useMutation();
  const createPatrimonioMutation = trpc.patrimonio.create.useMutation({
    onSuccess: () => {
      toast.success("Patrimônio cadastrado com sucesso!");
      // Limpar formulário
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
      utils.patrimonio.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar patrimônio");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setImageFile(file);

    // Criar preview
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

    // Validações
    if (!formData.descricao || !formData.categoria || !formData.valor || !formData.localizacao || !formData.dataAquisicao || !formData.responsavel) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setUploading(true);

    try {
      let imageUrl: string | undefined;

      // Upload da imagem se houver
      if (imageFile && imagePreview) {
        const uploadResult = await uploadImageMutation.mutateAsync({
          base64: imagePreview,
          fileName: imageFile.name,
          mimeType: imageFile.type,
        });
        imageUrl = uploadResult.url;
      }

      // Criar patrimônio
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00AA44] bg-clip-text text-transparent">
            Levantamento de Patrimônio
          </h1>
          <p className="text-muted-foreground mt-2">
            Cadastre novos patrimônios com foto e informações completas
          </p>
        </div>

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
                  <Label htmlFor="numeroSerie">Número de Série</Label>
                  <Input
                    id="numeroSerie"
                    placeholder="Ex: SN123456789"
                    value={formData.numeroSerie}
                    onChange={(e) => handleInputChange("numeroSerie", e.target.value)}
                    disabled={uploading}
                  />
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
                className="w-full bg-gradient-to-r from-[#0066CC] to-[#00AA44]"
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
      </div>
    </DashboardLayout>
  );
}
