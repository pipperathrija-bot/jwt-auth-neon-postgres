# JWT Authentication — Node.js + Neon PostgreSQL

A complete JWT auth system using **Express**, **jsonwebtoken**, **bcryptjs**, and **Neon serverless PostgreSQL**.

---

## Project Structure

```
jwt-auth/
├── src/
│   ├── config/
│   │   ├── db.js            # Neon SQL client (singleton)
│   │   ├── db.init.js       # Run once to create tables
│   │   ├── jwt.config.js    # Reads secrets from .env
│   │   └── token.utils.js   # generate / verify token helpers
│   ├── controllers/
│   │   ├── auth.controller.js   # register, login, refresh, logout
│   │   └── user.controller.js   # profile, dashboard (protected)
│   ├── middleware/
│   │   └── auth.middleware.js   # protect() — guards private routes
│   ├── models/
│   │   └── user.model.js        # All SQL queries (Neon)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   ├── app.js
│   └── server.js
├── .env
└── package.json
```

---

## Setup

### 1. Get your Neon connection string

1. Go to https://console.neon.tech → create a project (free)
2. Open **Connection Details** → copy the **Connection string**
3. It looks like:
   ```
   postgresql://alice:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Fill in `.env`

```env
DATABASE_URL=postgresql://your_user:your_password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
ACCESS_TOKEN_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
REFRESH_TOKEN_SECRET=<run the same command again>
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the database tables (run once)

```bash
npm run db:init
```

This creates two tables in your Neon database:
- `users` — stores accounts
- `revoked_tokens` — stores logged-out refresh tokens

### 5. Start the server

```bash
npm run dev     # hot-reload with nodemon
# or
npm start
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Log in, receive tokens |
| POST | `/auth/refresh` | ❌ | Swap refresh → new access token |
| POST | `/auth/logout` | ❌ | Revoke refresh token |
| GET | `/api/profile` | 🔒 | Your profile |
| GET | `/api/dashboard` | 🔒 | Token info |

---

## Test with curl

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'

# Login — copy the accessToken
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# Protected route
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <paste-access-token>"

# Refresh
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<paste-refresh-token>"}'

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<paste-refresh-token>"}'
```

---

## Database Schema

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   TEXT         NOT NULL,   -- bcrypt hash
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE revoked_tokens (
  id         SERIAL PRIMARY KEY,
  token      TEXT         UNIQUE NOT NULL,  -- revoked refresh tokens
  revoked_at TIMESTAMPTZ  DEFAULT NOW()
);
```

---

## Security Notes

- Passwords are hashed with `bcrypt` (cost factor 10) — never stored plain
- Access tokens expire in **15 minutes** — keep them short-lived
- Refresh tokens are stored in **Neon** when revoked — survives server restarts
- Never commit `.env` to git — add it to `.gitignore`
- In production: serve over **HTTPS**, store refresh token in **HttpOnly cookie**
