const { body, validationResult } = require("express-validator");

/**
 * Middleware to check validation results and return formatted errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validate,
];

const loginValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  validate,
];

const tokenValidation = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("refreshToken is required"),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  tokenValidation,
};
