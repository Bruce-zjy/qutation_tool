import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Parse the DATABASE_URL and provide explicit credentials with TLS enabled for TiDB Cloud
const url = new URL(databaseUrl);
const dbCredentials = {
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  ssl: {
    // TiDB Cloud requires TLS 1.2+; mysql2 will use system CAs
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
};

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials,
});
