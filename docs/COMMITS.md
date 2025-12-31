# Guia de Commits Detalhados

## Visão Geral

Este documento define o padrão de commits para o projeto Detran-RJ Patrimônio, garantindo rastreabilidade, clareza e facilidade de manutenção do histórico de mudanças.

## Formato de Commit

Todos os commits devem seguir o seguinte formato estruturado:

```
<tipo>: <título breve>

<descrição detalhada>

**Objetivo:**
O que foi alcançado com este commit

**Mudanças:**
- Arquivo 1: descrição da mudança
- Arquivo 2: descrição da mudança
- Arquivo 3: descrição da mudança

**Impacto:**
Como isso afeta o sistema, performance, segurança, etc.

**Áreas Afetadas:**
- Módulo/Componente 1
- Módulo/Componente 2
- Módulo/Componente 3

**Histórico:**
- Ação 1: resultado
- Ação 2: resultado
- Ação 3: resultado

**Testes:**
- Teste 1: resultado
- Teste 2: resultado

**Breaking Changes:**
(Se aplicável) Descrever mudanças que quebram compatibilidade
```

## Tipos de Commit

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat: Adicionar sistema de autenticação` |
| `fix` | Correção de bug | `fix: Corrigir validação de email` |
| `docs` | Alterações na documentação | `docs: Atualizar README com instruções` |
| `style` | Alterações de formatação/estilo | `style: Formatar código com Prettier` |
| `refactor` | Refatoração de código | `refactor: Simplificar lógica de login` |
| `test` | Adição ou alteração de testes | `test: Adicionar testes de autenticação` |
| `chore` | Alterações em dependências/config | `chore: Atualizar dependências` |
| `perf` | Melhorias de performance | `perf: Otimizar queries do banco` |

## Exemplos de Commits

### Exemplo 1: Nova Funcionalidade

```
feat: Implementar sistema de autenticação local

Criar sistema completo de autenticação com usuário e senha,
permitindo acesso ao sistema sem dependência de OAuth externo
durante a fase de prototipagem. Inclui validação de força de
senha, hash com bcrypt e redirecionamento obrigatório para
troca de senha no primeiro login.

**Objetivo:**
Permitir que usuários façam login com credenciais locais,
com segurança adequada e fluxo de troca de senha obrigatória
para novos usuários.

**Mudanças:**
- drizzle/schema.ts: Adicionar campos username, passwordHash, mustChangePassword
- server/db.ts: Criar funções getUserByUsername, updateUserPassword
- server/routers.ts: Adicionar procedures auth.login, auth.changePassword
- client/src/pages/Login.tsx: Criar tela de login
- client/src/pages/ChangePassword.tsx: Criar tela de troca de senha
- client/src/App.tsx: Adicionar rotas de autenticação
- seed-users.ts: Criar script para popular usuários admin

**Impacto:**
- Usuários podem agora acessar o sistema com credenciais locais
- Segurança melhorada com hash bcrypt (salt 10)
- Força de senha obrigatória reduz riscos de segurança
- Fluxo de UX melhorado com redirecionamento automático

**Áreas Afetadas:**
- Autenticação (nova)
- Banco de Dados (schema alterado)
- Frontend (novas páginas)
- Backend (novos procedures)

**Histórico:**
- Migrations aplicadas com sucesso
- Seed de usuários (moises, pedro) criado
- Testes de autenticação passando (12/12)
- Build sem erros

**Testes:**
- ✅ auth.login.test.ts: 11 testes passando
- ✅ auth.logout.test.ts: 1 teste passando
- ✅ Validação de força de senha funcionando
- ✅ Redirecionamento obrigatório funcionando

**Breaking Changes:**
Nenhuma
```

### Exemplo 2: Correção de Bug

```
fix: Corrigir validação de email no perfil

Corrigir regex de validação de email que estava rejeitando
endereços válidos com subdomínios. Implementar validação
RFC 5322 completa.

**Objetivo:**
Permitir que usuários com emails válidos mas complexos
consigam atualizar seu perfil sem erros de validação.

