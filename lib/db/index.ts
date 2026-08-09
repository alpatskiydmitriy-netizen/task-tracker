import { drizzle } from "drizzle-orm/libsql";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let _db: LibSQLDatabase<typeof schema> | null = null;

function initDb(): LibSQLDatabase<typeof schema> {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "tasks.db");

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const client = createClient({ url: `file:${dbPath}` });

  return drizzle(client, { schema });
}

export function getDb(): LibSQLDatabase<typeof schema> {
  if (!_db) {
    _db = initDb();
  }
  return _db;
}
