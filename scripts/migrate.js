const { drizzle } = require("drizzle-orm/better-sqlite3");
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "tasks.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: path.join(__dirname, "..", "drizzle") });

console.log("Migrations applied to", dbPath);
sqlite.close();
