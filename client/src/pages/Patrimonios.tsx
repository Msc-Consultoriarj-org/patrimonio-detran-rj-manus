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
import { toast } from "sonner";
import { Loader2, Plus, Search, Pencil, Trash2, Package, X, Image as ImageIcon } from "lucide-react";
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

export default function Patrimonios() {
  const utils = trpc.useUtils();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatrimonio, setSelectedPatrimonio] = useState<Patrimonio | null>(null);

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
    setSelectedPatrimonio(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      createMutation.mutate({
        ...formData,
        dataAquisicao: new Date(formData.dataAquisicao),
        imageUrl,
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (patrimonio: Patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setFormData({
      descricao: patrimonio.descricao,
      categoria: patrimonio.categoria,
      valor: patrimonio.valor,
      localizacao: patrimonio.localizacao,
      numeroSerie: patrimonio.numeroSerie || "",
      dataAquisicao: new Date(patrimonio.dataAquisicao).toISOString().split("T")[0],
      responsavel: patrimonio.responsavel,
    });
    // Carregar imagem existente se houver
    if (patrimonio.imageUrl) {
      setImagePreview(patrimonio.imageUrl);
    }
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatrimonio) return;
    setUploading(true);

    try {
      let imageUrl: string | undefined = selectedPatrimonio.imageUrl || undefined;

      // Upload de nova imagem se houver
      if (imageFile && imagePreview && !imagePreview.startsWith("http")) {
        const uploadResult = await uploadImageMutation.mutateAsync({
          base64: imagePreview,
          fileName: imageFile.name,
          mimeType: imageFile.type,
        });
        imageUrl = uploadResult.url;
      }

      updateMutation.mutate({
        id: selectedPatrimonio.id,
        data: {
          ...formData,
          dataAquisicao: new Date(formData.dataAquisicao),
          imageUrl,
        },
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (patrimonio: Patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedPatrimonio) return;
    deleteMutation.mutate({ id: selectedPatrimonio.id });
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Patrimônio
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

        {/* Tabela de Patrimônios */}
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
              <div className="overflow-x-auto">
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
                              onClick={() => handleDelete(patrimonio)}
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum patrimônio encontrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Patrimônio</DialogTitle>
            <DialogDescription>
              Preencha os dados do patrimônio de informática
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria-create">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
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
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="text"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao-create">Localização *</Label>
                <Input
                  id="localizacao-create"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroSerie">Número de Série</Label>
                <Input
                  id="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataAquisicao">Data de Aquisição *</Label>
                <Input
                  id="dataAquisicao"
                  type="date"
                  value={formData.dataAquisicao}
                  onChange={(e) => setFormData({ ...formData, dataAquisicao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="responsavel">Responsável *</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image-create">Foto do Patrimônio (Opcional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="image-create" className="cursor-pointer block">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Clique para adicionar foto (máx. 5MB)</p>
                      <input
                        id="image-create"
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || uploading}>
                {(createMutation.isPending || uploading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploading ? "Enviando..." : "Cadastrando..."}
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Patrimônio</DialogTitle>
            <DialogDescription>
              Atualize os dados do patrimônio
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="descricao-edit">Descrição *</Label>
                <Input
                  id="descricao-edit"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria-edit">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
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
              <div className="space-y-2">
                <Label htmlFor="valor-edit">Valor (R$) *</Label>
                <Input
                  id="valor-edit"
                  type="text"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao-edit">Localização *</Label>
                <Input
                  id="localizacao-edit"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroSerie-edit">Número de Série</Label>
                <Input
                  id="numeroSerie-edit"
                  value={formData.numeroSerie}
                  onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataAquisicao-edit">Data de Aquisição *</Label>
                <Input
                  id="dataAquisicao-edit"
                  type="date"
                  value={formData.dataAquisicao}
                  onChange={(e) => setFormData({ ...formData, dataAquisicao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="responsavel-edit">Responsável *</Label>
                <Input
                  id="responsavel-edit"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image-edit">Foto do Patrimônio (Opcional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="image-edit" className="cursor-pointer block">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Clique para adicionar foto (máx. 5MB)</p>
                      <input
                        id="image-edit"
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || uploading}>
                {(updateMutation.isPending || uploading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o patrimônio "{selectedPatrimonio?.descricao}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPatrimonio(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
