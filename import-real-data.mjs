#!/usr/bin/env node
/**
 * Script para importar dados reais do Centro de Rede para o banco de dados
 */
import { drizzle } from 'drizzle-orm/mysql2';
import { patrimonios, users } from './drizzle/schema.ts';
import XLSX from 'xlsx';
import { eq } from 'drizzle-orm';

console.log('================================================================================');
console.log('IMPORTAÇÃO DE DADOS REAIS DO CENTRO DE REDE');
console.log('================================================================================\n');

// Conectar ao banco
const db = drizzle(process.env.DATABASE_URL);

// Ler a planilha
const filePath = '/home/ubuntu/upload/Inventário-CentrodeRede-3.xlsx';
console.log(`Reading Excel file: ${filePath}`);
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`✓ Found ${data.length} rows in spreadsheet\n`);

// Pegar o primeiro usuário do banco
const usersList = await db.select().from(users).limit(1);
if (usersList.length === 0) {
  console.error('ERROR: No users found in database. Please create a user first.');
  process.exit(1);
}

const userId = usersList[0].id;
console.log(`✓ Using user ID ${userId} as default responsible\n`);

// Mapeamento de categorias
const categoriaMap = {
  'SWITCH': 'Switch',
  'RACK': 'Rack',
  'ROTEADOR': 'Roteador',
  'FIREWALL': 'Firewall',
  'SERVIDOR': 'Servidor',
  'NO-BREAK': 'No-Break',
  'NOBREAK': 'No-Break',
  'ACCESS POINT': 'Access Point',
  'AP': 'Access Point',
};

// Processar dados
let importedCount = 0;
let skippedCount = 0;
let currentLocal = null;

console.log('================================================================================');
console.log('IMPORTING DATA');
console.log('================================================================================\n');

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  
  // Se a coluna Local não está vazia, atualizar o local atual
  if (row.Local && String(row.Local).trim()) {
    currentLocal = String(row.Local).trim();
  }
  
  // Pular linhas sem equipamento
  if (!row.Equipamento || !String(row.Equipamento).trim()) {
    skippedCount++;
    continue;
  }
  
  // Se não temos local definido, usar "Não especificado"
  if (!currentLocal) {
    currentLocal = "Não especificado";
  }
  
  // Extrair dados
  const equipamento = String(row.Equipamento).trim();
  const modelo = row.Modelo ? String(row.Modelo).trim() : "Não especificado";
  const patrimonioNum = row['Patrimônio'] ? String(row['Patrimônio']).trim() : `SN-${i+1}`;
  
  // Criar descrição completa
  const descricao = `${equipamento} - ${modelo}`;
  
  // Definir categoria baseada no tipo de equipamento
  let categoria = 'Outros';
  for (const [key, value] of Object.entries(categoriaMap)) {
    if (equipamento.toUpperCase().includes(key)) {
      categoria = value;
      break;
    }
  }
  
  // Valor padrão (pode ser ajustado depois)
  const valor = "0.00";
  
  // Data de aquisição padrão (pode ser ajustada depois)
  const dataAquisicao = new Date();
  
  // Responsável padrão
  const responsavel = "Centro de Rede - DTIC";
  
  // Número de série (usar número do patrimônio)
  const numeroSerie = patrimonioNum;
  
  // Inserir no banco
  try {
    await db.insert(patrimonios).values({
      descricao,
      categoria,
      valor,
      localizacao: currentLocal,
      numeroSerie,
      dataAquisicao,
      responsavel,
      userId,
    });
    
    importedCount++;
    
    if (importedCount % 20 === 0) {
      console.log(`  Imported ${importedCount} items...`);
    }
    
  } catch (error) {
    console.error(`ERROR importing row ${i + 1}:`, error.message);
    skippedCount++;
  }
}

console.log('\n================================================================================');
console.log('IMPORT SUMMARY');
console.log('================================================================================');
console.log(`✓ Successfully imported: ${importedCount} items`);
console.log(`✗ Skipped: ${skippedCount} items`);
console.log(`Total processed: ${data.length} rows`);
console.log('================================================================================\n');

process.exit(0);
