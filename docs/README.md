# Detran-RJ - Sistema de Gerenciamento de Patrimônio de Informática

**Versão:** 1.0.0 (Fase 1 - Prototipagem)  
**Status:** Em Desenvolvimento  
**Data de Início:** Dezembro 2025

## 📋 Visão Geral

Sistema web fullstack para gerenciamento de patrimônio de informática do Departamento Estadual de Trânsito do Rio de Janeiro (Detran-RJ), com foco em auxiliar o sistema SEI (Sistema Eletrônico de Informações). O projeto utiliza tecnologias modernas para garantir escalabilidade, segurança e eficiência operacional.

### Objetivos Principais

- **Prototipagem Rápida:** Validar conceitos e fluxos de negócio
- **Documentação Rica:** Manter documentação detalhada em Markdown
- **Autenticação Segura:** Sistema de login com controle de acesso
- **Identidade Visual:** Aplicar identidade visual oficial do Detran-RJ
- **Preparação para Produção:** Estrutura pronta para migração para Supabase + Vercel

## 🎯 Fase 1: Prototipagem e Testagem (Manus + GitHub)

### Características Implementadas

#### ✅ Autenticação e Perfil
- [x] Sistema de login simplificado com usuário e senha
- [x] Dois usuários admin pré-configurados (Moises e Pedro)
- [x] Redirecionamento obrigatório para troca de senha no primeiro login
- [x] Tela de perfil com edição de dados pessoais (nome, email)
- [x] Validação de força de senha
- [x] Logout seguro

