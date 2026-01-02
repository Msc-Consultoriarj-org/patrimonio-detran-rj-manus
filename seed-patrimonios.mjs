import { drizzle } from "drizzle-orm/mysql2";
import { patrimonios } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Dados de teste bem variados para testar todas as funcionalidades
const patrimoniosTest = [
  // Computadores - 1º Andar (10 itens)
  { descricao: "Computador Dell OptiPlex 7090", categoria: "Computador", valor: "4500.00", localizacao: "1º Andar - Sala 101", numeroSerie: "DELL-2024-001", dataAquisicao: new Date("2024-01-15"), responsavel: "João Silva" },
  { descricao: "Computador HP EliteDesk 800", categoria: "Computador", valor: "4200.00", localizacao: "1º Andar - Sala 102", numeroSerie: "HP-2024-001", dataAquisicao: new Date("2024-01-20"), responsavel: "Maria Santos" },
  { descricao: "Computador Lenovo ThinkCentre", categoria: "Computador", valor: "3800.00", localizacao: "1º Andar - Sala 103", numeroSerie: "LEN-2024-001", dataAquisicao: new Date("2024-02-10"), responsavel: "Pedro Costa" },
  { descricao: "Computador Dell Vostro 3681", categoria: "Computador", valor: "3500.00", localizacao: "1º Andar - Sala 104", numeroSerie: "DELL-2024-002", dataAquisicao: new Date("2024-02-15"), responsavel: "Ana Paula" },
  { descricao: "Computador HP ProDesk 400", categoria: "Computador", valor: "3200.00", localizacao: "1º Andar - Sala 105", numeroSerie: "HP-2024-002", dataAquisicao: new Date("2024-03-01"), responsavel: "Carlos Mendes" },
  { descricao: "Computador Lenovo V50s", categoria: "Computador", valor: "2900.00", localizacao: "1º Andar - Recepção", numeroSerie: "LEN-2024-002", dataAquisicao: new Date("2024-03-10"), responsavel: "Juliana Lima" },
  { descricao: "Computador Dell Inspiron 3880", categoria: "Computador", valor: "2800.00", localizacao: "1º Andar - Sala 106", numeroSerie: "DELL-2024-003", dataAquisicao: new Date("2024-03-20"), responsavel: "Roberto Alves" },
  { descricao: "Computador HP Slim Desktop", categoria: "Computador", valor: "2600.00", localizacao: "1º Andar - Sala 107", numeroSerie: "HP-2024-003", dataAquisicao: new Date("2024-04-05"), responsavel: "Fernanda Rocha" },
  { descricao: "Computador Lenovo IdeaCentre", categoria: "Computador", valor: "2400.00", localizacao: "1º Andar - Sala 108", numeroSerie: "LEN-2024-003", dataAquisicao: new Date("2024-04-15"), responsavel: "Lucas Martins" },
  { descricao: "Computador Dell OptiPlex 3080", categoria: "Computador", valor: "3900.00", localizacao: "1º Andar - Sala 109", numeroSerie: "DELL-2024-004", dataAquisicao: new Date("2024-05-01"), responsavel: "Patricia Souza" },

  // Monitores - 2º Andar (10 itens)
  { descricao: "Monitor LG 24 polegadas Full HD", categoria: "Monitor", valor: "800.00", localizacao: "2º Andar - Sala 201", numeroSerie: "LG-MON-001", dataAquisicao: new Date("2024-01-10"), responsavel: "João Silva" },
  { descricao: "Monitor Samsung 27 polegadas 4K", categoria: "Monitor", valor: "1500.00", localizacao: "2º Andar - Sala 202", numeroSerie: "SAM-MON-001", dataAquisicao: new Date("2024-01-25"), responsavel: "Maria Santos" },
  { descricao: "Monitor Dell 22 polegadas", categoria: "Monitor", valor: "700.00", localizacao: "2º Andar - Sala 203", numeroSerie: "DELL-MON-001", dataAquisicao: new Date("2024-02-05"), responsavel: "Pedro Costa" },
  { descricao: "Monitor AOC 24 polegadas", categoria: "Monitor", valor: "650.00", localizacao: "2º Andar - Sala 204", numeroSerie: "AOC-MON-001", dataAquisicao: new Date("2024-02-20"), responsavel: "Ana Paula" },
  { descricao: "Monitor LG 27 polegadas UltraWide", categoria: "Monitor", valor: "1800.00", localizacao: "2º Andar - Sala 205", numeroSerie: "LG-MON-002", dataAquisicao: new Date("2024-03-05"), responsavel: "Carlos Mendes" },
  { descricao: "Monitor Samsung 24 polegadas Curvo", categoria: "Monitor", valor: "1200.00", localizacao: "2º Andar - Sala 206", numeroSerie: "SAM-MON-002", dataAquisicao: new Date("2024-03-15"), responsavel: "Juliana Lima" },
  { descricao: "Monitor Dell 27 polegadas", categoria: "Monitor", valor: "1100.00", localizacao: "2º Andar - Sala 207", numeroSerie: "DELL-MON-002", dataAquisicao: new Date("2024-04-01"), responsavel: "Roberto Alves" },
  { descricao: "Monitor AOC 27 polegadas", categoria: "Monitor", valor: "950.00", localizacao: "2º Andar - Sala 208", numeroSerie: "AOC-MON-002", dataAquisicao: new Date("2024-04-10"), responsavel: "Fernanda Rocha" },
  { descricao: "Monitor LG 22 polegadas", categoria: "Monitor", valor: "600.00", localizacao: "2º Andar - Sala 209", numeroSerie: "LG-MON-003", dataAquisicao: new Date("2024-04-25"), responsavel: "Lucas Martins" },
  { descricao: "Monitor Samsung 32 polegadas 4K", categoria: "Monitor", valor: "2200.00", localizacao: "2º Andar - Sala 210", numeroSerie: "SAM-MON-003", dataAquisicao: new Date("2024-05-10"), responsavel: "Patricia Souza" },

  // Impressoras - 3º Andar (8 itens)
  { descricao: "Impressora HP LaserJet Pro M404", categoria: "Impressora", valor: "1800.00", localizacao: "3º Andar - Copa", numeroSerie: "HP-IMP-001", dataAquisicao: new Date("2024-01-05"), responsavel: "João Silva" },
  { descricao: "Impressora Epson EcoTank L3250", categoria: "Impressora", valor: "1200.00", localizacao: "3º Andar - Sala 301", numeroSerie: "EPS-IMP-001", dataAquisicao: new Date("2024-01-30"), responsavel: "Maria Santos" },
  { descricao: "Impressora Brother DCP-L2540DW", categoria: "Impressora", valor: "1500.00", localizacao: "3º Andar - Sala 302", numeroSerie: "BRO-IMP-001", dataAquisicao: new Date("2024-02-25"), responsavel: "Pedro Costa" },
  { descricao: "Impressora HP DeskJet 2774", categoria: "Impressora", valor: "500.00", localizacao: "3º Andar - Sala 303", numeroSerie: "HP-IMP-002", dataAquisicao: new Date("2024-03-10"), responsavel: "Ana Paula" },
  { descricao: "Impressora Epson L4260", categoria: "Impressora", valor: "1600.00", localizacao: "3º Andar - Sala 304", numeroSerie: "EPS-IMP-002", dataAquisicao: new Date("2024-03-25"), responsavel: "Carlos Mendes" },
  { descricao: "Impressora Brother HL-L2350DW", categoria: "Impressora", valor: "900.00", localizacao: "3º Andar - Corredor", numeroSerie: "BRO-IMP-002", dataAquisicao: new Date("2024-04-20"), responsavel: "Juliana Lima" },
  { descricao: "Impressora HP LaserJet Pro M428", categoria: "Impressora", valor: "3200.00", localizacao: "3º Andar - Sala 305", numeroSerie: "HP-IMP-003", dataAquisicao: new Date("2024-05-05"), responsavel: "Roberto Alves" },
  { descricao: "Impressora Epson WorkForce Pro", categoria: "Impressora", valor: "2800.00", localizacao: "3º Andar - Sala 306", numeroSerie: "EPS-IMP-003", dataAquisicao: new Date("2024-05-20"), responsavel: "Fernanda Rocha" },

  // Notebooks - 4º Andar (10 itens)
  { descricao: "Notebook Dell Latitude 5420", categoria: "Notebook", valor: "5500.00", localizacao: "4º Andar - Sala 401", numeroSerie: "DELL-NB-001", dataAquisicao: new Date("2024-01-08"), responsavel: "João Silva" },
  { descricao: "Notebook HP EliteBook 840", categoria: "Notebook", valor: "6200.00", localizacao: "4º Andar - Sala 402", numeroSerie: "HP-NB-001", dataAquisicao: new Date("2024-01-22"), responsavel: "Maria Santos" },
  { descricao: "Notebook Lenovo ThinkPad E14", categoria: "Notebook", valor: "4800.00", localizacao: "4º Andar - Sala 403", numeroSerie: "LEN-NB-001", dataAquisicao: new Date("2024-02-12"), responsavel: "Pedro Costa" },
  { descricao: "Notebook Dell Inspiron 15 3000", categoria: "Notebook", valor: "3500.00", localizacao: "4º Andar - Sala 404", numeroSerie: "DELL-NB-002", dataAquisicao: new Date("2024-02-28"), responsavel: "Ana Paula" },
  { descricao: "Notebook HP Pavilion 15", categoria: "Notebook", valor: "4200.00", localizacao: "4º Andar - Sala 405", numeroSerie: "HP-NB-002", dataAquisicao: new Date("2024-03-12"), responsavel: "Carlos Mendes" },
  { descricao: "Notebook Lenovo IdeaPad 3", categoria: "Notebook", valor: "3200.00", localizacao: "4º Andar - Sala 406", numeroSerie: "LEN-NB-002", dataAquisicao: new Date("2024-03-28"), responsavel: "Juliana Lima" },
  { descricao: "Notebook Dell Vostro 15 3510", categoria: "Notebook", valor: "3800.00", localizacao: "4º Andar - Sala 407", numeroSerie: "DELL-NB-003", dataAquisicao: new Date("2024-04-08"), responsavel: "Roberto Alves" },
  { descricao: "Notebook HP ProBook 450", categoria: "Notebook", valor: "5800.00", localizacao: "4º Andar - Sala 408", numeroSerie: "HP-NB-003", dataAquisicao: new Date("2024-04-22"), responsavel: "Fernanda Rocha" },
  { descricao: "Notebook Lenovo ThinkPad L15", categoria: "Notebook", valor: "5200.00", localizacao: "4º Andar - Sala 409", numeroSerie: "LEN-NB-003", dataAquisicao: new Date("2024-05-08"), responsavel: "Lucas Martins" },
  { descricao: "Notebook Dell Latitude 3520", categoria: "Notebook", valor: "4600.00", localizacao: "4º Andar - Sala 410", numeroSerie: "DELL-NB-004", dataAquisicao: new Date("2024-05-25"), responsavel: "Patricia Souza" },

  // Servidores e Equipamentos de Rede - 5º Andar (12 itens)
  { descricao: "Servidor Dell PowerEdge T340", categoria: "Servidor", valor: "12000.00", localizacao: "5º Andar - Data Center", numeroSerie: "DELL-SRV-001", dataAquisicao: new Date("2024-01-12"), responsavel: "João Silva" },
  { descricao: "Servidor HP ProLiant ML350", categoria: "Servidor", valor: "15000.00", localizacao: "5º Andar - Data Center", numeroSerie: "HP-SRV-001", dataAquisicao: new Date("2024-02-08"), responsavel: "Maria Santos" },
  { descricao: "Switch Cisco Catalyst 2960", categoria: "Switch", valor: "3500.00", localizacao: "5º Andar - Rack A", numeroSerie: "CISCO-SW-001", dataAquisicao: new Date("2024-01-18"), responsavel: "Pedro Costa" },
  { descricao: "Switch HP Aruba 2530", categoria: "Switch", valor: "2800.00", localizacao: "5º Andar - Rack B", numeroSerie: "HP-SW-001", dataAquisicao: new Date("2024-02-22"), responsavel: "Ana Paula" },
  { descricao: "Roteador Cisco ISR 4331", categoria: "Roteador", valor: "8500.00", localizacao: "5º Andar - Sala de Rede", numeroSerie: "CISCO-RT-001", dataAquisicao: new Date("2024-03-08"), responsavel: "Carlos Mendes" },
  { descricao: "Firewall FortiGate 60F", categoria: "Firewall", valor: "6500.00", localizacao: "5º Andar - Sala de Rede", numeroSerie: "FORTI-FW-001", dataAquisicao: new Date("2024-03-22"), responsavel: "Juliana Lima" },
  { descricao: "No-Break APC Smart-UPS 3000VA", categoria: "No-Break", valor: "4200.00", localizacao: "5º Andar - Data Center", numeroSerie: "APC-UPS-001", dataAquisicao: new Date("2024-04-05"), responsavel: "Roberto Alves" },
  { descricao: "No-Break SMS 2200VA", categoria: "No-Break", valor: "1800.00", localizacao: "5º Andar - Rack A", numeroSerie: "SMS-UPS-001", dataAquisicao: new Date("2024-04-18"), responsavel: "Fernanda Rocha" },
  { descricao: "Switch D-Link DGS-1210-28", categoria: "Switch", valor: "1500.00", localizacao: "5º Andar - Rack C", numeroSerie: "DLINK-SW-001", dataAquisicao: new Date("2024-05-02"), responsavel: "Lucas Martins" },
  { descricao: "Roteador TP-Link TL-R600VPN", categoria: "Roteador", valor: "800.00", localizacao: "5º Andar - Sala 501", numeroSerie: "TPL-RT-001", dataAquisicao: new Date("2024-05-15"), responsavel: "Patricia Souza" },
  { descricao: "Servidor Lenovo ThinkSystem ST50", categoria: "Servidor", valor: "9500.00", localizacao: "5º Andar - Data Center", numeroSerie: "LEN-SRV-001", dataAquisicao: new Date("2024-05-28"), responsavel: "João Silva" },
  { descricao: "Switch Cisco SG350-28", categoria: "Switch", valor: "2200.00", localizacao: "5º Andar - Rack D", numeroSerie: "CISCO-SW-002", dataAquisicao: new Date("2024-06-10"), responsavel: "Maria Santos" },
];

async function seed() {
  try {
    console.log("🌱 Iniciando seed de patrimônios de teste...");

    // Buscar o ID do usuário moises para associar aos patrimônios
    const userId = 1; // ID do usuário moises

    // Inserir patrimônios
    for (const patrimonio of patrimoniosTest) {
      await db.insert(patrimonios).values({
        ...patrimonio,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ ${patrimoniosTest.length} patrimônios de teste criados com sucesso!`);
    console.log("\n📊 Resumo:");
    console.log("- Computadores: 10 itens (1º Andar)");
    console.log("- Monitores: 10 itens (2º Andar)");
    console.log("- Impressoras: 8 itens (3º Andar)");
    console.log("- Notebooks: 10 itens (4º Andar)");
    console.log("- Servidores e Rede: 12 itens (5º Andar)");
    console.log("\n💡 Todos os itens são dados de teste para validação do sistema.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar patrimônios de teste:", error);
    process.exit(1);
  }
}

seed();
