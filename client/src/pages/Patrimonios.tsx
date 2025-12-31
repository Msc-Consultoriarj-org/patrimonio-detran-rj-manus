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
import { Loader2, Plus, Search, Pencil, Trash2, Package } from "lucide-react";
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

  const { data: patrimonios, isLoading } = trpc.patrimonio.search.useQuery({
    searchTerm,
    categoria: categoriaFilter || undefined,
    localizacao: localizacaoFilter || undefined,
  });

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
    setSelectedPatrimonio(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      dataAquisicao: new Date(formData.dataAquisicao),
    });
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
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatrimonio) return;

    updateMutation.mutate({
      id: selectedPatrimonio.id,
      data: {
        ...formData,
        dataAquisicao: new Date(formData.dataAquisicao),
      },
    });
  };

  const handleDelete = (patrimonio: Patrimonio) => {
    setSelectedPatrimonio(patrimonio);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedPatrimonio) return;
    deleteMutation.mutate({ id: selectedPatrimonio.id });
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
            <div className="grid gap-4 md:grid-cols-3">
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
                      <TableHead>Valor</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Nº Série</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patrimonios.map((patrimonio) => (
                      <TableRow key={patrimonio.id}>
                        <TableCell className="font-medium">{patrimonio.descricao}</TableCell>
                        <TableCell>{patrimonio.categoria}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(Number(patrimonio.valor))}
                        </TableCell>
                        <TableCell>{patrimonio.localizacao}</TableCell>
                        <TableCell>{patrimonio.numeroSerie || "-"}</TableCell>
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
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