#### ✅ Identidade Visual
- [x] Logo oficial do Detran-RJ em múltiplas variações
- [x] Paleta de cores (azul #0066CC e verde #00AA44)
- [x] Favicon em múltiplos tamanhos
- [x] Tema com degradê azul-verde
- [x] Documentação de identidade visual completa

#### ✅ Infraestrutura
- [x] Banco de dados MySQL com Drizzle ORM
- [x] API tRPC com tipagem end-to-end
- [x] Autenticação baseada em sessão
- [x] Seed script para usuários iniciais
- [x] Migrações de banco de dados

#### ✅ Documentação
- [x] README.md com instruções completas
- [x] Documentação de identidade visual
- [x] Documentação de arquitetura
- [x] Documentação de fluxos de autenticação
- [x] Guia de commits detalhados

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React 19 | 19.2.1 |
| **Styling** | Tailwind CSS 4 | 4.1.14 |
| **Backend** | Express 4 | 4.21.2 |
| **API** | tRPC 11 | 11.6.0 |
| **Banco de Dados** | MySQL | via TiDB |
| **ORM** | Drizzle ORM | 0.44.5 |
| **Autenticação** | JWT + Cookies | Nativo |
| **Build** | Vite 7 | 7.1.7 |
| **Runtime** | Node.js | 22.13.0 |

### Estrutura de Diretórios

```
detran-rj-patrimonio/
├── client/                          # Frontend React
│   ├── public/                      # Arquivos estáticos
│   │   ├── logo-detran-rj.png      # Logo original
│   │   ├── logo-horizontal-*.png   # Logo horizontal
│   │   ├── logo-vertical-*.png     # Logo vertical
│   │   ├── logo-icon-*.png         # Ícone da logo
│   │   ├── favicon-32.png          # Favicon 32x32
│   │   └── favicon-192.png         # Favicon 192x192
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx           # Tela de login
│   │   │   ├── ChangePassword.tsx  # Troca de senha
│   │   │   ├── Profile.tsx         # Perfil do usuário
│   │   │   └── Home.tsx            # Página inicial
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── contexts/               # React contexts
│   │   ├── lib/
│   │   │   └── trpc.ts            # Cliente tRPC
│   │   ├── App.tsx                 # Roteamento principal
│   │   ├── main.tsx                # Entrada da aplicação
│   │   └── index.css               # Estilos globais
│   ├── index.html                  # HTML principal
│   └── vite.config.ts              # Configuração Vite
├── server/                          # Backend Express
│   ├── routers.ts                  # Definição de procedures tRPC
│   ├── db.ts                       # Helpers de banco de dados
│   ├── auth.logout.test.ts         # Testes vitest
│   └── _core/                      # Infraestrutura interna
│       ├── index.ts                # Servidor Express
│       ├── context.ts              # Contexto tRPC
│       ├── trpc.ts                 # Configuração tRPC
│       ├── cookies.ts              # Gerenciamento de cookies
│       ├── env.ts                  # Variáveis de ambiente
│       └── ...
├── drizzle/                         # Banco de dados
│   ├── schema.ts                   # Definição de tabelas
│   ├── migrations/                 # Arquivos de migração
│   └── drizzle.config.ts           # Configuração Drizzle
├── docs/                            # Documentação
│   ├── IDENTIDADE_VISUAL.md        # Guia de identidade visual
│   ├── ARQUITETURA.md              # Documentação técnica
│   └── FLUXOS.md                   # Fluxos de negócio
├── shared/                          # Código compartilhado
│   ├── const.ts                    # Constantes
│   └── types.ts                    # Tipos compartilhados
├── package.json                     # Dependências do projeto
├── tsconfig.json                    # Configuração TypeScript
├── tailwind.config.ts               # Configuração Tailwind
├── seed-users.ts                    # Script de seed de usuários
├── TODO.md                          # Rastreamento de features
└── README.md                        # Este arquivo
```

## 🚀 Guia de Início Rápido

### Pré-requisitos

- Node.js 22.13.0 ou superior
- pnpm 10.4.1 ou superior
- MySQL 8.0 ou superior (ou TiDB)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/detran-rj-patrimonio.git
   cd detran-rj-patrimonio
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo (se existir)
   cp .env.example .env
   
   # Edite .env com suas configurações
   ```

4. **Crie o banco de dados e execute as migrações**
   ```bash
   pnpm db:push
   ```

5. **Popule os usuários iniciais**
   ```bash
   npx tsx seed-users.ts
   ```

6. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

7. **Acesse a aplicação**
   - Abra o navegador em `http://localhost:3000`
   - Use as credenciais de teste:
     - **Usuário:** moises | **Senha:** 123
     - **Usuário:** pedro | **Senha:** 123

## 📚 Fluxos Principais

### Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE LOGIN                           │
└─────────────────────────────────────────────────────────────┘

1. Usuário acessa /login
   ↓
2. Insere credenciais (usuário + senha)
   ↓
3. Sistema valida credenciais no banco de dados
   ↓
4. Se válido:
   ├─ Cria sessão (cookie JWT)
   ├─ Verifica flag mustChangePassword
   │  ├─ Se true → Redireciona para /change-password
   │  └─ Se false → Redireciona para /profile
   └─ Se inválido → Exibe erro
```

### Fluxo de Troca de Senha Obrigatória

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE TROCA DE SENHA                        │
└─────────────────────────────────────────────────────────────┘

1. Usuário é redirecionado para /change-password
   ↓
2. Insere senha atual + nova senha
   ↓
3. Sistema valida:
   ├─ Senha atual está correta
   ├─ Nova senha atende critérios de força:
   │  ├─ Mínimo 8 caracteres
   │  ├─ Pelo menos 1 letra maiúscula
   │  ├─ Pelo menos 1 letra minúscula
   │  └─ Pelo menos 1 número
   └─ Confirmação de senha corresponde
   ↓
4. Se válido:
   ├─ Hash a nova senha com bcrypt
   ├─ Atualiza no banco de dados
   ├─ Define mustChangePassword = false
   └─ Redireciona para /profile
```

### Fluxo de Perfil

```
┌─────────────────────────────────────────────────────────────┐
│                FLUXO DE PERFIL                              │
└─────────────────────────────────────────────────────────────┘

1. Usuário acessa /profile
   ↓
2. Sistema carrega dados do perfil
   ├─ Nome
   ├─ Email
   ├─ Função (admin/user)
   └─ Dados de criação/atualização
   ↓
3. Usuário pode:
   ├─ Visualizar informações
   ├─ Editar nome e email
   ├─ Alterar senha
   └─ Fazer logout
```

## 🔐 Segurança

### Autenticação

- **Método:** Sessão baseada em JWT com cookies HTTP-only
- **Hash de Senha:** bcrypt com salt 10
- **Expiração:** Configurável via variáveis de ambiente
- **CSRF Protection:** Habilitada automaticamente

### Validações

- **Força de Senha:** Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
- **Email:** Validação de formato RFC 5322
- **Usuário:** Caracteres alfanuméricos e underscore

### Boas Práticas

- Senhas nunca são transmitidas em plain text
- Cookies são HTTP-only e Secure
- Validação de entrada em cliente e servidor
- Rate limiting em endpoints de autenticação (implementar em Fase 2)
- Logs de acesso e alterações (implementar em Fase 2)

## 📊 Banco de Dados

### Tabela: users

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária auto-incrementada |
| openId | VARCHAR(64) | ID do OAuth (futuro) |
| username | VARCHAR(64) | Nome de usuário único |
| passwordHash | TEXT | Hash bcrypt da senha |
| name | TEXT | Nome completo |
| email | VARCHAR(320) | Email do usuário |
| loginMethod | VARCHAR(64) | Método de login (local/oauth) |
| role | ENUM | Função (user/admin) |
| mustChangePassword | INT | Flag para troca obrigatória |
| createdAt | TIMESTAMP | Data de criação |
| updatedAt | TIMESTAMP | Data de última atualização |
| lastSignedIn | TIMESTAMP | Data do último login |

### Migrations

As migrações são gerenciadas automaticamente pelo Drizzle:

```bash
# Gerar nova migração após alterar schema.ts
pnpm db:push

# Ver histórico de migrações
ls drizzle/migrations/
```

## 🧪 Testes

### Executar Testes

```bash
# Rodar todos os testes
pnpm test

# Rodar testes em modo watch
pnpm test:watch

# Gerar coverage
pnpm test:coverage
```

### Exemplo de Teste (vitest)

```typescript
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    // Teste implementado em server/auth.logout.test.ts
  });
});
```

## 📝 Commits Detalhados

Este projeto segue uma convenção de commits estruturada para facilitar rastreamento e documentação.

### Formato de Commit

```
<tipo>: <título breve>

<descrição detalhada>

**Objetivo:** O que foi alcançado
**Mudanças:** Quais arquivos foram modificados
**Impacto:** Como isso afeta o sistema
**Áreas Afetadas:** Quais módulos/componentes
**Histórico:** Logs de execução ou decisões
```

### Tipos de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações na documentação
- `style:` Alterações de formatação/estilo
- `refactor:` Refatoração de código
- `test:` Adição ou alteração de testes
- `chore:` Alterações em dependências ou configuração

### Exemplo de Commit

```
feat: Implementar sistema de autenticação local

**Objetivo:**
Criar sistema de login com usuário e senha para permitir acesso
ao sistema sem dependência de OAuth externo durante prototipagem.

**Mudanças:**
- Adicionar campos username e passwordHash na tabela users
- Criar procedures tRPC para login e changePassword
- Implementar páginas Login.tsx e ChangePassword.tsx
- Adicionar validações de força de senha
- Criar seed script para usuários iniciais

**Impacto:**
- Usuários podem agora fazer login com credenciais locais
- Obrigatoriedade de troca de senha no primeiro acesso
- Melhor segurança com hash bcrypt

**Áreas Afetadas:**
- Banco de dados (schema, migrations)
- Backend (routers, db helpers)
- Frontend (páginas, componentes)
- Autenticação (contexto, hooks)

**Histórico:**
- Migrations aplicadas com sucesso
- Seed de usuários (moises, pedro) criado
- Testes de autenticação passando
```

## 🎨 Identidade Visual

O sistema utiliza a identidade visual oficial do Detran-RJ com cores azul (#0066CC) e verde (#00AA44).

### Recursos Visuais

- **Logo:** Múltiplas variações (horizontal, vertical, ícone)
- **Favicon:** 32x32 e 192x192 pixels
- **Paleta:** Azul primário, verde secundário, neutros
- **Degradê:** Transição azul-verde em elementos principais

Para detalhes completos, consulte [docs/IDENTIDADE_VISUAL.md](docs/IDENTIDADE_VISUAL.md).

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor com hot reload

# Build
pnpm build            # Compila para produção
pnpm start            # Inicia servidor de produção

# Qualidade
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formata código com Prettier
pnpm test             # Executa testes

# Banco de Dados
pnpm db:push          # Gera migrações e aplica ao BD
pnpm seed             # Popula dados iniciais
```

### Variáveis de Ambiente

```bash
# Banco de Dados
DATABASE_URL=mysql://user:password@host:3306/detran_patrimonio

# Autenticação
JWT_SECRET=seu-secret-key-aqui

# OAuth (Futuro)
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im

# Aplicação
VITE_APP_TITLE=Detran-RJ - Gerenciamento de Patrimônio
VITE_APP_LOGO=/logo-horizontal-detran-rj.png
```

## 📦 Dependências Principais

### Frontend
- **react:** Biblioteca UI
- **tailwindcss:** Styling utility-first
- **shadcn/ui:** Componentes acessíveis
- **lucide-react:** Ícones
- **wouter:** Roteamento leve
- **@trpc/react-query:** Cliente tRPC

### Backend
- **express:** Framework web
- **@trpc/server:** Framework RPC
- **drizzle-orm:** ORM type-safe
- **mysql2:** Driver MySQL
- **bcrypt:** Hash de senhas
- **jose:** JWT handling

## 🚀 Deploy

### Manus (Fase 1)

O projeto está configurado para deploy fullstack no Manus:

```bash
# Criar checkpoint
git add .
git commit -m "feat: Sistema de autenticação completo"

# Deploy automático via Manus UI
# 1. Clique em "Publish" no Management UI
# 2. Selecione o checkpoint desejado
# 3. Aguarde o build e deploy
```

### Supabase + Vercel (Fase 2)

Preparação para migração:
- Backend será separado e hospedado no Vercel
- Banco de dados será migrado para Supabase
- Frontend será hospedado no Vercel

## 📋 Roadmap

### Fase 1 ✅ (Atual)
- [x] Autenticação básica
- [x] Perfil de usuário
- [x] Identidade visual
- [x] Documentação
- [x] Deploy no Manus

### Fase 2 (Próxima)
- [ ] Migração para Supabase
- [ ] Separação Frontend/Backend
- [ ] Deploy no Vercel
- [ ] Sistema de permissões avançado
- [ ] Auditoria de ações

### Fase 3 (Futuro)
- [ ] Integração com SEI
- [ ] Gerenciamento de patrimônio
- [ ] Relatórios e dashboards
- [ ] Notificações em tempo real
- [ ] API pública

## 🤝 Contribuindo

### Processo de Contribuição

1. Crie uma branch para sua feature: `git checkout -b feature/sua-feature`
2. Commit com mensagem detalhada: `git commit -m "feat: descrição"`
3. Push para a branch: `git push origin feature/sua-feature`
4. Abra um Pull Request com descrição completa

### Padrões de Código

- TypeScript strict mode habilitado
- Prettier para formatação
- ESLint para linting
- Testes com vitest para novas features

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em `/docs`
2. Verifique issues existentes no GitHub
3. Abra uma nova issue com descrição detalhada
4. Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto é propriedade do Detran-RJ e segue as regulamentações governamentais.

## 👥 Equipe

- **Desenvolvimento:** Equipe de TI - Detran-RJ
- **Design:** Equipe de Design - Detran-RJ
- **Produto:** Gerência de Patrimônio - Detran-RJ

---

**Última atualização:** Dezembro 2025  
**Versão:** 1.0.0 (Fase 1)  
**Status:** Em Desenvolvimento
