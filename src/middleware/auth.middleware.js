const { verifyAccessToken } = require("../config/token.utils");

/**
 * protect — middleware that guards any route requiring authentication.
 *
 * It expects the client to send the access token in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success, it attaches req.user = { sub, username, email } for downstream handlers.
 * On failure, it returns 401 Unauthorized.
 */
function protect(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Header must exist and start with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access token missing. Include 'Authorization: Bearer <token>' header.",
    });
  }

  const token = authHeader.split(" ")[1]; // extract the token part

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // pass user info to the next handler
    next();
  } catch (err) {
    // jwt.verify throws different errors — surface them clearly
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired. Use /auth/refresh to get a new one.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid access token.",
    });
  }
}

module.exports = { protect };
