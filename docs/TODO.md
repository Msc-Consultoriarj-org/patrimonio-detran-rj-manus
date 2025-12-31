# Detran-RJ Patrimônio - TODO

## Fase 1: Prototipagem e Testagem (Manus + GitHub)

### Identidade Visual
- [x] Criar variações da logo Detran-RJ (horizontal, vertical, ícone)
- [x] Gerar favicon em múltiplos tamanhos
- [x] Definir paleta de cores (azul #0066CC, verde #00AA44, neutros)
- [x] Criar documentação de identidade visual em Markdown
- [x] Implementar tema com degradê azul-verde no sistema

### Autenticação e Perfil
- [x] Inicializar projeto web fullstack (React + Express + tRPC + MySQL)
- [x] Criar tela de login simplificada
- [x] Configurar usuários pré-definidos: Moises (123) e Pedro (123)
- [x] Implementar redirecionamento obrigatório para troca de senha no primeiro login
- [x] Criar tela de perfil de usuário
- [x] Implementar edição de dados: nome, email, senha
- [x] Adicionar validações de senha forte
- [ ] Criar testes vitest para autenticação (em progresso)

### Banco de Dados
- [x] Estender schema com tabela de usuários (adicionar campos: mustChangePassword)
- [x] Criar migrations para estrutura inicial
- [x] Adicionar seed com usuários admin (Moises, Pedro)

### Documentação
- [x] Criar README.md com instruções de setup
- [x] Documentar arquitetura do sistema
- [x] Documentar fluxos de autenticação e perfil
- [x] Criar guia de identidade visual
- [x] Documentar estrutura de commits

### GitHub e Deploy
- [ ] Configurar repositório GitHub com integração
- [ ] Realizar commits com títulos e descrições detalhadas
- [ ] Criar arquivo .ipynb com demo do sistema
- [x] Configurar deploy fullstack no Manus
- [ ] Validar funcionamento em produção

## Fase 2: Supabase e Vercel (Futuro)
- [ ] Migrar para Supabase
- [ ] Migrar para Vercel
- [ ] Separar frontend e backend

## Bugs e Melhorias
- [ ] (Adicionar conforme identificados)


## Fase 1.5: Melhorias Visuais e Interatividade

### Logo e Identidade Visual
- [x] Corrigir logo do Detran com cores azul e verde oficiais
- [x] Gerar variações da logo (horizontal, vertical, ícone, favicon)
- [x] Atualizar favicon com logo corrigida

### Componentes Visuais e Interatividade
- [x] Adicionar efeitos de hover em botões (transição suave)
- [x] Implementar transições em cards e elementos
- [x] Criar animações de loading (spinner)
- [x] Adicionar feedback visual em inputs (focus, error, success)
- [x] Implementar transições de página/rota

### Hierarquia Tipográfica
- [x] Melhorar tamanhos de títulos e subtítulos
- [x] Aumentar contraste entre títulos e conteúdo
- [x] Implementar escala tipográfica consistente
- [x] Adicionar espaçamento visual entre seções
- [x] Melhorar legibilidade em mobile

### Contraste e Cores
- [x] Validar contraste WCAG AA em todos os elementos
- [x] Melhorar contraste de texto sobre fundo
- [x] Ajustar paleta de cores para melhor legibilidade
- [ ] Testar em modo escuro (futuro)

### Cadastro de Patrimônio
- [x] Criar página de cadastro de patrimônio
- [x] Implementar formulário com validação
- [x] Adicionar campos: descrição, categoria, valor, localização
- [x] Criar tabela para listar patrimônios
- [x] Implementar edição e exclusão de registros

### Design Minimalista
- [x] Remover elementos desnecessários
- [x] Simplificar layout de páginas
- [x] Melhorar espaçamento e alinhamento
- [x] Usar ícones de forma consistente
- [x] Manter design limpo e profissional
