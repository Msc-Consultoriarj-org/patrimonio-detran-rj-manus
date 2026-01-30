import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários com autenticação local e controle de acesso
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  detranLogin: varchar("detranLogin", { length: 64 }).unique(),
  username: varchar("username", { length: 64 }).unique(),
  passwordHash: text("passwordHash"),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  mustChangePassword: int("mustChangePassword").default(1).notNull(),
  hasCompletedOnboarding: int("hasCompletedOnboarding").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Tabela de patrimônios de informática do Detran-RJ
 */
export const patrimonios = mysqlTable("patrimonios", {
  id: int("id").autoincrement().primaryKey(),
  descricao: text("descricao").notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  valor: varchar("valor", { length: 20 }).notNull(),
  localizacao: varchar("localizacao", { length: 200 }).notNull(),
  numeroSerie: varchar("numeroSerie", { length: 100 }),
  dataAquisicao: timestamp("dataAquisicao").notNull(),
  responsavel: varchar("responsavel", { length: 200 }).notNull(),
  imageUrl: text("imageUrl"),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Patrimonio = typeof patrimonios.$inferSelect;
export type InsertPatrimonio = typeof patrimonios.$inferInsert;

export const sugestoes = mysqlTable("sugestoes", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  descricao: text("descricao").notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta"]).default("media").notNull(),
  status: mysqlEnum("status", ["pendente", "em_analise", "aprovada", "rejeitada"]).default("pendente").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sugestao = typeof sugestoes.$inferSelect;
export type InsertSugestao = typeof sugestoes.$inferInsert;

/**
 * Tabela de histórico de movimentações/alterações de patrimônios (Auditoria)
 */
export const patrimonioHistorico = mysqlTable("patrimonio_historico", {
  id: int("id").autoincrement().primaryKey(),
  patrimonioId: int("patrimonioId").notNull(),
  userId: int("userId").notNull(),
  tipoAcao: mysqlEnum("tipoAcao", ["criacao", "edicao", "exclusao", "movimentacao"]).notNull(),
  campoAlterado: varchar("campoAlterado", { length: 100 }),
  valorAnterior: text("valorAnterior"),
  valorNovo: text("valorNovo"),
  descricaoAcao: text("descricaoAcao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PatrimonioHistorico = typeof patrimonioHistorico.$inferSelect;
export type InsertPatrimonioHistorico = typeof patrimonioHistorico.$inferInsert;
