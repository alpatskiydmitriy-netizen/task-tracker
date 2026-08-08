import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Подключение создаётся ЛЕНИВО — только при первом реальном обращении к БД,
// а не при импорте модуля. Next.js импортирует API-роуты во время сборки
// (шаг "Collecting page data"), и если бы мы создавали Database() сразу,
// это происходило бы на сборочной машине, где ещё нет файла базы данных —
// это может уронить нативный модуль better-sqlite3 (SIGSEGV на некоторых окружениях).

let _db: BetterSQLite3Database<typeof schema> | null = null;

function initDb(): BetterSQLite3Database<typeof schema> {
  // require вместо import, чтобы модуль better-sqlite3 подгружался тоже лениво
  const Database = require("better-sqlite3");

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "tasks.db");

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");

  return drizzle(sqlite, { schema });
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!_db) {
    _db = initDb();
  }
  return _db;
}
