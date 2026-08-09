const { drizzle } = require("drizzle-orm/libsql");
const { migrate } = require("drizzle-orm/libsql/migrator");
const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "tasks.db");

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const client = createClient({ url: `file:${dbPath}` });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: path.join(__dirname, "..", "drizzle") });

  console.log("Migrations applied to", dbPath);
  client.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
