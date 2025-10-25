import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /**
   * Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user.
   * This mirrors the Manus account and should be used for authentication lookups.
   */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Quotations table to store customer quotations
 */
export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  customerName: varchar("customerName", { length: 255 }),
  quotationNumber: varchar("quotationNumber", { length: 100 }).notNull().unique(),
  exchangeRate: varchar("exchangeRate", { length: 20 }).default("7.1").notNull(),
  taxRate: varchar("taxRate", { length: 20 }).default("0.13").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

/**
 * Quotation items table to store individual products in a quotation
 */
export const quotationItems = mysqlTable("quotationItems", {
  id: int("id").autoincrement().primaryKey(),
  quotationId: int("quotationId").notNull(), // Foreign key to quotations table
  product: varchar("product", { length: 255 }).notNull(),
  description: text("description"),
  specimen: varchar("specimen", { length: 255 }),
  format: varchar("format", { length: 255 }),
  pack: varchar("pack", { length: 255 }),
  quantity: int("quantity").default(1).notNull(),
  baseUsdFinished: varchar("baseUsdFinished", { length: 20 }).notNull(),
  baseRmbFinished: varchar("baseRmbFinished", { length: 20 }).notNull(),
  baseUsdBulk: varchar("baseUsdBulk", { length: 20 }),
  baseRmbBulk: varchar("baseRmbBulk", { length: 20 }),
  markupPercentage: varchar("markupPercentage", { length: 20 }).default("0.10").notNull(),
  finalUsdFinished: varchar("finalUsdFinished", { length: 20 }).notNull(),
  finalRmbFinished: varchar("finalRmbFinished", { length: 20 }).notNull(),
  finalUsdBulk: varchar("finalUsdBulk", { length: 20 }),
  finalRmbBulk: varchar("finalRmbBulk", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;

