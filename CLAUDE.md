# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working with the **Sistema de Gerenciamento de Patrimonio DTIC - Detran-RJ** codebase.

## Project Overview

A full-stack web application for managing IT assets (patrimonio) for the Information Technology Department (DTIC) of Detran-RJ (Rio de Janeiro State Traffic Department). Built on the Manus WebDev template platform.

**Version:** 1.0.0 (Phase 1 - Prototyping)
**Language:** Portuguese (Brazil) - UI text and documentation
**Primary Language:** TypeScript (strict mode)

## Quick Reference Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload (localhost:3000)

# Build & Production
pnpm build            # Build frontend (Vite) + backend (esbuild)
pnpm start            # Run production server

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Format with Prettier
pnpm test             # Run vitest tests

# Database
pnpm db:push          # Generate and apply migrations
```

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** + Radix UI components
- **Wouter** for routing (lightweight)
- **React Query** (@tanstack/react-query) for data fetching
- **tRPC React Query** for type-safe API calls
- **Recharts** for data visualization
- **React Hook Form** + Zod for forms

### Backend
- **Express 4** web server
- **tRPC 11** for type-safe RPC
- **Drizzle ORM** for database access
- **MySQL 8** (TiDB compatible)
- **pdfkit** for PDF generation
- **xlsx** for Excel import/export

### Build Tools
- **Vite 7** for frontend bundling
- **esbuild** for backend bundling
- **tsx** for TypeScript execution
- **Vitest** for testing
- **pnpm** as package manager

## Directory Structure

```
patrimonio-detran-rj-manus/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets (logos, favicon)
│   └── src/
│       ├── pages/              # Route components (13 pages)
│       │   ├── Login.tsx       # OAuth login
│       │   ├── Home.tsx        # Dashboard with analytics
│       │   ├── Patrimonios.tsx # Asset management CRUD
│       │   ├── Levantamento.tsx# Single asset form
│       │   ├── UploadCSV.tsx   # Bulk CSV import
│       │   ├── Relatorios.tsx  # Report generation
│       │   └── Sugestoes.tsx   # User feedback
│       ├── components/
│       │   ├── ui/             # shadcn/ui components (30+)
│       │   ├── DashboardLayout.tsx
│       │   └── ErrorBoundary.tsx
│       ├── contexts/
│       │   ├── AuthContext.tsx # Auth state management
│       │   └── ThemeContext.tsx
│       ├── hooks/              # Custom React hooks
│       ├── lib/
│       │   ├── trpc.ts         # tRPC client setup
│       │   └── utils.ts        # Utility functions
│       └── App.tsx             # Router configuration
│
├── server/                     # Backend Express + tRPC
│   ├── routers.ts              # Main tRPC router definitions
│   ├── db.ts                   # Database helper functions
│   ├── storage.ts              # S3/Forge storage helpers
│   ├── relatorios.ts           # Report generation (PDF/Excel)
│   ├── *.test.ts               # Unit tests
│   └── _core/                  # Core server infrastructure
│       ├── index.ts            # Express server entry
│       ├── trpc.ts             # tRPC initialization
│       ├── context.ts          # Request context creation
│       ├── oauth.ts            # OAuth callback handler
│       └── env.ts              # Environment variables
│
├── drizzle/                    # Database layer
│   ├── schema.ts               # Table definitions
│   └── *.sql                   # Migrations
│
├── shared/                     # Shared code between client/server
│
├── docs/                       # Documentation
│   ├── ARQUITETURA.md          # Technical architecture
│   ├── FLUXOS.md               # Business flows
│   └── IDENTIDADE_VISUAL.md    # Design system
│
└── Configuration Files
    ├── package.json            # Dependencies & scripts
    ├── tsconfig.json           # TypeScript config
    ├── vite.config.ts          # Vite bundler config
    ├── vitest.config.ts        # Testing config
    └── drizzle.config.ts       # Database migration config
