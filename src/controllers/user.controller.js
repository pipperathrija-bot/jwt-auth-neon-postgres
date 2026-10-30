const UserStore = require("../models/user.model");

/**
 * GET /api/profile  🔒 protected
 */
async function getProfile(req, res) {
  const user = await UserStore.findById(req.user.sub);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  return res.status(200).json({
    success: true,
    profile: {
      id:        user.id,
      username:  user.username,
      email:     user.email,
      createdAt: user.created_at,
    },
  });
}

/**
 * GET /api/dashboard  🔒 protected
 */
function getDashboard(req, res) {
  return res.status(200).json({
    success: true,
    message: `Welcome to the dashboard, ${req.user.username}!`,
    tokenInfo: {
      userId:    req.user.sub,
      issuedAt:  new Date(req.user.iat * 1000).toISOString(),
      expiresAt: new Date(req.user.exp * 1000).toISOString(),
    },
  });
}

module.exports = { getProfile, getDashboard };
