const Car = require("../models/Car");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Purchase = require("../models/Purchase");

exports.getAnalytics = async (req, res) => {
  try {
    const carsCount = await Car.countDocuments();
    const usersCount = await User.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    const purchasesCount = await Purchase.countDocuments();

    const revenueResult = await Purchase.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    const recentPurchases = await Purchase.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      cars: carsCount,
      users: usersCount,
      bookings: bookingsCount,
      purchases: purchasesCount,
      revenue: totalRevenue,
      recentBookings,
      recentPurchases,
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);
    res.status(500).json({ message: "Error fetching analytics", error: error.message });
  }
};