```

## Database Schema

### Tables

**`users`** - User authentication and profile
```typescript
{
  id: int (PK, auto-increment)
  openId: varchar(64) (unique) - OAuth identifier
  detranLogin: varchar(64) (unique) - Detran username (nome.sobrenome)
  username: varchar(64) (unique) - Local auth username
  passwordHash: text - bcrypt hash
  name: text - Display name
  email: varchar(320)
  loginMethod: varchar(64) - 'local' | 'oauth'
  role: enum('user', 'admin')
  mustChangePassword: int (0/1)
  hasCompletedOnboarding: int (0/1)
  createdAt, updatedAt, lastSignedIn: timestamp
}
```

**`patrimonios`** - IT assets
```typescript
{
  id: int (PK, auto-increment)
  descricao: text - Asset description
  categoria: varchar(100) - Category (Monitor, Desktop, etc.)
  valor: varchar(20) - Monetary value
  localizacao: varchar(200) - Location/floor
  numeroSerie: varchar(100) - Serial number (optional)
  dataAquisicao: timestamp - Acquisition date
  responsavel: varchar(200) - Responsible person
  imageUrl: text - S3 image URL
  userId: int - Owner user
  createdAt, updatedAt: timestamp
}
```

**`sugestoes`** - User suggestions/feedback
```typescript
{
  id: int (PK, auto-increment)
  titulo: varchar(200)
  descricao: text
  categoria: varchar(100) - Bug, Feature, Improvement, Other
  prioridade: enum('baixa', 'media', 'alta')
  status: enum('pendente', 'em_analise', 'aprovada', 'rejeitada')
  userId: int
  createdAt, updatedAt: timestamp
}
```

## tRPC API Structure

All API procedures are defined in `server/routers.ts`:

```typescript
appRouter {
  system: systemRouter,           // System operations (internal)

  auth: {
    me: query,                    // Get current user (public)
    login: mutation,              // OAuth login
    changePassword: mutation,     // Password management
    updateProfile: mutation,      // Profile updates
    logout: mutation,             // Session clearing
    completeOnboarding: mutation, // Onboarding completion
  },

  patrimonio: {
    list: query,                  // Get all assets
    search: query,                // Search with filters
    getById: query,               // Get single asset
    create: mutation,             // Create asset
    update: mutation,             // Update asset
    delete: mutation,             // Delete asset
  },

  analytics: {
    byCategoria: query,           // Category distribution
    byLocalizacao: query,         // Location distribution
  },

  sugestoes: {
    list: query,                  // All suggestions
    myList: query,                // User's suggestions
    create: mutation,             // Create suggestion
    updateStatus: mutation,       // Admin status update
  },

  relatorios: {
    exportExcel: query,           // Excel export
    exportPDF: query,             // PDF export
    exportMarkdown: query,        // Markdown export
  }
}
```

## Authentication Flow

1. **Login Page**: User enters Detran username (nome.sobrenome format)
2. **Cookie Storage**: Username stored in cookie (5min TTL)
3. **OAuth Redirect**: User redirected to Manus OAuth server
4. **OAuth Callback**: `/api/oauth/callback` handles token exchange
5. **User Upsert**: User created/updated in database
6. **Session Cookie**: `app_session_id` cookie set (1 year TTL)
7. **Client Storage**: User data cached in localStorage (`patrimonio_dtic_user`)

### Session Management
- **Cookie**: `app_session_id` - Base64 encoded JSON with userId
- **localStorage**: `patrimonio_dtic_user` - Full user object for client hydration
- **AuthContext**: React context provides `user`, `loading`, `isAuthenticated`

## Key Conventions

### Code Style
- **TypeScript strict mode** enabled
- **Prettier** formatting (80 char width, double quotes)
- **Path aliases**: `@/*` for client/src, `@shared/*` for shared
- **Component naming**: PascalCase
- **Function naming**: camelCase
- **Files**: Match export name

### UI/UX Patterns
- **UI Components**: Use shadcn/ui from `client/src/components/ui/`
- **Icons**: Lucide React exclusively
- **Notifications**: Sonner toast notifications
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS utility classes
- **Colors**: Detran blue (#0066CC) and green (#00AA44)

### API Patterns
- **Validation**: Zod schemas for all inputs
- **Error handling**: tRPC error codes
- **Database**: Always use Drizzle ORM helpers from `server/db.ts`
- **Storage**: Use helpers from `server/storage.ts` for S3

### Authentication
- **Protected routes**: Wrap with `<ProtectedRoute component={...} />`
- **Auth check**: Use `useAuth()` hook
- **tRPC context**: User available via `ctx.user` in protected procedures

## Testing

Tests are in `server/*.test.ts` using Vitest:

```bash
pnpm test              # Run all tests
pnpm test --watch     # Watch mode
```

Test utilities available:
- `createPublicContext()` - For public procedure tests
- `createAuthContext(userId)` - For protected procedure tests

## Environment Variables

Required variables (set in Manus platform or `.env`):
```
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=secure-secret-key
VITE_APP_ID=manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
```

## Important Files to Know

| File | Purpose |
|------|---------|
| `server/routers.ts` | All tRPC API procedures |
| `server/db.ts` | Database helper functions |
| `drizzle/schema.ts` | Database table definitions |
| `client/src/contexts/AuthContext.tsx` | Authentication state |
| `client/src/App.tsx` | Route definitions |
| `client/src/lib/trpc.ts` | tRPC client configuration |

## Common Tasks

### Adding a new tRPC procedure
1. Define Zod schema in `server/routers.ts`
2. Add procedure to appropriate router
3. Client can immediately use with type safety

### Adding a new page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add to sidebar in `DashboardLayout.tsx` if needed

### Adding a database field
1. Update schema in `drizzle/schema.ts`
2. Run `pnpm db:push` to generate and apply migration

### Adding a UI component
1. Use existing shadcn/ui from `client/src/components/ui/`
2. Or add new shadcn component (configured in `components.json`)

## Anti-Patterns to Avoid

1. **Don't** use raw SQL queries - use Drizzle ORM
2. **Don't** store sensitive data in localStorage (passwords, tokens)
3. **Don't** skip Zod validation on tRPC inputs
4. **Don't** use inline styles - use Tailwind classes
5. **Don't** create new UI primitives - use shadcn/ui
6. **Don't** hardcode Portuguese strings - but keep UI in Portuguese

## Deployment

Currently deployed on **Manus platform** with:
- Automatic environment variable injection
- OAuth integration
- Checkpoint-based versioning

Future migration planned to:
- Frontend: Vercel
- Backend: Vercel Functions
- Database: Supabase (PostgreSQL)

## Documentation

Additional documentation in `/docs`:
- `ARQUITETURA.md` - Detailed technical architecture
- `FLUXOS.md` - Business process flows
- `IDENTIDADE_VISUAL.md` - Design system and branding
- `TODO.md` - Feature backlog and progress
- `COMMITS.md` - Commit message conventions

## Git Workflow

- Branch naming: `claude/claude-md-<session-id>`
- Commit messages: Portuguese, descriptive
- Push: `git push -u origin <branch-name>`

---

*Last updated: January 2026*
