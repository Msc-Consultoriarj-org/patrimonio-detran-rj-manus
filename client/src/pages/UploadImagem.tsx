import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, CheckCircle2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageData {
  file: File;
  preview: string;
  numeroPatrimonio: string;
  localizacao: string;
  descricao?: string;
  numeroSerie?: string;
}

export default function UploadImagem() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploading, setUploading] = useState(false);

  const utils = trpc.useUtils();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData({
        file,
        preview: reader.result as string,
        numeroPatrimonio: imageData?.numeroPatrimonio || "",
        localizacao: imageData?.localizacao || "",
        descricao: imageData?.descricao || "",
        numeroSerie: imageData?.numeroSerie || "",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: keyof ImageData, value: string) => {
    if (!imageData) return;
    setImageData({ ...imageData, [field]: value });
  };

  const handlePreview = () => {
    if (!imageData?.numeroPatrimonio || !imageData?.localizacao) {
      toast.error("Preencha os campos obrigatórios (Imagem, Nº Patrimônio e Localização)");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!imageData) return;

    setUploading(true);
    try {
      // Simular upload para S3 (será implementado com storagePut)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // TODO: Implementar upload real para S3 e salvar no banco
      // const imageUrl = await uploadToS3(imageData.file);
      // await createPatrimonio({ ...imageData, imageUrl });

      toast.success("Imagem enviada com sucesso!");
      setImageData(null);
      setShowConfirmation(false);
      utils.patrimonio.list.invalidate();
    } catch (error) {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setImageData(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00AA44] bg-clip-text text-transparent">
            Upload de Imagem
          </h1>
          <p className="text-muted-foreground mt-2">
            Anexe fotos dos patrimônios de informática
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Adicionar Imagem de Patrimônio
            </CardTitle>
            <CardDescription>
              Campos obrigatórios: Imagem, Nº Patrimônio e Localização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload de Imagem */}
            <div className="space-y-2">
              <Label htmlFor="image">Imagem *</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                {imageData?.preview ? (
                  <div className="relative">
                    <img
                      src={imageData.preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="image" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para selecionar uma imagem
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou JPEG (máx. 5MB)
                    </p>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {imageData && (
              <>
                {/* Campos do Formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroPatrimonio">Nº Patrimônio *</Label>
                    <Input
                      id="numeroPatrimonio"
                      placeholder="Ex: PAT-2024-001"
                      value={imageData.numeroPatrimonio}
                      onChange={(e) => handleInputChange("numeroPatrimonio", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localizacao">Localização *</Label>
                    <Input
                      id="localizacao"
                      placeholder="Ex: DTIC - Sala 101"
                      value={imageData.localizacao}
                      onChange={(e) => handleInputChange("localizacao", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição (Opcional)</Label>
                    <Input
                      id="descricao"
                      placeholder="Ex: Notebook Dell Latitude 5420"
                      value={imageData.descricao || ""}
                      onChange={(e) => handleInputChange("descricao", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroSerie">Número de Série (Opcional)</Label>
                    <Input
                      id="numeroSerie"
                      placeholder="Ex: SN123456789"
                      value={imageData.numeroSerie || ""}
                      onChange={(e) => handleInputChange("numeroSerie", e.target.value)}
                    />
                  </div>
                </div>

                {/* Botão de Visualizar */}
                <Button
                  onClick={handlePreview}
                  className="w-full bg-gradient-to-r from-[#0066CC] to-[#00AA44]"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Visualizar e Confirmar
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Confirmação */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Confirmar Upload</DialogTitle>
              <DialogDescription>
                Revise as informações antes de salvar no sistema
              </DialogDescription>
            </DialogHeader>

            {imageData && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <img
                    src={imageData.preview}
                    alt="Preview"
                    className="max-h-96 mx-auto rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-muted-foreground">Nº Patrimônio</p>
                    <p className="text-lg">{imageData.numeroPatrimonio}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Localização</p>
                    <p className="text-lg">{imageData.localizacao}</p>
                  </div>
                  {imageData.descricao && (
                    <div>
                      <p className="font-semibold text-muted-foreground">Descrição</p>
                      <p className="text-lg">{imageData.descricao}</p>
                    </div>
                  )}
                  {imageData.numeroSerie && (
                    <div>
                      <p className="font-semibold text-muted-foreground">Número de Série</p>
                      <p className="text-lg">{imageData.numeroSerie}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={uploading}
              >
                Voltar e Editar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={uploading}
                className="bg-gradient-to-r from-[#0066CC] to-[#00AA44]"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Confirmar e Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
