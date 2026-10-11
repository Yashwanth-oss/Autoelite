const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected user routes
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);

// Admin-only routes
router.get("/", protect, adminOnly, userController.getUsers);

module.exports = router;
