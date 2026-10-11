const Purchase = require("../models/Purchase");
const Car = require("../models/Car");
const mongoose = require("mongoose");

// Create purchase
exports.createPurchase = async (req, res) => {
  try {
    const { car_id, carId, carName, name, email, payment, amount } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const targetCarId = car_id || carId;
    let foundCar = null;

    if (targetCarId && mongoose.Types.ObjectId.isValid(targetCarId)) {
      foundCar = await Car.findById(targetCarId);
    } else if (carName) {
      foundCar = await Car.findOne({ name: { $regex: new RegExp(`^${carName}$`, "i") } });
    }

    const finalAmount = amount || (foundCar ? foundCar.price : 0);

    const purchase = new Purchase({
      car: foundCar ? foundCar._id : undefined,
      carName: foundCar ? foundCar.name : (carName || "Vehicle Order"),
      carImage: foundCar ? foundCar.image : (req.body.image || "mercedes.jpg"),
      name,
      email,
      amount: finalAmount,
      payment: payment || "UPI",
      status: "Completed",
    });

    await purchase.save();

    res.status(201).json({
      message: "Purchase order created successfully",
      purchase,
      transactionId: purchase.transactionId,
    });
  } catch (error) {
    console.error("Purchase Error:", error);
    res.status(500).json({ message: "Error processing purchase", error: error.message });
  }
};

// Get all purchases
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("car").sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Error fetching purchases", error: error.message });
  }
};
