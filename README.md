# Sistema de Gerenciamento de Patrimônio DTIC - Detran-RJ

Sistema completo de gestão de patrimônio desenvolvido para o Departamento de Tecnologia da Informação e Comunicação (DTIC) do Detran-RJ. Aplicação fullstack moderna com autenticação simplificada, CRUD completo, dashboard analítico, importação em massa via CSV/Excel e identidade visual oficial do Detran-RJ.

---

## 🎯 Funcionalidades Principais

### Autenticação e Usuários
- **Login simplificado** por nome de usuário (sem senha)
- **Três usuários pré-configurados**: moises, pedro, phelipe
- **Perfil de usuário editável** (nome, email)
- **Sistema de logout** com limpeza de sessão

### Gestão de Patrimônios
- **CRUD completo** (Criar, Ler, Atualizar, Deletar)
- **Campos do patrimônio**: descrição, categoria, valor, localização, número de série, data de aquisição, responsável, imagem
- **Upload de imagem** integrado com S3
- **Busca avançada** por descrição e número de série
- **Filtros** por categoria e localização
- **Validação rigorosa** de dados no frontend e backend

### Dashboard Analítico
- **Cards de estatísticas**: Total de Patrimônios, Valor Total, Categorias, Localizações
- **Gráfico de pizza**: Distribuição por Categoria
- **Gráfico de barras**: Valor investido por Categoria
- **Gráfico de pizza**: Distribuição por Localização
- **Gráfico de barras**: Valor investido por Localização
- **Cores institucionais** do Detran-RJ (azul #0066CC e verde #00AA44)

### Módulo de Levantamento
- **Formulário completo** para cadastro de patrimônio
- **Upload de imagem** com preview
- **Validação em tempo real**
- **Feedback visual** de sucesso/erro

### Sistema de Sugestões
- **Formulário de sugestões** para melhorias do sistema
- **Listagem de sugestões** enviadas
- **Categorização** (Melhoria, Bug, Nova Funcionalidade, Outro)

### Upload de Imagem
- **Upload individual** de fotos de patrimônios
- **Campos obrigatórios**: imagem, número de patrimônio, localização
- **Campos opcionais**: descrição, número de série
- **Tela de confirmação** antes de salvar
- **Feedback visual** de progresso

### Relatórios
- **Exportação em CSV**: Dados tabulares para Excel
- **Exportação em PDF**: Relatório formatado
- **Exportação em Markdown**: Documentação técnica
- **Visualização no sistema**: Preview antes de exportar
- **Filtros**: Por categoria e localização

### Upload CSV em Massa
- **Suporte a múltiplos formatos**: CSV, XLSX, XLS
- **Detecção automática** de delimitadores
- **Validação rigorosa**: Campos obrigatórios, formatos, duplicatas
- **Preview visual interativo**: Tabela com destaque de erros
- **Edição inline**: Corrigir dados antes de importar
- **Mapeamento de colunas**: Automático e manual
- **Importação em lote**: Processar múltiplos registros
- **Feedback de progresso**: Barra e log detalhado
- **Template CSV**: Download de exemplo

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos interativos
- **Wouter** - Roteamento
- **tRPC** - Client type-safe
- **React Query** - Cache e estado
- **Zod** - Validação de schemas
- **Sonner** - Toast notifications
- **Lucide React** - Ícones

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Framework web
- **tRPC 11** - API type-safe
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Banco de dados
- **bcryptjs** - Hash de senhas (legacy)
- **cookie** - Gerenciamento de cookies
- **jose** - JWT tokens
- **xlsx** - Parser Excel
- **@aws-sdk/client-s3** - Upload S3

### DevOps e Ferramentas
- **pnpm** - Gerenciador de pacotes
- **Vite** - Build tool
- **Vitest** - Framework de testes
- **tsx** - TypeScript executor
- **ESBuild** - Bundler
- **Drizzle Kit** - Migrations

---

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 22.x ou superior
- pnpm 10.x ou superior
- MySQL 8.x ou TiDB
- Conta AWS S3 (para upload de imagens)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/patrimonio-detran-rj.git
cd patrimonio-detran-rj

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Execute as migrations do banco de dados
pnpm db:push

# Crie os usuários iniciais (moises, pedro, phelipe)
npx tsx seed-users.mjs

# (Opcional) Crie 50 patrimônios de teste
npx tsx seed-patrimonios.mjs

# Inicie o servidor de desenvolvimento
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

---

## 🚀 Uso do Sistema

### Login
1. Acesse a página inicial
2. Digite um dos usuários disponíveis: **moises**, **pedro** ou **phelipe**
3. Clique em "Entrar"
4. Você será redirecionado para o dashboard

### Cadastrar Patrimônio
1. Acesse o menu "Levantamento" ou "Patrimônios"
2. Clique em "Novo Patrimônio"
3. Preencha os campos obrigatórios:
   - Descrição
   - Categoria
   - Valor
   - Localização
4. (Opcional) Adicione imagem, número de série, data de aquisição e responsável
5. Clique em "Salvar"

### Importar Patrimônios via CSV
1. Acesse o menu "Upload CSV"
2. Faça download do template CSV de exemplo
3. Preencha a planilha com seus dados
4. Arraste o arquivo para a área de upload ou clique para selecionar
5. Revise os dados na tabela de preview
6. Corrija erros diretamente na tabela (edição inline)
7. Clique em "Importar Registros Válidos"

### Gerar Relatórios
1. Acesse o menu "Relatórios"
2. (Opcional) Aplique filtros por categoria e localização
3. Escolha o formato de exportação: CSV, PDF ou Markdown
4. Clique em "Exportar"
5. O arquivo será baixado automaticamente

### Enviar Sugestões
1. Acesse o menu "Sugestões"
2. Preencha o título e descrição da sugestão
3. Selecione a categoria (Melhoria, Bug, Nova Funcionalidade, Outro)
4. Clique em "Enviar Sugestão"

---

## 📊 Estrutura do Banco de Dados

### Tabela `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  username VARCHAR(64) UNIQUE,
  passwordHash TEXT,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  mustChangePassword BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `patrimonios`
```sql
CREATE TABLE patrimonios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  localizacao VARCHAR(200) NOT NULL,
  numeroSerie VARCHAR(100),
  dataAquisicao DATE,
  responsavel VARCHAR(200),
  imageUrl TEXT,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Tabela `sugestoes`
```sql
CREATE TABLE sugestoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test --watch

# Executar testes com coverage
pnpm test --coverage
```

### Testes Implementados
- ✅ Autenticação (login, logout)
- ✅ CRUD de patrimônios
- ✅ Validação de dados
- ✅ Queries agregadas (analytics)

---

## 📁 Estrutura de Diretórios

```
patrimonio-detran-rj/
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos (logo, favicon)
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       ├── pages/         # Páginas da aplicação
│       ├── lib/           # Bibliotecas e configurações
│       ├── hooks/         # Custom hooks
│       ├── contexts/      # React contexts
│       ├── App.tsx        # Rotas principais
│       ├── main.tsx       # Entry point
│       └── index.css      # Estilos globais
├── server/                # Backend Express + tRPC
│   ├── _core/            # Infraestrutura (auth, context, etc)
│   ├── db.ts             # Helpers de banco de dados
│   ├── routers.ts        # Routers tRPC
│   └── storage.ts        # Helpers S3
├── drizzle/              # Schema e migrations
│   └── schema.ts         # Definição de tabelas
├── shared/               # Código compartilhado
│   └── const.ts          # Constantes
├── docs/                 # Documentação do projeto
├── seed-users.mjs        # Script de seed de usuários
├── seed-patrimonios.mjs  # Script de seed de patrimônios
├── package.json          # Dependências
├── tsconfig.json         # Configuração TypeScript
├── vite.config.ts        # Configuração Vite
└── README.md             # Este arquivo
```

---

## 🎨 Identidade Visual

O sistema utiliza a identidade visual oficial do Detran-RJ:

### Cores Principais
- **Azul Primário**: `#0066CC` - Usado em botões, links e elementos principais
- **Verde Secundário**: `#00AA44` - Usado em destaques e elementos secundários
- **Degradê**: Azul → Verde em banners e headers

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Logo
- Logo oficial do Detran-RJ em PNG
- Localização: `/client/public/LogoDetran.png`

---

## 👥 Usuários Pré-configurados

| Usuário | Função | Descrição |
|---------|--------|-----------|
| moises  | admin  | Administrador do sistema |
| pedro   | admin  | Administrador do sistema |
| phelipe | admin  | Administrador do sistema |

**Nota**: O sistema usa autenticação simplificada por nome de usuário. Basta digitar o nome para fazer login.

---

## 📝 Dados de Teste

O sistema inclui 50 patrimônios de teste organizados por andar:

- **1º Andar** (10 itens): Computadores Dell, HP e Lenovo
- **2º Andar** (10 itens): Monitores LG, Samsung, Dell e AOC
- **3º Andar** (8 itens): Impressoras HP, Epson e Brother
- **4º Andar** (10 itens): Notebooks Dell, HP e Lenovo
- **5º Andar** (12 itens): Servidores, Switches, Roteadores, Firewalls e No-Breaks

**Valores**: De R$ 500 a R$ 15.000
**Categorias**: 9 diferentes (Computador, Monitor, Impressora, Notebook, Servidor, Switch, Roteador, Firewall, No-Break)
**Localizações**: 47 únicas (salas, data center, racks, etc.)

Para criar os dados de teste:
```bash
npx tsx seed-patrimonios.mjs
```

---

## 🔒 Segurança

- **Autenticação**: Sistema de cookies com tokens base64
- **Validação**: Zod schemas no frontend e backend
- **Proteção de rotas**: Middleware de autenticação
- **SQL Injection**: Prevenido pelo Drizzle ORM
- **XSS**: Sanitização automática pelo React
- **CORS**: Configurado para domínios permitidos

---

## 🚧 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de QR Code para etiquetas de patrimônio
- [ ] Histórico de movimentações entre localizações
- [ ] Notificações em tempo real
- [ ] Filtro de período no dashboard
- [ ] Exportação de gráficos como imagem
- [ ] Sistema de backup automático
- [ ] Busca avançada com filtros combinados
- [ ] Visualização de imagens na listagem
- [ ] Histórico de importações CSV
- [ ] Auditoria completa de ações

---

## 📄 Licença

Este projeto é de uso interno do Detran-RJ - Departamento de Tecnologia da Informação e Comunicação (DTIC).

---

## 👨‍💻 Desenvolvimento

Desenvolvido para o Detran-RJ com foco em usabilidade, performance e manutenibilidade.

### Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build            # Build de produção
pnpm start            # Inicia servidor de produção
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formata código com Prettier
pnpm test             # Executa testes

# Banco de Dados
pnpm db:push          # Aplica migrations
npx tsx seed-users.mjs         # Cria usuários
npx tsx seed-patrimonios.mjs   # Cria patrimônios de teste
```

---

## 📞 Suporte

Para dúvidas, sugestões ou reportar problemas, utilize o módulo de Sugestões dentro do sistema ou entre em contato com a equipe DTIC.

---

**Sistema Patrimônio DTIC - Detran-RJ** | Versão 1.0.0 | 2024-2025