**Mudanças:**
- client/src/pages/Profile.tsx: Atualizar regex de validação
- server/routers.ts: Adicionar validação Zod com email()
- server/auth.updateProfile.test.ts: Adicionar testes de email

**Impacto:**
- Usuários com emails complexos agora conseguem atualizar perfil
- Validação mais robusta e confiável
- Reduz tickets de suporte relacionados

**Áreas Afetadas:**
- Validação de entrada
- Testes

**Histórico:**
- Identificado em testes manuais
- Reproduzido com email: user+tag@sub.domain.com
- Corrigido com biblioteca email-validator

**Testes:**
- ✅ Email simples: user@domain.com
- ✅ Email com +: user+tag@domain.com
- ✅ Email com subdomínio: user@mail.domain.com
- ✅ Email inválido rejeitado: user@domain

**Breaking Changes:**
Nenhuma
```

### Exemplo 3: Documentação

```
docs: Adicionar documentação de identidade visual

Criar documentação completa da identidade visual do sistema,
incluindo paleta de cores, tipografia, logo, componentes e
regras de uso. Documento serve como referência para designers
e desenvolvedores.

**Objetivo:**
Estabelecer padrão visual consistente em todo o sistema
e documentar decisões de design para futuras manutenções.

**Mudanças:**
- docs/IDENTIDADE_VISUAL.md: Novo arquivo com documentação completa

**Impacto:**
- Consistência visual garantida
- Facilita onboarding de novos desenvolvedores
- Reduz retrabalho em design

**Áreas Afetadas:**
- Documentação (nova)

