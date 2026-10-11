const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const carController = require("../controllers/carController");
const bookingController = require("../controllers/bookingController");
const purchaseController = require("../controllers/purchaseController");
const userController = require("../controllers/userController");

// Analytics metrics
router.get("/analytics", adminController.getAnalytics);

// Legacy admin add car route support
router.post("/addcar", carController.addCar);

// Management endpoints
router.get("/cars", carController.getCars);
router.get("/bookings", bookingController.getBookings);
router.get("/purchases", purchaseController.getPurchases);
router.get("/users", userController.getUsers);

module.exports = router;
