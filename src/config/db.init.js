/**
 * Run once to create the database tables:
 *   node src/config/db.init.js
 */
require("dotenv").config();
const sql = require("./db");

async function init() {
  console.log("🔧 Creating tables in Neon PostgreSQL...\n");

  // ── users table ────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      username    VARCHAR(50)  UNIQUE NOT NULL,
      email       VARCHAR(255) UNIQUE NOT NULL,
      password    TEXT         NOT NULL,
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `;
  console.log("✅  users table ready");

  // ── revoked_tokens table ───────────────────────────────────────────────────
  // Stores refresh tokens that have been explicitly logged out.
  // Rows with an expired token are automatically cleaned up by the prune job
  // (or you can add a pg_cron / Neon scheduled query for that).
  await sql`
    CREATE TABLE IF NOT EXISTS revoked_tokens (
      id          SERIAL PRIMARY KEY,
      token       TEXT         UNIQUE NOT NULL,
      revoked_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `;
  console.log("✅  revoked_tokens table ready");

  console.log("\n🎉 Database initialised successfully!");
  process.exit(0);
}

init().catch((err) => {
  console.error("❌ DB init failed:", err.message);
  process.exit(1);
});
