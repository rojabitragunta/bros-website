import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * One pooled client per server instance (reused across hot reloads in dev).
 * `prepare: false` keeps it compatible with transaction-mode poolers (Neon, Supabase).
 * Created lazily so importing this module never needs a live connection.
 */
const g = globalThis as unknown as { __brosDb?: ReturnType<typeof create> };

function create() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL (or POSTGRES_URL) is not set. See .env.example.");
  return drizzle({ client: postgres(url, { max: process.env.VERCEL ? 3 : 10, prepare: false, onnotice: () => {} }), schema });
}

const get = () => (g.__brosDb ??= create());

export const db = new Proxy({} as ReturnType<typeof create>, {
  get(_, key) {
    const d = get();
    const v = Reflect.get(d, key);
    return typeof v === "function" && key !== "$client" ? v.bind(d) : v;
  },
});

/** Closes the pool (scripts and tests only). */
export async function closeDb() {
  await g.__brosDb?.$client.end();
  g.__brosDb = undefined;
}

export type DB = ReturnType<typeof create>;
export type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];
export { schema };
