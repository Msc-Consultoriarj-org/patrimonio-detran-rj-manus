import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Search, Pencil, Trash2, Package, X, Image as ImageIcon, MapPin, Tag, Hash } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import type { Patrimonio } from "../../../drizzle/schema";

const categorias = [
  "Computador",
  "Notebook",
  "Monitor",
  "Impressora",
  "Scanner",
  "Servidor",
  "Switch",
  "Roteador",
  "No-Break",
  "Outros",
];

// Cores por categoria
const categoriaCores: Record<string, string> = {
  "Rack": "bg-blue-50 border-blue-200",
  "Switch": "bg-green-50 border-green-200",
  "Computador": "bg-purple-50 border-purple-200",
  "Notebook": "bg-indigo-50 border-indigo-200",
  "Monitor": "bg-cyan-50 border-cyan-200",
  "Impressora": "bg-amber-50 border-amber-200",
  "Servidor": "bg-red-50 border-red-200",
  "Roteador": "bg-teal-50 border-teal-200",
  "No-Break": "bg-orange-50 border-orange-200",
  "Outros": "bg-gray-50 border-gray-200",
};

export default function Patrimonios() {
  const utils = trpc.useUtils();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<Patrimonio | null>(null);
  const [detailsPatrimonio, setDetailsPatrimonio] = useState<Patrimonio | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("");
  const [localizacaoFilter, setLocalizacaoFilter] = useState("");
  const [semPatrimonioFilter, setSemPatrimonioFilter] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    localizacao: "",
    numeroSerie: "",
    dataAquisicao: new Date().toISOString().split("T")[0],
    responsavel: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: allPatrimonios, isLoading } = trpc.patrimonio.search.useQuery({
    searchTerm,
    categoria: categoriaFilter || undefined,
    localizacao: localizacaoFilter || undefined,
  });

  // Filtrar itens sem patrimônio no frontend
  const patrimonios = semPatrimonioFilter
    ? allPatrimonios?.filter(p => !p.numeroSerie || p.numeroSerie.startsWith('SN-'))
    : allPatrimonios;

  const uploadImageMutation = trpc.upload.image.useMutation();

  const createMutation = trpc.patrimonio.create.useMutation({
    onSuccess: () => {
      toast.success("Patrimônio cadastrado com sucesso!");
      utils.patrimonio.search.invalidate();
      utils.patrimonio.list.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar patrimônio");
    },
  });

  const updateMutation = trpc.patrimonio.update.useMutation({
    onSuccess: () => {
      toast.success("Patrimônio atualizado com sucesso!");
      utils.patrimonio.search.invalidate();
      utils.patrimonio.list.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar patrimônio");
    },
  });

  const deleteMutation = trpc.patrimonio.delete.useMutation({
    onSuccess: () => {
      toast.success("Patrimônio excluído com sucesso!");
      utils.patrimonio.search.invalidate();
      utils.patrimonio.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedPatrimonio(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir patrimônio");
    },
  });

  const resetForm = () => {
    setFormData({
      descricao: "",
      categoria: "",
      valor: "",
      localizacao: "",
      numeroSerie: "",
      dataAquisicao: new Date().toISOString().split("T")[0],
      responsavel: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreate = async () => {
    if (!formData.descricao || !formData.categoria || !formData.localizacao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        setUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });

        const base64 = reader.result as string;
        const result = await uploadImageMutation.mutateAsync({
          base64: base64.split(",")[1],
          fileName: imageFile.name,
          mimeType: imageFile.type,
        });

        imageUrl = result.url;
        setUploading(false);
      }

      const { dataAquisicao, ...rest } = formData;
      createMutation.mutate({
        ...rest,
        dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : new Date(),
        imageUrl,
      });
    } catch (error) {
      setUploading(false);
      toast.error("Erro ao fazer upload da imagem");
    }
  };

  const handleEdit = (patrimonio: Patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setFormData({
      descricao: patrimonio.descricao,
      categoria: patrimonio.categoria,
      valor: patrimonio.valor?.toString() || "",
      localizacao: patrimonio.localizacao,
      numeroSerie: patrimonio.numeroSerie || "",
      dataAquisicao: patrimonio.dataAquisicao
        ? new Date(patrimonio.dataAquisicao).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      responsavel: patrimonio.responsavel || "",
    });
    if (patrimonio.imageUrl) {
      setImagePreview(patrimonio.imageUrl);
    }
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPatrimonio) return;

    if (!formData.descricao || !formData.categoria || !formData.localizacao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      let imageUrl: string | undefined = selectedPatrimonio.imageUrl || undefined;

      if (imageFile) {
        setUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });

        const base64 = reader.result as string;
        const result = await uploadImageMutation.mutateAsync({
          base64: base64.split(",")[1],
          fileName: imageFile.name,
          mimeType: imageFile.type,
        });

        imageUrl = result.url;
        setUploading(false);
      }

      const { dataAquisicao, ...rest } = formData;
      updateMutation.mutate({
        id: selectedPatrimonio.id,
        data: {
          ...rest,
          dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : undefined,
          imageUrl,
        },
      });
    } catch (error) {
      setUploading(false);
      toast.error("Erro ao fazer upload da imagem");
    }
  };

  const handleDelete = () => {
    if (!selectedPatrimonio) return;
    deleteMutation.mutate({ id: selectedPatrimonio.id });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Patrimônios</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie o patrimônio de informática do Detran-RJ
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="hidden md:flex">
            <Plus className="mr-2 h-4 w-4" />
            Novo Patrimônio
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="icon" className="md:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
            <CardDescription>
              Pesquise e filtre patrimônios por diversos critérios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">
                  <Search className="inline h-4 w-4 mr-2" />
                  Buscar
                </Label>
                <Input
                  id="search"
                  placeholder="Descrição, número de série..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  placeholder="Filtrar por localização"
                  value={localizacaoFilter}
                  onChange={(e) => setLocalizacaoFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={semPatrimonioFilter}
                    onChange={(e) => setSemPatrimonioFilter(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Apenas sem patrimônio</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Patrimônios */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Package className="inline h-5 w-5 mr-2" />
              Lista de Patrimônios
            </CardTitle>
            <CardDescription>
              {patrimonios?.length || 0} patrimônio(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : patrimonios && patrimonios.length > 0 ? (
              <>
                {/* Visualização Desktop - Tabela */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Patrimônio</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patrimonios.map((patrimonio) => (
                        <TableRow key={patrimonio.id}>
                          <TableCell className="font-medium">{patrimonio.descricao}</TableCell>
                          <TableCell>{patrimonio.categoria}</TableCell>
                          <TableCell>{patrimonio.localizacao}</TableCell>
                          <TableCell>
                            {patrimonio.numeroSerie ? (
                              <span>{patrimonio.numeroSerie}</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-medium">
                                SEM PATRIMÔNIO
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{patrimonio.responsavel}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(patrimonio)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPatrimonio(patrimonio);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Visualização Mobile - Cards */}
                <div className="md:hidden space-y-3">
                  {patrimonios.map((patrimonio) => {
                    const corCard = categoriaCores[patrimonio.categoria] || categoriaCores["Outros"];
                    return (
                      <Card
                        key={patrimonio.id}
                        className={`${corCard} border-2 cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => setDetailsPatrimonio(patrimonio)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-base line-clamp-2">
                                {patrimonio.descricao}
                              </h3>
                              <Badge variant="outline" className="ml-2 shrink-0">
                                {patrimonio.categoria}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{patrimonio.localizacao}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Hash className="h-4 w-4 shrink-0" />
                              {patrimonio.numeroSerie ? (
                                <span className="font-mono">{patrimonio.numeroSerie}</span>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  SEM PATRIMÔNIO
                                </Badge>
                              )}
                            </div>

                            {patrimonio.responsavel && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Resp:</span> {patrimonio.responsavel}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum patrimônio encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Detalhes (Mobile) */}
        <Dialog open={!!detailsPatrimonio} onOpenChange={() => setDetailsPatrimonio(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Patrimônio</DialogTitle>
            </DialogHeader>
            {detailsPatrimonio && (
              <div className="space-y-4">
                {detailsPatrimonio.imageUrl && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={detailsPatrimonio.imageUrl}
                      alt={detailsPatrimonio.descricao}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Descrição</Label>
                    <p className="font-medium">{detailsPatrimonio.descricao}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Categoria</Label>
                      <p className="font-medium">{detailsPatrimonio.categoria}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Patrimônio</Label>
                      {detailsPatrimonio.numeroSerie ? (
                        <p className="font-mono text-sm">{detailsPatrimonio.numeroSerie}</p>
                      ) : (
                        <Badge variant="destructive" className="text-xs">SEM PATRIMÔNIO</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Localização</Label>
                    <p className="font-medium">{detailsPatrimonio.localizacao}</p>
                  </div>

                  {detailsPatrimonio.responsavel && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Responsável</Label>
                      <p className="font-medium">{detailsPatrimonio.responsavel}</p>
                    </div>
                  )}

                  {detailsPatrimonio.dataAquisicao && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Data de Aquisição</Label>
                      <p className="font-medium">
                        {new Date(detailsPatrimonio.dataAquisicao).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      handleEdit(detailsPatrimonio);
                      setDetailsPatrimonio(null);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      setSelectedPatrimonio(detailsPatrimonio);
                      setDetailsPatrimonio(null);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Criar Patrimônio */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Patrimônio</DialogTitle>
              <DialogDescription>
                Cadastre um novo item no patrimônio do Detran-RJ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="descricao">
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Notebook Dell Inspiron 15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria-create">
                  Categoria <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger id="categoria-create">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="localizacao-create">
                  Localização <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="localizacao-create"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  placeholder="Ex: 3º Andar - Sala 305"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numeroSerie">Número de Série / Patrimônio</Label>
                <Input
                  id="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                  placeholder="Ex: 123456"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
                <Input
                  id="dataAquisicao"
                  type="date"
                  value={formData.dataAquisicao}
                  onChange={(e) => setFormData({ ...formData, dataAquisicao: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Imagem</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || uploading}
              >
                {(createMutation.isPending || uploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Editar Patrimônio */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Patrimônio</DialogTitle>
              <DialogDescription>
                Atualize as informações do patrimônio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="descricao-edit">
                  Descrição <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="descricao-edit"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Notebook Dell Inspiron 15"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria-edit">
                  Categoria <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger id="categoria-edit">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="localizacao-edit">
                  Localização <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="localizacao-edit"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  placeholder="Ex: 3º Andar - Sala 305"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numeroSerie-edit">Número de Série / Patrimônio</Label>
                <Input
                  id="numeroSerie-edit"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                  placeholder="Ex: 123456"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavel-edit">Responsável</Label>
                <Input
                  id="responsavel-edit"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataAquisicao-edit">Data de Aquisição</Label>
                <Input
                  id="dataAquisicao-edit"
                  type="date"
                  value={formData.dataAquisicao}
                  onChange={(e) => setFormData({ ...formData, dataAquisicao: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image-edit">Imagem</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image-edit"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || uploading}
              >
                {(updateMutation.isPending || uploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmar Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este patrimônio? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
