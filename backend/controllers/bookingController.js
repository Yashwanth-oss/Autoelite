const Booking = require("../models/Booking");
const Car = require("../models/Car");
const mongoose = require("mongoose");

const STANDARD_TIME_SLOTS = [
  "10:00 AM - 11:30 AM",
  "11:30 AM - 01:00 PM",
  "02:00 PM - 03:30 PM",
  "04:00 PM - 05:30 PM",
  "05:30 PM - 07:00 PM",
];

// Book test drive
exports.bookTestDrive = async (req, res) => {
  try {
    const {
      car_id,
      carId,
      carName,
      user_name,
      name,
      email,
      phone,
      date,
      booking_date,
      timeSlot,
      locationType,
      notes,
    } = req.body;

    const applicantName = name || user_name;
    const applicantEmail = email;
    const targetCarId = car_id || carId;
    const slotChosen = timeSlot || "10:00 AM - 11:30 AM";
    const selectedDate = new Date(date || booking_date || Date.now());

    if (!applicantName || !applicantEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    let foundCar = null;
    if (targetCarId && mongoose.Types.ObjectId.isValid(targetCarId)) {
      foundCar = await Car.findById(targetCarId);
    } else if (carName) {
      foundCar = await Car.findOne({ name: { $regex: new RegExp(`^${carName}$`, "i") } });
    }

    // Check if slot is already booked for this car on this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      ...(foundCar ? { car: foundCar._id } : { carName: carName || "Selected Vehicle" }),
      timeSlot: slotChosen,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: `The time slot "${slotChosen}" is already reserved for this date. Please choose another slot.`,
      });
    }

    const booking = new Booking({
      car: foundCar ? foundCar._id : undefined,
      carName: foundCar ? foundCar.name : (carName || "Selected Vehicle"),
      carImage: foundCar ? foundCar.image : (req.body.image || "mercedes.jpg"),
      user: req.user ? req.user._id : undefined,
      userName: applicantName,
      email: applicantEmail,
      phone: phone || "",
      bookingDate: selectedDate,
      timeSlot: slotChosen,
      locationType: locationType || "Showroom Visit",
      status: "Confirmed",
      notes: notes || "",
    });

    await booking.save();

    res.status(201).json({
      message: "VIP Test Drive booked successfully!",
      booking,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Error booking test drive", error: error.message });
  }
};

// Check available slots for a car & date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { carId, date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    let query = {
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Pending", "Confirmed"] },
    };

    if (carId && mongoose.Types.ObjectId.isValid(carId)) {
      query.car = carId;
    }

    const booked = await Booking.find(query).select("timeSlot");
    const bookedSlots = booked.map((b) => b.timeSlot);

    const slotResults = STANDARD_TIME_SLOTS.map((slot) => ({
      slot,
      available: !bookedSlots.includes(slot),
    }));

    res.json({ date, slots: slotResults });
  } catch (error) {
    res.status(500).json({ message: "Error fetching slot availability", error: error.message });
  }
};

// Get all bookings (admin or filtered)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("car").sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking updated", booking: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
};

// Cancel / delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ message: "Booking cancelled/deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking", error: error.message });
  }
};
