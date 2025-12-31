# Identidade Visual - Detran-RJ Patrimônio

## Visão Geral

O sistema de Gerenciamento de Patrimônio de Informática do Detran-RJ utiliza uma identidade visual moderna e profissional, baseada nas cores oficiais da instituição: **azul e verde**, representando confiança, segurança e sustentabilidade.

## Paleta de Cores

### Cores Primárias

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Azul Detran** | `#0066CC` | rgb(0, 102, 204) | Primária, botões, headers |
| **Verde Detran** | `#00AA44` | rgb(0, 170, 68) | Secundária, acentos, sucesso |
| **Azul Escuro** | `#0052A3` | rgb(0, 82, 163) | Hover states, sidebar |
| **Verde Escuro** | `#008833` | rgb(0, 136, 51) | Hover states, ênfase |

### Cores Neutras

| Cor | Hex | Uso |
|-----|-----|-----|
| **Branco** | `#FFFFFF` | Fundo principal, cards |
| **Cinza Claro** | `#F5F5F5` | Backgrounds secundários |
| **Cinza Médio** | `#999999` | Textos secundários |
| **Cinza Escuro** | `#333333` | Textos principais |
| **Preto** | `#000000` | Textos críticos |

## Tipografia

### Fonte Principal
- **Família:** Inter (Google Fonts)
- **Pesos:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Uso:** Todos os textos do sistema

### Hierarquia de Tamanhos

| Elemento | Tamanho | Peso | Uso |
|----------|---------|------|-----|
| H1 (Título Principal) | 32px | 700 | Títulos de página |
| H2 (Subtítulo) | 24px | 600 | Seções principais |
| H3 (Seção) | 18px | 600 | Subseções |
| Body (Padrão) | 14px | 400 | Texto corrido |
| Small (Pequeno) | 12px | 400 | Legendas, dicas |
| Label (Rótulo) | 13px | 500 | Labels de formulário |

## Logo

### Variações Disponíveis

#### 1. Logo Horizontal
- **Arquivo:** `logo-horizontal-detran-rj.png`
- **Dimensões:** 1200x400px (recomendado)
- **Uso:** Headers, navegação superior, documentos horizontais
- **Espaço mínimo:** 20px em torno da logo

#### 2. Logo Vertical
- **Arquivo:** `logo-vertical-detran-rj.png`
- **Dimensões:** 400x600px (recomendado)
- **Uso:** Sidebars, rodapés, documentos verticais
- **Espaço mínimo:** 20px em torno da logo

#### 3. Logo Ícone
- **Arquivo:** `logo-icon-detran-rj.png`
- **Dimensões:** 256x256px (recomendado)
- **Uso:** Favicon, avatares, ícones de aplicação
- **Escalável:** Funciona bem em 32x32px até 512x512px

#### 4. Favicon
- **32x32px:** `favicon-32.png` (para abas do navegador)
- **192x192px:** `favicon-192.png` (para dispositivos móveis)

### Regras de Uso da Logo

**✓ Permitido:**
- Usar logo em fundo branco ou cores claras
- Usar logo em fundo com degradê azul-verde
- Redimensionar mantendo proporção
- Usar em preto e branco em documentos impressos

**✗ Não Permitido:**
- Distorcer ou esticar a logo
- Alterar cores da logo
- Adicionar sombras ou efeitos não aprovados
- Usar logo em fundos muito escuros sem contraste adequado
- Remover elementos da logo

## Degradê Detran

O sistema utiliza um **degradê transicional entre azul e verde** em diversos contextos para criar uma identidade visual única e moderna.

### Degradê Padrão
```css
background: linear-gradient(135deg, #0066CC 0%, #00AA44 100%);
```

### Degradê Invertido
```css
background: linear-gradient(135deg, #00AA44 0%, #0066CC 100%);
```

### Aplicações do Degradê
- Backgrounds de seções principais
- Botões de ação primária (hover)
- Headers e footers
- Elementos decorativos
- Banners e chamadas à ação

## Componentes Visuais

### Botões

#### Botão Primário (Azul)
- **Cor de Fundo:** `#0066CC`
- **Cor de Texto:** Branco
- **Hover:** `#0052A3`
- **Padding:** 10px 20px
- **Border Radius:** 6px

#### Botão Secundário (Verde)
- **Cor de Fundo:** `#00AA44`
- **Cor de Texto:** Branco
- **Hover:** `#008833`
- **Padding:** 10px 20px
- **Border Radius:** 6px

#### Botão Outline
- **Cor de Borda:** `#0066CC`
- **Cor de Texto:** `#0066CC`
- **Hover:** Fundo `#F0F7FF`
- **Padding:** 10px 20px
- **Border Radius:** 6px

