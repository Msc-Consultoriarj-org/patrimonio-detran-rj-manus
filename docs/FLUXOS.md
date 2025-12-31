# Fluxos de Negócio - Detran-RJ Patrimônio

## Visão Geral

Este documento detalha os fluxos de negócio principais do sistema de Gerenciamento de Patrimônio de Informática do Detran-RJ, incluindo sequências de ações, decisões e integrações com sistemas externos.

## 1. Fluxo de Autenticação e Acesso

### 1.1 Fluxo de Login

O fluxo de login permite que usuários acessem o sistema utilizando suas credenciais locais (usuário e senha).

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUXO DE LOGIN                             │
└─────────────────────────────────────────────────────────────────┘

1. Usuário acessa a URL raiz (/)
   ↓
2. Sistema verifica se há sessão ativa
   ├─ Se SIM → Redireciona para /profile
   └─ Se NÃO → Exibe tela de login
   ↓
3. Usuário insere credenciais
   ├─ Username: campo obrigatório
   └─ Password: campo obrigatório
   ↓
4. Usuário clica em "Entrar"
   ↓
5. Sistema valida credenciais
   ├─ Busca usuário no banco de dados
   ├─ Compara senha com hash bcrypt
   └─ Verifica se usuário está ativo
   ↓
6. Resultado da validação
   ├─ SUCESSO:
   │  ├─ Cria sessão (JWT em cookie HTTP-only)
   │  ├─ Registra lastSignedIn
   │  ├─ Verifica flag mustChangePassword
   │  │  ├─ Se TRUE → Redireciona para /change-password
   │  │  └─ Se FALSE → Redireciona para /profile
   │  └─ Exibe mensagem de sucesso
   │
   └─ FALHA:
      ├─ Exibe mensagem de erro
      ├─ Limpa campos de entrada
      └─ Mantém usuário na página de login
```

**Atores:** Usuário, Sistema de Autenticação, Banco de Dados

**Pré-condições:**
- Usuário possui credenciais válidas
- Banco de dados está acessível
- Servidor está operacional

**Pós-condições:**
- Usuário autenticado tem sessão ativa
- Cookie de sessão é armazenado no navegador
- Usuário é redirecionado para próxima etapa

### 1.2 Fluxo de Troca de Senha Obrigatória

Usuários que fazem login pela primeira vez devem alterar sua senha inicial para uma senha forte.

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUXO DE TROCA DE SENHA OBRIGATÓRIA                │
└─────────────────────────────────────────────────────────────────┘

1. Usuário é redirecionado para /change-password
   (após login bem-sucedido com mustChangePassword = true)
   ↓
2. Sistema exibe formulário de troca de senha
   ├─ Campo: Senha Atual
   ├─ Campo: Nova Senha
   └─ Campo: Confirmar Senha
   ↓
3. Usuário insere dados
   ↓
4. Usuário clica em "Alterar Senha"
   ↓
5. Sistema valida entrada
   ├─ Senha atual está correta?
   │  └─ Compara com hash armazenado
   ├─ Nova senha atende critérios?
   │  ├─ Mínimo 8 caracteres
   │  ├─ Pelo menos 1 letra MAIÚSCULA
   │  ├─ Pelo menos 1 letra minúscula
   │  └─ Pelo menos 1 número (0-9)
   ├─ Confirmação corresponde à nova senha?
   └─ Nova senha é diferente da atual?
   ↓
6. Resultado da validação
   ├─ SUCESSO:
   │  ├─ Hash nova senha com bcrypt (salt 10)
   │  ├─ Atualiza passwordHash no banco
   │  ├─ Define mustChangePassword = false
   │  ├─ Registra updatedAt
   │  ├─ Exibe mensagem de sucesso
   │  └─ Redireciona para /profile (após 2 segundos)
   │
   └─ FALHA:
      ├─ Exibe mensagem de erro específica
      ├─ Mantém dados preenchidos (exceto senhas)
      └─ Mantém usuário na página
```

**Atores:** Usuário, Sistema de Autenticação, Banco de Dados

**Pré-condições:**
- Usuário está autenticado
- Flag mustChangePassword = true
- Usuário tem sessão ativa

**Pós-condições:**
- Senha do usuário é alterada
- Flag mustChangePassword = false
- Usuário pode acessar perfil completo

**Critérios de Força de Senha:**
- Comprimento mínimo: 8 caracteres
- Deve conter: A-Z (maiúscula)
- Deve conter: a-z (minúscula)
- Deve conter: 0-9 (número)
- Não há limite máximo de caracteres

