import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local and .env
function loadEnv() {
  const envs = [".env.local", ".env"];
  const config = {};
  for (const file of envs) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const parts = trimmed.split("=");
          const key = parts[0].trim();
          let val = parts.slice(1).join("=").trim();
          // Remove wrapping quotes if present
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          }
          if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
          }
          if (!(key in config)) {
            config[key] = val;
          }
        }
      }
    }
  }
  return config;
}

const env = { ...process.env, ...loadEnv() };
const url = env.DATABASE_URL || "file:./dev.db";
const authToken = env.DATABASE_AUTH_TOKEN || undefined;

console.log("Connecting to database at:", url);

const client = createClient({ url, authToken });

const queries = [
  'ALTER TABLE "Event" ADD COLUMN "badgeQrPositionX" INTEGER NOT NULL DEFAULT 50',
  'ALTER TABLE "Event" ADD COLUMN "badgeQrPositionY" INTEGER NOT NULL DEFAULT 70',
  'ALTER TABLE "Event" ADD COLUMN "badgeQrSize" INTEGER NOT NULL DEFAULT 25'
];

for (const q of queries) {
  try {
    await client.execute(q);
    console.log(`Executed: ${q}`);
  } catch (err) {
    const msg = err.message || "";
    if (
      msg.includes("duplicate column") || 
      msg.includes("already exists") || 
      msg.includes("already has a column")
    ) {
      console.log(`Column already exists, skipping: ${q}`);
    } else {
      console.error(`Error executing: ${q}`, err);
    }
  }
}

console.log("Migration complete!");
process.exit(0);
