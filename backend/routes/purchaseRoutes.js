const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");

// Create purchase
router.post("/", purchaseController.createPurchase);
router.post("/purchase", purchaseController.createPurchase);

// Get all purchases
router.get("/", purchaseController.getPurchases);

module.exports = router;