### 1.3 Fluxo de Logout

Usuário encerra sua sessão no sistema.

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUXO DE LOGOUT                            │
└─────────────────────────────────────────────────────────────────┘

1. Usuário clica em "Sair" (em qualquer página)
   ↓
2. Sistema executa logout
   ├─ Limpa cookie de sessão
   ├─ Invalida token JWT
   └─ Registra lastSignedIn (opcional)
   ↓
3. Sistema redireciona para /login
   ↓
4. Exibe mensagem de sucesso (opcional)
```

**Atores:** Usuário, Sistema de Autenticação

**Pré-condições:**
- Usuário está autenticado
- Sessão está ativa

**Pós-condições:**
- Sessão é encerrada
- Cookie é removido
- Usuário é redirecionado para login

## 2. Fluxo de Gerenciamento de Perfil

### 2.1 Fluxo de Visualização de Perfil

Usuário visualiza suas informações pessoais.

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUXO DE VISUALIZAÇÃO DE PERFIL                    │
└─────────────────────────────────────────────────────────────────┘

1. Usuário acessa /profile
   ↓
2. Sistema verifica autenticação
   ├─ Se NÃO autenticado → Redireciona para /login
   └─ Se autenticado → Continua
   ↓
3. Sistema carrega dados do perfil
   ├─ Busca usuário no banco de dados
   ├─ Recupera informações:
   │  ├─ ID
   │  ├─ Username
   │  ├─ Nome Completo
   │  ├─ Email
   │  ├─ Função (Admin/Usuário)
   │  ├─ Data de Criação
   │  └─ Data de Última Atualização
   └─ Exibe dados na interface
   ↓
4. Sistema exibe opções de ação
   ├─ Editar Perfil
   ├─ Alterar Senha
   ├─ Gerenciar Permissões (futuro)
   └─ Sair
```

**Atores:** Usuário, Sistema, Banco de Dados

**Pré-condições:**
- Usuário está autenticado
- Sessão está ativa

**Pós-condições:**
- Dados do perfil são exibidos
- Usuário pode executar ações

### 2.2 Fluxo de Edição de Perfil

Usuário atualiza suas informações pessoais.

```
┌─────────────────────────────────────────────────────────────────┐
│                 FLUXO DE EDIÇÃO DE PERFIL                       │
└─────────────────────────────────────────────────────────────────┘

1. Usuário clica em "Editar Perfil"
   ↓
2. Sistema exibe formulário de edição
   ├─ Campo: Nome Completo (editável)
   ├─ Campo: Email (editável)
   └─ Botões: Salvar, Cancelar
   ↓
3. Usuário altera dados
   ├─ Nome Completo (opcional)
   └─ Email (opcional, validado)
   ↓
4. Usuário clica em "Salvar"
   ↓
5. Sistema valida dados
   ├─ Email é válido (formato RFC 5322)?
   ├─ Campos obrigatórios preenchidos?
   └─ Dados são diferentes dos atuais?
   ↓
6. Resultado da validação
   ├─ SUCESSO:
   │  ├─ Atualiza dados no banco
   │  ├─ Registra updatedAt
   │  ├─ Exibe mensagem de sucesso
   │  ├─ Atualiza interface
   │  └─ Retorna modo visualização
   │
   └─ FALHA:
      ├─ Exibe mensagem de erro
      ├─ Mantém dados preenchidos
      └─ Mantém modo edição
```

**Atores:** Usuário, Sistema, Banco de Dados

**Pré-condições:**
- Usuário está autenticado
- Usuário está em /profile
- Sessão está ativa

**Pós-condições:**
- Dados do perfil são atualizados
- Interface reflete mudanças
- Modo visualização é retomado

## 3. Fluxo de Gerenciamento de Sessão

### 3.1 Verificação de Sessão

Sistema verifica validade da sessão do usuário.

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUXO DE VERIFICAÇÃO DE SESSÃO                     │
└─────────────────────────────────────────────────────────────────┘

1. Usuário faz requisição ao sistema
   ↓
2. Sistema verifica cookie de sessão
   ├─ Cookie existe?
   ├─ Token JWT é válido?
   ├─ Token não expirou?
   └─ Usuário existe no banco?
   ↓
3. Resultado da verificação
   ├─ VÁLIDA:
   │  ├─ Permite acesso ao recurso
   │  ├─ Carrega dados do usuário
   │  └─ Continua processamento
   │
   └─ INVÁLIDA:
      ├─ Limpa cookie
      ├─ Redireciona para /login
      └─ Exibe mensagem (opcional)
