const sql = require("../config/db");

/**
 * All database interactions for users and token revocation.
 * Every function is async and talks to Neon PostgreSQL.
 */
const UserStore = {

  // ── User queries ────────────────────────────────────────────────────────────

  /** Find a user by username — returns null if not found */
  async findByUsername(username) {
    const rows = await sql`
      SELECT id, username, email, password, created_at
      FROM   users
      WHERE  username = ${username}
      LIMIT  1
    `;
    return rows[0] ?? null;
  },

  /** Find a user by their numeric ID — returns null if not found */
  async findById(id) {
    const rows = await sql`
      SELECT id, username, email, created_at
      FROM   users
      WHERE  id = ${id}
      LIMIT  1
    `;
    return rows[0] ?? null;
  },

  /** Insert a new user, return the created row (without password) */
  async create({ username, email, hashedPassword }) {
    const rows = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email, created_at
    `;
    return rows[0];
  },

  // ── Refresh token revocation ─────────────────────────────────────────────

  /** Add a refresh token to the revocation list (on logout) */
  async revokeToken(token) {
    await sql`
      INSERT INTO revoked_tokens (token)
      VALUES (${token})
      ON CONFLICT (token) DO NOTHING
    `;
  },

  /** Returns true if the token has been revoked */
  async isTokenRevoked(token) {
    const rows = await sql`
      SELECT 1 FROM revoked_tokens WHERE token = ${token} LIMIT 1
    `;
    return rows.length > 0;
  },
};

module.exports = UserStore;
