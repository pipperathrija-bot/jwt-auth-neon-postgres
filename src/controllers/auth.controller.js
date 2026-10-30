const bcrypt = require("bcryptjs");
const UserStore = require("../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../config/token.utils");

// ─── REGISTER ────────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * Body: { username, email, password }
 */
async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "username, email, and password are all required.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
  }

  // Check duplicate username (Postgres UNIQUE constraint also guards this)
  const existing = await UserStore.findByUsername(username);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Username already taken.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await UserStore.create({ username, email, hashedPassword });
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    // Catch Postgres unique-constraint violation on email
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }
    throw err; // let the global error handler catch the rest
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Body: { username, password }
 */
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "username and password are required.",
    });
  }

  const user = await UserStore.findByUsername(username);

  // Same message for "not found" and "wrong password" — don't leak which
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password.",
    });
  }

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    accessToken,
    refreshToken,
  });
}

// ─── REFRESH ──────────────────────────────────────────────────────────────────

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 */
async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "refreshToken is required.",
    });
  }

  // Check revocation list in Neon
  const revoked = await UserStore.isTokenRevoked(refreshToken);
  if (revoked) {
    return res.status(401).json({
      success: false,
      message: "Refresh token has been revoked. Please log in again.",
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user    = await UserStore.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    const newAccessToken = generateAccessToken(user);
    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token. Please log in again.",
    });
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

/**
 * POST /auth/logout
 * Body: { refreshToken }
 */
async function logout(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "refreshToken is required.",
    });
  }

  await UserStore.revokeToken(refreshToken); // persisted to Neon

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

module.exports = { register, login, refresh, logout };
