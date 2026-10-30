const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.");
}

/**
 * `sql` is a tagged-template function.
 * Usage:  const rows = await sql`SELECT * FROM users WHERE id = ${id}`
 *
 * The Neon serverless driver handles connection pooling automatically —
 * no need to manage a pool yourself.
 */
const sql = neon(process.env.DATABASE_URL);

module.exports = sql;
