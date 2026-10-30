require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🔐 JWT Auth API running on http://localhost:${PORT}`);
  console.log(`   POST  /auth/register   — create account`);
  console.log(`   POST  /auth/login      — log in`);
  console.log(`   POST  /auth/refresh    — refresh access token`);
  console.log(`   POST  /auth/logout     — revoke refresh token`);
  console.log(`   GET   /api/profile     — 🔒 protected`);
  console.log(`   GET   /api/dashboard   — 🔒 protected\n`);
});
