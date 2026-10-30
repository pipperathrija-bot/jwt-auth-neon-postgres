const jwt = require("jsonwebtoken");
const {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiry,
  refreshTokenExpiry,
} = require("./jwt.config");

/**
 * Generate a short-lived access token (default: 15 minutes).
 * Contains the user's id, username, and email as payload.
 */
function generateAccessToken(user) {
  const payload = {
    sub: user.id,       // "subject" — who this token is about
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, accessTokenSecret, { expiresIn: accessTokenExpiry });
}

/**
 * Generate a long-lived refresh token (default: 7 days).
 * Only contains the user id — minimise data in long-lived tokens.
 */
function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiry,
  });
}

/**
 * Verify an access token. Returns the decoded payload or throws.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, accessTokenSecret);
}

/**
 * Verify a refresh token. Returns the decoded payload or throws.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, refreshTokenSecret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
