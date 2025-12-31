import { eq, like, or, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, patrimonios, InsertPatrimonio } from "../drizzle/schema";
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

    const textFields = ["name", "email", "loginMethod"] as const;
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

export async function updateUserProfile(userId: number, data: { name?: string; email?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ============================================
// Patrimonio Helpers
// ============================================

export async function createPatrimonio(data: InsertPatrimonio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(patrimonios).values(data);
  return result;
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

  const result = await db.select()
    .from(patrimonios)
    .where(whereClause)
    .orderBy(desc(patrimonios.createdAt));

  return result;
}
