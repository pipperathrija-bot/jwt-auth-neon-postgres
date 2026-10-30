const express = require("express");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Parse JSON request bodies
app.use(express.json());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts
  message: { success: false, message: "Too many attempts. Try again later." }
});

app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

const path = require("path");

// Serve frontend UI
app.use(express.static(path.join(__dirname, "../public")));

// Health check API (unprotected)
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "JWT Auth API is running. See README for endpoint docs." });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);   // /auth/register, /auth/login, etc.
app.use("/api", userRoutes);    // /api/profile, /api/dashboard (protected)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

module.exports = app;
