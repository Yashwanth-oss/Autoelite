const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Check slot availability
router.get("/slots", bookingController.getAvailableSlots);

// Book test drive
router.post("/testdrive", bookingController.bookTestDrive);
router.post("/", bookingController.bookTestDrive);

// Get all bookings
router.get("/", bookingController.getBookings);

// Update status
router.patch("/:id/status", bookingController.updateBookingStatus);

// Delete/cancel booking
router.delete("/:id", bookingController.deleteBooking);

module.exports = router;
