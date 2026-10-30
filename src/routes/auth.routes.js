const express = require("express");
const { register, login, refresh, logout } = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
  tokenValidation,
} = require("../middleware/validation.middleware");

const router = express.Router();

router.post("/register", registerValidation, register); // Create account
router.post("/login", loginValidation, login);          // Log in, receive tokens
router.post("/refresh", tokenValidation, refresh);      // Exchange refresh token → new access token
router.post("/logout", tokenValidation, logout);        // Revoke refresh token

module.exports = router;