```

**Atores:** Sistema, Banco de Dados

**Pré-condições:**
- Cookie de sessão existe
- Usuário fez requisição

**Pós-condições:**
- Sessão é validada ou rejeitada
- Acesso é concedido ou negado

## 4. Fluxo de Tratamento de Erros

### 4.1 Tratamento de Erros de Autenticação

Sistema trata erros durante processo de autenticação.

| Erro | Causa | Ação do Sistema | Mensagem ao Usuário |
|------|-------|-----------------|-------------------|
| Usuário não encontrado | Username não existe | Log de tentativa | "Usuário ou senha inválidos" |
| Senha incorreta | Password não corresponde | Log de tentativa | "Usuário ou senha inválidos" |
| Usuário inativo | Usuário desativado | Log de tentativa | "Acesso negado" |
| Banco de dados indisponível | Conexão falhou | Log de erro crítico | "Erro no servidor. Tente novamente" |
| Token expirado | Sessão expirou | Limpa cookie | "Sessão expirada. Faça login novamente" |

### 4.2 Tratamento de Erros de Validação

Sistema trata erros de validação de dados.

| Campo | Erro | Mensagem ao Usuário |
|-------|------|-------------------|
| Email | Formato inválido | "Email inválido. Use o formato: usuario@dominio.com" |
| Senha | Muito curta | "Senha deve ter pelo menos 8 caracteres" |
| Senha | Sem maiúscula | "Senha deve conter pelo menos uma letra maiúscula" |
| Senha | Sem minúscula | "Senha deve conter pelo menos uma letra minúscula" |
| Senha | Sem número | "Senha deve conter pelo menos um número" |
| Nome | Vazio | "Nome completo é obrigatório" |

## 5. Fluxo de Auditoria (Futuro)

### 5.1 Registro de Ações

Sistema registra todas as ações importantes para auditoria.

**Ações Registradas:**
- Login bem-sucedido
- Login com falha
- Logout
- Alteração de senha
- Atualização de perfil
- Alteração de permissões

**Informações Registradas:**
- Timestamp
- Usuário
- Ação
- IP de origem
- User-Agent
- Resultado (sucesso/falha)
- Detalhes adicionais

## 6. Fluxo de Integração com SEI (Futuro)

### 6.1 Sincronização de Dados

Sistema sincroniza dados com o Sistema Eletrônico de Informações (SEI).

```
┌─────────────────────────────────────────────────────────────────┐
│          FLUXO DE SINCRONIZAÇÃO COM SEI (FUTURO)                │
└─────────────────────────────────────────────────────────────────┘

1. Sistema detecta mudança em patrimônio
   ↓
2. Sistema prepara dados para SEI
   ├─ Formata conforme especificação SEI
   ├─ Valida dados
   └─ Cria payload
   ↓
3. Sistema envia requisição para API SEI
   ├─ Autenticação
   ├─ Transmissão de dados
   └─ Aguarda resposta
   ↓
4. SEI processa requisição
   ├─ Valida dados
   ├─ Atualiza registros
   └─ Retorna confirmação
   ↓
5. Sistema registra resultado
   ├─ Log de sucesso/falha
   ├─ Timestamp
   └─ Detalhes da transação
```

## 7. Matriz de Decisão

### 7.1 Decisões de Redirecionamento

| Condição | Ação |
|----------|------|
| Usuário não autenticado + acessa /profile | Redireciona para /login |
| Usuário autenticado + acessa /login | Redireciona para /profile |
| Usuário autenticado + mustChangePassword = true | Redireciona para /change-password |
| Usuário autenticado + mustChangePassword = false | Redireciona para /profile |
| Sessão expirada + qualquer página protegida | Redireciona para /login |

## 8. Cronograma de Implementação

| Fase | Fluxo | Status | Data Estimada |
|------|-------|--------|---------------|
| 1 | Autenticação | ✅ Completo | Dezembro 2025 |
| 1 | Perfil | ✅ Completo | Dezembro 2025 |
| 1 | Sessão | ✅ Completo | Dezembro 2025 |
| 2 | Auditoria | ⏳ Planejado | Março 2026 |
| 2 | SEI Integration | ⏳ Planejado | Junho 2026 |
| 3 | Patrimônio | ⏳ Futuro | TBD |

---

**Versão:** 1.0.0  
**Data de Atualização:** Dezembro 2025  
**Responsável:** Equipe de Desenvolvimento - Detran-RJ
