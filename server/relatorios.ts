/**
 * Funções para geração de relatórios
 */
import * as XLSX from "xlsx";
import { getAllPatrimonios } from "./db";

/**
 * Gera relatório Excel de patrimônios
 */
export async function gerarRelatorioExcel(): Promise<Buffer> {
  // Buscar todos os patrimônios
  const patrimonios = await getAllPatrimonios();

  // Ordenar por localização (andar) e categoria (equipamento)
  const patrimoniosOrdenados = patrimonios.sort((a, b) => {
    // Primeiro por localização
    const locA = a.localizacao.toLowerCase();
    const locB = b.localizacao.toLowerCase();
    if (locA < locB) return -1;
    if (locA > locB) return 1;

    // Depois por categoria
    const catA = a.categoria.toLowerCase();
    const catB = b.categoria.toLowerCase();
    if (catA < catB) return -1;
    if (catA > catB) return 1;

    // Por fim por descrição
    return a.descricao.localeCompare(b.descricao);
  });

  // Preparar dados para Excel
  const dados = patrimoniosOrdenados.map((p) => ({
    "Localização": p.localizacao,
    "Equipamento": p.categoria,
    "Descrição": p.descricao,
    "Patrimônio": p.numeroSerie || "SEM PATRIMÔNIO",
    "Responsável": p.responsavel,
    "Data de Aquisição": p.dataAquisicao
      ? new Date(p.dataAquisicao).toLocaleDateString("pt-BR")
      : "-",
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dados);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 20 }, // Localização
    { wch: 15 }, // Equipamento
    { wch: 40 }, // Descrição
    { wch: 15 }, // Patrimônio
    { wch: 25 }, // Responsável
    { wch: 15 }, // Data de Aquisição
  ];
  ws["!cols"] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Patrimônios");

  // Gerar buffer
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return buffer;
}

/**
 * Gera relatório de patrimônios por localização
 */
export async function gerarRelatorioPorLocalizacao(): Promise<Buffer> {
  const patrimonios = await getAllPatrimonios();

  // Agrupar por localização
  const porLocalizacao = patrimonios.reduce((acc, p) => {
    if (!acc[p.localizacao]) {
      acc[p.localizacao] = [];
    }
    acc[p.localizacao].push(p);
    return acc;
  }, {} as Record<string, typeof patrimonios>);

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Criar uma aba para cada localização
  Object.keys(porLocalizacao)
    .sort()
    .forEach((localizacao) => {
      const items = porLocalizacao[localizacao].sort((a, b) =>
        a.categoria.localeCompare(b.categoria)
      );

      const dados = items.map((p) => ({
        "Equipamento": p.categoria,
        "Descrição": p.descricao,
        "Patrimônio": p.numeroSerie || "SEM PATRIMÔNIO",
        "Responsável": p.responsavel,
      }));

      const ws = XLSX.utils.json_to_sheet(dados);
      ws["!cols"] = [
        { wch: 15 }, // Equipamento
        { wch: 40 }, // Descrição
        { wch: 15 }, // Patrimônio
        { wch: 25 }, // Responsável
      ];

      // Nome da aba (limitado a 31 caracteres)
      const sheetName = localizacao.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
}
