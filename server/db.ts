import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2/promise";
import { InsertUser, users, quotations, quotationItems, InsertQuotation, InsertQuotationItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // 创建带有SSL配置的MySQL连接池
      const url = new URL(process.env.DATABASE_URL);
      const pool = mysql.createPool({
        host: url.hostname,
        port: url.port ? Number(url.port) : 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
        ssl: {
          // TiDB Cloud要求TLS 1.2+
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
        },
      });
      
      // 使用连接池创建drizzle实例
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

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
    } else if (user.openId === ENV.ownerId) {
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

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Quotation-related database helpers

export async function createQuotation(quotation: InsertQuotation) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(quotations).values(quotation);
  return result;
}

export async function getQuotationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(quotations).where(eq(quotations.userId, userId)).orderBy(desc(quotations.createdAt));
}

export async function getQuotationById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuotationByNumber(quotationNumber: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(quotations).where(eq(quotations.quotationNumber, quotationNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuotationItem(item: InsertQuotationItem) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(quotationItems).values(item);
  return result;
}

export async function getQuotationItemsByQuotationId(quotationId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotationId));
}

export async function deleteQuotation(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // First delete all items associated with this quotation
  await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
  
  // Then delete the quotation itself
  await db.delete(quotations).where(eq(quotations.id, id));
}

