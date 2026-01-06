/**
 * Funções para geração de relatórios
 */
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
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

/**
 * Gera relatório em PDF com identidade visual do Detran-RJ
 */
export async function gerarRelatorioPDF(): Promise<Buffer> {
  const patrimonios = await getAllPatrimonios();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Cores institucionais Detran-RJ
    const azulDetran = "#0066CC";
    const verdeDetran = "#00AA44";

    // Cabeçalho
    doc.fillColor(azulDetran)
      .fontSize(20)
      .text("DETRAN-RJ", { align: "center" })
      .fontSize(16)
      .text("Departamento de Tecnologia da Informação", { align: "center" })
      .fontSize(14)
      .fillColor("#333333")
      .text("Relatório de Patrimônios", { align: "center" })
      .moveDown(2);

    // Informações do relatório
    const dataGeracao = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    doc.fontSize(10)
      .fillColor("#666666")
      .text(`Data de Geração: ${dataGeracao}`, { align: "right" })
      .text(`Total de Itens: ${patrimonios.length}`, { align: "right" })
      .moveDown(2);

    // Agrupar por localização
    const patrimoniosPorLocal = patrimonios.reduce((acc, p) => {
      if (!acc[p.localizacao]) acc[p.localizacao] = [];
      acc[p.localizacao].push(p);
      return acc;
    }, {} as Record<string, typeof patrimonios>);

    // Ordenar localizações
    const localizacoesOrdenadas = Object.keys(patrimoniosPorLocal).sort();

    // Tabela de patrimônios por localização
    for (const localizacao of localizacoesOrdenadas) {
      const itens = patrimoniosPorLocal[localizacao];

      // Título da localização
      doc.fillColor(verdeDetran)
        .fontSize(12)
        .text(localizacao, { underline: true })
        .moveDown(0.5);

      // Cabeçalho da tabela
      const tableTop = doc.y;
      const colWidths = [200, 120, 100];
      const colX = [50, 250, 370];

      doc.fillColor("#333333")
        .fontSize(9)
        .text("Descrição", colX[0], tableTop, { width: colWidths[0] })
        .text("Categoria", colX[1], tableTop, { width: colWidths[1] })
        .text("Patrimônio", colX[2], tableTop, { width: colWidths[2] });

      doc.moveDown(0.3);
      doc.strokeColor("#CCCCCC").lineWidth(0.5)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();
      doc.moveDown(0.3);

      // Itens da tabela
      for (const item of itens) {
        const itemY = doc.y;

        // Verificar se precisa de nova página
        if (itemY > 700) {
          doc.addPage();
        }

        doc.fillColor("#000000")
          .fontSize(8)
          .text(item.descricao, colX[0], doc.y, { width: colWidths[0] })
          .text(item.categoria, colX[1], itemY, { width: colWidths[1] })
          .text(item.numeroSerie || "S/P", colX[2], itemY, { width: colWidths[2] });

        doc.moveDown(0.5);
      }

      doc.moveDown(1);
    }

    // Rodapé
    doc.moveDown(3);
    doc.strokeColor("#CCCCCC").lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(1);

    doc.fillColor("#666666")
      .fontSize(8)
      .text("Este documento foi gerado automaticamente pelo Sistema de Patrimônio DTIC - Detran-RJ", { align: "center" })
      .text(`Gerado em: ${dataGeracao}`, { align: "center" });

    doc.end();
  });
}
