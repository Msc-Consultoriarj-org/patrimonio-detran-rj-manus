import { eq, like, sql, and, desc, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, patrimonios, InsertPatrimonio, sugestoes, InsertSugestao, patrimonioHistorico, InsertPatrimonioHistorico } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// User Helpers
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "detranLogin"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ passwordHash, mustChangePassword: 0, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserProfile(userId: number, data: { name?: string; email?: string; hasCompletedOnboarding?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ============================================
// Patrimonio Helpers
// ============================================

export async function createPatrimonio(data: InsertPatrimonio): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(patrimonios).values(data);
  // Retorna o ID do patrimônio inserido
  return Number(result[0].insertId);
}

export async function getPatrimoniosByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select()
    .from(patrimonios)
    .where(eq(patrimonios.userId, userId))
    .orderBy(desc(patrimonios.createdAt));

  return result;
}

export async function getAllPatrimonios() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select()
    .from(patrimonios)
    .orderBy(desc(patrimonios.createdAt));

  return result;
}

export async function getPatrimonioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select()
    .from(patrimonios)
    .where(eq(patrimonios.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePatrimonio(id: number, data: Partial<InsertPatrimonio>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(patrimonios)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(patrimonios.id, id));
}

export async function deletePatrimonio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(patrimonios).where(eq(patrimonios.id, id));
}

export async function searchPatrimonios(searchTerm: string, categoria?: string, localizacao?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (searchTerm) {
    conditions.push(
      or(
        like(patrimonios.descricao, `%${searchTerm}%`),
        like(patrimonios.numeroSerie, `%${searchTerm}%`),
        like(patrimonios.responsavel, `%${searchTerm}%`)
      )
    );
  }

  if (categoria) {
    conditions.push(eq(patrimonios.categoria, categoria));
  }

  if (localizacao) {
    conditions.push(like(patrimonios.localizacao, `%${localizacao}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Ordenar por localização (andar) e depois por categoria (equipamento)
  const result = await db.select()
    .from(patrimonios)
    .where(whereClause)
    .orderBy(patrimonios.localizacao, patrimonios.categoria, patrimonios.descricao);

  return result;
}

// ============================================
// Sugestoes Helpers
// ============================================

export async function createSugestao(sugestao: InsertSugestao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sugestoes).values(sugestao);
}

export async function getAllSugestoes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(sugestoes)
    .orderBy(desc(sugestoes.createdAt));

  return result;
}

export async function getSugestoesByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(sugestoes)
    .where(eq(sugestoes.userId, userId))
    .orderBy(desc(sugestoes.createdAt));

  return result;
}

export async function updateSugestaoStatus(id: number, status: "pendente" | "em_analise" | "aprovada" | "rejeitada") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(sugestoes)
    .set({ status, updatedAt: new Date() })
    .where(eq(sugestoes.id, id));
}

// ============================================
// Analytics Helpers
// ============================================

export async function getPatrimoniosByCategoria() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select({
    categoria: patrimonios.categoria,
    count: sql<number>`COUNT(*)`.as('count'),
    totalValor: sql<number>`SUM(${patrimonios.valor})`.as('totalValor')
  })
    .from(patrimonios)
    .groupBy(patrimonios.categoria);

  return result;
}

export async function getPatrimoniosByLocalizacao() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select({
    localizacao: patrimonios.localizacao,
    count: sql<number>`COUNT(*)`.as('count'),
    totalValor: sql<number>`SUM(${patrimonios.valor})`.as('totalValor')
  })
    .from(patrimonios)
    .groupBy(patrimonios.localizacao);

  return result;
}

// ============================================
// Histórico de Patrimônios (Auditoria)
// ============================================

export async function createHistorico(historico: InsertPatrimonioHistorico) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(patrimonioHistorico).values(historico);
}

export async function getHistoricoByPatrimonio(patrimonioId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(patrimonioHistorico)
    .where(eq(patrimonioHistorico.patrimonioId, patrimonioId))
    .orderBy(desc(patrimonioHistorico.createdAt));

  return result;
}

export async function getAllHistorico(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(patrimonioHistorico)
    .orderBy(desc(patrimonioHistorico.createdAt))
    .limit(limit);

  return result;
}

// ============================================
// Alertas e Pendências
// ============================================

export async function getPatrimoniosSemNumeroSerie() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(patrimonios)
    .where(
      or(
        eq(patrimonios.numeroSerie, ''),
        sql`${patrimonios.numeroSerie} IS NULL`
      )
    )
    .orderBy(patrimonios.localizacao);

  return result;
}

export async function getPatrimoniosSemResponsavel() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(patrimonios)
    .where(
      or(
        eq(patrimonios.responsavel, ''),
        sql`${patrimonios.responsavel} IS NULL`
      )
    )
    .orderBy(patrimonios.localizacao);

  return result;
}

export async function getPatrimoniosSemLocalizacao() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(patrimonios)
    .where(
      or(
        eq(patrimonios.localizacao, ''),
        sql`${patrimonios.localizacao} IS NULL`
      )
    );

  return result;
}

export async function getAlertasSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const semNumeroSerie = await db.select({ count: sql<number>`COUNT(*)` })
    .from(patrimonios)
    .where(
      or(
        eq(patrimonios.numeroSerie, ''),
        sql`${patrimonios.numeroSerie} IS NULL`
      )
    );

  const semResponsavel = await db.select({ count: sql<number>`COUNT(*)` })
    .from(patrimonios)
    .where(
      or(
        eq(patrimonios.responsavel, ''),
        sql`${patrimonios.responsavel} IS NULL`
      )
    );

  const semLocalizacao = await db.select({ count: sql<number>`COUNT(*)` })
    .from(patrimonios)
    .where(
      or(
        eq(patrimonios.localizacao, ''),
        sql`${patrimonios.localizacao} IS NULL`
      )
    );

  return {
    semNumeroSerie: Number(semNumeroSerie[0]?.count || 0),
    semResponsavel: Number(semResponsavel[0]?.count || 0),
    semLocalizacao: Number(semLocalizacao[0]?.count || 0),
  };
}
