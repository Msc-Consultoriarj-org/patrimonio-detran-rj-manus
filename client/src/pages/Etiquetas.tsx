import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  QrCode, 
  Printer, 
  Search, 
  CheckSquare, 
  Square,
  Download,
  RefreshCw,
  Tag
} from "lucide-react";

type Patrimonio = {
  id: number;
  descricao: string;
  categoria: string;
  localizacao: string;
  numeroSerie: string | null;
  responsavel: string;
  valor: string;
  dataAquisicao: Date;
  imageUrl: string | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

type EtiquetaSize = "small" | "medium" | "large";

export default function Etiquetas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [etiquetaSize, setEtiquetaSize] = useState<EtiquetaSize>("medium");
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Query para listar patrimônios
  const { data: patrimonios, isLoading, refetch } = trpc.patrimonio.list.useQuery();

  // Filtrar patrimônios pela busca
  const filteredPatrimonios = patrimonios?.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.descricao.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term) ||
      p.localizacao.toLowerCase().includes(term) ||
      (p.numeroSerie?.toLowerCase().includes(term)) ||
      (p.responsavel?.toLowerCase().includes(term))
    );
  }) || [];

  // Patrimônios selecionados
  const selectedPatrimonios = patrimonios?.filter((p) => selectedIds.includes(p.id)) || [];

  // Toggle seleção de um patrimônio
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Selecionar/deselecionar todos os filtrados
  const toggleSelectAll = () => {
    const filteredIds = filteredPatrimonios.map((p) => p.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Gerar e imprimir etiquetas
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um patrimônio");
      return;
    }
    setShowPreview(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Tamanhos das etiquetas
  const sizeConfig = {
    small: { width: "50mm", height: "25mm", qrSize: 60, fontSize: "8px" },
    medium: { width: "70mm", height: "35mm", qrSize: 80, fontSize: "10px" },
    large: { width: "100mm", height: "50mm", qrSize: 120, fontSize: "12px" },
  };

  const currentSize = sizeConfig[etiquetaSize];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#005A92] to-[#00A651] bg-clip-text text-transparent">
              Geração de Etiquetas
            </h1>
            <p className="text-muted-foreground mt-2">
              Gere etiquetas com QR Code para identificação de patrimônios
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button 
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="bg-gradient-to-r from-[#005A92] to-[#00A651]"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir ({selectedIds.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Seleção */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Selecionar Patrimônios
                </CardTitle>
                <CardDescription>
                  Escolha os patrimônios para gerar etiquetas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca e ações */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por descrição, categoria, localização..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={toggleSelectAll}>
                    {filteredPatrimonios.every((p) => selectedIds.includes(p.id)) ? (
                      <>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Desmarcar Todos
                      </>
                    ) : (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Selecionar Todos
                      </>
                    )}
                  </Button>
                </div>

                {/* Lista de patrimônios */}
                <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredPatrimonios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum patrimônio encontrado
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredPatrimonios.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedIds.includes(p.id) ? "bg-primary/10" : ""
                          }`}
                          onClick={() => toggleSelection(p.id)}
                        >
                          <Checkbox
                            checked={selectedIds.includes(p.id)}
                            onCheckedChange={() => toggleSelection(p.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{p.descricao}</p>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                              <span>{p.categoria}</span>
                              <span>•</span>
                              <span>{p.localizacao}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            {p.numeroSerie ? (
                              <Badge variant="outline">{p.numeroSerie}</Badge>
                            ) : (
                              <Badge variant="secondary">S/P</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {selectedIds.length} de {patrimonios?.length || 0} patrimônios selecionados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Configuração */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tamanho da Etiqueta</Label>
                  <Select value={etiquetaSize} onValueChange={(v) => setEtiquetaSize(v as EtiquetaSize)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequena (50x25mm)</SelectItem>
                      <SelectItem value="medium">Média (70x35mm)</SelectItem>
                      <SelectItem value="large">Grande (100x50mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Informações na Etiqueta:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Logo do Detran-RJ</li>
                    <li>• QR Code com número de série</li>
                    <li>• Número do patrimônio</li>
                    <li>• Descrição do equipamento</li>
                    <li>• Localização</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preview de Etiqueta */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatrimonios.length > 0 ? (
                  <div 
                    className="border-2 border-dashed border-primary/30 rounded-lg p-4 flex flex-col items-center justify-center"
                    style={{ 
                      width: currentSize.width, 
                      height: currentSize.height,
                      fontSize: currentSize.fontSize 
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src="/LogoDetran.png" 
                        alt="Detran-RJ" 
                        className="h-6 object-contain"
                      />
                      <span className="font-bold text-[#005A92]">DETRAN-RJ</span>
                    </div>
                    <div 
                      className="bg-gray-200 flex items-center justify-center mb-2"
                      style={{ width: currentSize.qrSize * 0.6, height: currentSize.qrSize * 0.6 }}
                    >
                      <QrCode className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="font-bold text-center truncate w-full">
                      {selectedPatrimonios[0].numeroSerie || "S/P"}
                    </p>
                    <p className="text-center truncate w-full text-muted-foreground">
                      {selectedPatrimonios[0].descricao.substring(0, 20)}...
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Selecione um patrimônio para visualizar
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Área de Impressão (oculta na tela, visível na impressão) */}
        <div className="hidden print:block" ref={printRef}>
          <style>
            {`
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
                body * {
                  visibility: hidden;
                }
                .print-area, .print-area * {
                  visibility: visible;
                }
                .print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
              }
            `}
          </style>
          <div className="print-area grid grid-cols-2 gap-4 p-4">
            {selectedPatrimonios.map((p) => (
              <EtiquetaItem key={p.id} patrimonio={p} size={etiquetaSize} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Componente de Etiqueta Individual
function EtiquetaItem({ patrimonio, size }: { patrimonio: Patrimonio; size: EtiquetaSize }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    // Gerar QR Code no cliente
    const generateQR = async () => {
      try {
        const QRCode = await import("qrcode");
        const data = patrimonio.numeroSerie || `PAT-${patrimonio.id}`;
        const url = await QRCode.toDataURL(data, {
          width: size === "small" ? 60 : size === "medium" ? 80 : 120,
          margin: 1,
          color: {
            dark: "#005A92",
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("Erro ao gerar QR Code:", err);
      }
    };
    generateQR();
  }, [patrimonio, size]);

  const sizeConfig = {
    small: { width: "50mm", height: "25mm", qrSize: "15mm", fontSize: "7px" },
    medium: { width: "70mm", height: "35mm", qrSize: "20mm", fontSize: "9px" },
    large: { width: "100mm", height: "50mm", qrSize: "30mm", fontSize: "11px" },
  };

  const config = sizeConfig[size];

  return (
    <div
      className="border border-gray-300 rounded p-2 flex gap-2 bg-white"
      style={{ width: config.width, height: config.height, fontSize: config.fontSize }}
    >
      {/* QR Code */}
      <div className="flex-shrink-0 flex items-center justify-center">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR Code" style={{ width: config.qrSize, height: config.qrSize }} />
        ) : (
          <div 
            className="bg-gray-200 flex items-center justify-center"
            style={{ width: config.qrSize, height: config.qrSize }}
          >
            <QrCode className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-1 mb-1">
          <img src="/LogoDetran.png" alt="Detran" className="h-3" />
          <span className="font-bold text-[#005A92]">DETRAN-RJ</span>
        </div>
        <p className="font-bold truncate">
          {patrimonio.numeroSerie || "S/P"}
        </p>
        <p className="truncate text-gray-600">
          {patrimonio.descricao}
        </p>
        <p className="truncate text-gray-500">
          {patrimonio.localizacao}
        </p>
      </div>
    </div>
  );
}