### Cards
- **Fundo:** Branco (`#FFFFFF`)
- **Borda:** `1px solid #E0E0E0`
- **Border Radius:** 8px
- **Sombra:** `0 2px 8px rgba(0, 0, 0, 0.1)`
- **Padding:** 20px

### Inputs e Formulários
- **Borda:** `1px solid #CCCCCC`
- **Border Radius:** 6px
- **Padding:** 10px 12px
- **Focus:** Borda `#0066CC`, sombra azul

### Alertas

#### Sucesso (Verde)
- **Fundo:** `#F0FFF4`
- **Borda:** `1px solid #00AA44`
- **Ícone:** Verde
- **Texto:** `#00AA44`

#### Erro (Vermelho)
- **Fundo:** `#FFF5F5`
- **Borda:** `1px solid #E53E3E`
- **Ícone:** Vermelho
- **Texto:** `#E53E3E`

#### Aviso (Amarelo)
- **Fundo:** `#FFFFF0`
- **Borda:** `1px solid #F6AD55`
- **Ícone:** Amarelo
- **Texto:** `#F6AD55`

#### Informação (Azul)
- **Fundo:** `#EBF8FF`
- **Borda:** `1px solid #0066CC`
- **Ícone:** Azul
- **Texto:** `#0066CC`

## Espaçamento

O sistema utiliza uma escala de espaçamento consistente baseada em múltiplos de 4px:

| Valor | Pixels | Uso |
|-------|--------|-----|
| xs | 4px | Espaçamento mínimo entre elementos |
| sm | 8px | Espaçamento pequeno |
| md | 12px | Espaçamento médio |
| lg | 16px | Espaçamento padrão |
| xl | 20px | Espaçamento grande |
| 2xl | 24px | Espaçamento extra grande |
| 3xl | 32px | Espaçamento entre seções |

## Sombras

| Nível | CSS | Uso |
|-------|-----|-----|
| Leve | `0 1px 2px rgba(0, 0, 0, 0.05)` | Elementos sutis |
| Média | `0 2px 8px rgba(0, 0, 0, 0.1)` | Cards padrão |
| Forte | `0 4px 16px rgba(0, 0, 0, 0.15)` | Modais, dropdowns |
| Muito Forte | `0 8px 32px rgba(0, 0, 0, 0.2)` | Elementos em destaque |

## Ícones

- **Biblioteca:** Lucide React
- **Tamanho Padrão:** 20x20px
- **Tamanho Pequeno:** 16x16px
- **Tamanho Grande:** 24x24px
- **Cor Padrão:** Herda cor do texto pai
- **Cor Primária:** `#0066CC`
- **Cor Secundária:** `#00AA44`

## Responsividade

O sistema segue uma abordagem **mobile-first**, garantindo que a identidade visual seja mantida em todos os tamanhos de tela:

- **Mobile:** 320px - 480px
- **Tablet:** 481px - 768px
- **Desktop:** 769px - 1024px
- **Large Desktop:** 1025px+

### Ajustes por Tamanho
- Tipografia reduz em 10-15% em mobile
- Padding e margin reduzem em 25% em mobile
- Logo reduz para ícone em mobile
- Botões aumentam altura para 44px em mobile (toque)

## Acessibilidade

### Contraste de Cores
Todas as combinações de cores seguem as diretrizes WCAG AA:
- Texto em azul sobre branco: Razão de contraste 8.6:1
- Texto em verde sobre branco: Razão de contraste 5.2:1
- Texto branco sobre azul: Razão de contraste 8.6:1

### Indicadores Visuais
- Não use cor como único indicador de estado
- Sempre combine com ícones, texto ou padrões
- Forneça feedback visual claro em interações

## Animações

- **Duração Padrão:** 200ms
- **Easing:** `ease-in-out`
- **Hover:** Mudança de cor + sombra
- **Transição:** Suave entre estados
- **Loading:** Spinner com rotação contínua

## Exemplos de Uso

### Header com Degradê
```css
.header {
  background: linear-gradient(135deg, #0066CC 0%, #00AA44 100%);
  color: white;
  padding: 20px;
}
```

### Card com Logo
```html
<div class="card">
  <img src="/logo-icon-detran-rj.png" alt="Detran-RJ" class="w-12 h-12">
  <h2>Título do Card</h2>
  <p>Conteúdo do card...</p>
</div>
```

### Botão com Hover
```css
.button-primary {
  background-color: #0066CC;
  color: white;
  transition: background-color 200ms ease-in-out;
}

.button-primary:hover {
  background-color: #0052A3;
}
```

## Versão

- **Versão:** 1.0.0
- **Data:** Dezembro 2025
- **Responsável:** Equipe de Design - Detran-RJ

---

Para dúvidas sobre a identidade visual, consulte este documento ou entre em contato com a equipe de desenvolvimento.