**Histórico:**
- Pesquisado logo oficial do Detran-RJ
- Extraídas cores primárias (azul #0066CC, verde #00AA44)
- Definida paleta completa com neutros
- Documentadas regras de uso

**Testes:**
- ✅ Documento validado por equipe de design
- ✅ Cores testadas em contraste (WCAG AA)

**Breaking Changes:**
Nenhuma
```

### Exemplo 4: Testes

```
test: Adicionar testes de autenticação

Criar suite completa de testes vitest para procedures de
autenticação, cobrindo casos de sucesso, validação de entrada
e tratamento de erros.

**Objetivo:**
Garantir que sistema de autenticação funciona corretamente
em todos os cenários e facilitar detecção de regressões.

**Mudanças:**
- server/auth.login.test.ts: Novo arquivo com 11 testes
- server/auth.logout.test.ts: Atualizar com melhorias

**Impacto:**
- Confiabilidade aumentada
- Detecção rápida de regressões
- Facilita refatoração futura

**Áreas Afetadas:**
- Testes (nova suite)
- Autenticação

**Histórico:**
- Testes implementados com vitest
- Todos os 12 testes passando
- Coverage: 95% das linhas de autenticação

**Testes:**
- ✅ 12 testes passando
- ✅ 0 testes falhando
- ✅ Tempo de execução: 840ms

**Breaking Changes:**
Nenhuma
```

### Exemplo 5: Refatoração

```
refactor: Simplificar lógica de validação de senha

Extrair lógica de validação de senha para função reutilizável,
reduzindo duplicação de código entre login e changePassword.

**Objetivo:**
Melhorar manutenibilidade e reduzir duplicação de código,
facilitando futuras mudanças nas regras de validação.

**Mudanças:**
- server/db.ts: Adicionar função validatePasswordStrength()
- server/routers.ts: Usar função em changePassword
- server/auth.changePassword.test.ts: Atualizar testes

**Impacto:**
- Código mais limpo e manutenível
- Regras de validação centralizadas
- Facilita futuras alterações

**Áreas Afetadas:**
- Validação
- Autenticação

**Histórico:**
- Identificada duplicação durante code review
- Refatoração implementada
- Testes atualizados

**Testes:**
- ✅ Todos os testes passando
- ✅ Comportamento idêntico antes/depois

**Breaking Changes:**
Nenhuma
```

## Checklist de Commit

Antes de fazer um commit, verifique:

- [ ] Código foi testado localmente
- [ ] Testes passam (`pnpm test`)
- [ ] Sem erros TypeScript (`pnpm check`)
- [ ] Código formatado (`pnpm format`)
- [ ] Mensagem segue o padrão
- [ ] Descrição é clara e detalhada
- [ ] Objetivo está bem definido
- [ ] Mudanças estão listadas
- [ ] Impacto está documentado
- [ ] Áreas afetadas estão identificadas
- [ ] Histórico de execução está presente
- [ ] Testes estão documentados

## Boas Práticas

### 1. Commits Atômicos

Cada commit deve representar uma mudança lógica completa:

```bash
# ✅ Bom: Um commit por feature
git commit -m "feat: Adicionar sistema de autenticação"

# ❌ Ruim: Múltiplas features em um commit
git commit -m "feat: Adicionar autenticação e perfil"
```

### 2. Mensagens Descritivas

Use mensagens que explicam o "por quê", não apenas o "o quê":

```bash
# ✅ Bom
feat: Implementar autenticação com validação de força de senha

# ❌ Ruim
feat: Add login
```

### 3. Commits Frequentes

Faça commits pequenos e frequentes:

```bash
# ✅ Bom: 3 commits pequenos
git commit -m "feat: Criar schema de usuários"
git commit -m "feat: Implementar procedure de login"
git commit -m "feat: Criar página de login"

# ❌ Ruim: 1 commit grande
git commit -m "feat: Implementar autenticação completa"
```

### 4. Evite Commits Genéricos

```bash
# ❌ Ruim
git commit -m "fix: Bug"
git commit -m "docs: Update"
git commit -m "chore: Changes"

# ✅ Bom
git commit -m "fix: Corrigir validação de email no perfil"
git commit -m "docs: Adicionar guia de commits"
git commit -m "chore: Atualizar dependências do Node.js"
```

## Workflow de Commits

```
1. Criar branch para feature
   git checkout -b feature/autenticacao

2. Fazer mudanças
   (editar arquivos)

3. Verificar mudanças
   git status
   git diff

4. Testar
   pnpm test
   pnpm check

5. Formatar
   pnpm format

6. Adicionar mudanças
   git add .

7. Fazer commit com mensagem detalhada
   git commit -m "feat: Descrição"

8. Fazer push
   git push origin feature/autenticacao

9. Abrir Pull Request
   (no GitHub)

10. Merge após aprovação
    git merge feature/autenticacao
```

## Integração com GitHub

### Commits Automáticos

Commits são sincronizados automaticamente com GitHub via Manus:

```bash
# Manus detecta mudanças
# Faz git pull automático
# Faz git push automático
```

### Pull Requests

Ao abrir um PR, use o template:

```markdown
## Descrição
Breve descrição do que foi feito

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Testes
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testado manualmente

## Checklist
- [ ] Código segue padrões do projeto
- [ ] Documentação atualizada
- [ ] Sem console.log ou debug code
```

## Histórico de Commits (Exemplo)

```
commit 7b7fbb26 (HEAD -> main)
Author: Manus AI <ai@manus.im>
Date:   Tue Dec 31 23:05:35 2025 -0300

    feat: Implementar sistema de autenticação local

    Criar sistema completo de autenticação com usuário e senha...
    
    **Objetivo:** Permitir acesso ao sistema sem OAuth externo
    **Mudanças:** 7 arquivos modificados
    **Impacto:** Usuários podem fazer login com credenciais locais
    **Áreas Afetadas:** Autenticação, BD, Frontend, Backend
    **Histórico:** Migrations aplicadas, seed criado, testes passando

commit 3d1f443a
Author: Manus AI <ai@manus.im>
Date:   Tue Dec 31 22:52:41 2025 -0300

    chore: Inicializar projeto web fullstack

    Criar estrutura inicial com React, Express, tRPC e MySQL...
```

---

**Versão:** 1.0.0  
**Data de Atualização:** Dezembro 2025  
**Responsável:** Equipe de Desenvolvimento - Detran-RJ
