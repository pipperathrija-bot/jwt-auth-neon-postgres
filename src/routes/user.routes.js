const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getProfile, getDashboard } = require("../controllers/user.controller");

const router = express.Router();

// All routes below require a valid access token
router.use(protect);

router.get("/profile", getProfile);
router.get("/dashboard", getDashboard);

module.exports = router;
