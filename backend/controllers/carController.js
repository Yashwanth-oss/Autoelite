const Car = require("../models/Car");
const mongoose = require("mongoose");

// Get all cars with optional search, brand, category filters
exports.getCars = async (req, res) => {
  try {
    const { search, brand, category, featured } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { specs: { $regex: search, $options: "i" } },
      ];
    }

    if (brand && brand !== "all") {
      query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
    }

    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (featured === "true") {
      query.featured = true;
    }

    const cars = await Car.find(query).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Error fetching cars", error: error.message });
  }
};

// Get single car by ID
exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    let car;
    if (mongoose.Types.ObjectId.isValid(id)) {
      car = await Car.findById(id);
    } else {
      // Fallback search by name
      car = await Car.findOne({ name: { $regex: new RegExp(`^${id}$`, "i") } });
    }

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Support both single object and array output for legacy frontend compatibility
    res.json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ message: "Error fetching car", error: error.message });
  }
};

// Add new car
exports.addCar = async (req, res) => {
  try {
    const { name, brand, price, image, specs, category, fuelType, power, acceleration, topSpeed, featured } = req.body;

    if (!name || !brand || !price) {
      return res.status(400).json({ message: "Name, brand, and price are required" });
    }

    const newCar = new Car({
      name,
      brand,
      price: Number(price),
      image: image || "mercedes.jpg",
      specs: specs || "",
      category: category || "Luxury",
      fuelType: fuelType || "Petrol",
      power: power || "",
      acceleration: acceleration || "",
      topSpeed: topSpeed || "",
      featured: featured === true || featured === "true",
    });

    await newCar.save();
    res.status(201).json({ message: "Car Added Successfully", car: newCar });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ message: "Error adding car", error: error.message });
  }
};

// Update car
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Car.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Car not found" });
    res.json({ message: "Car updated successfully", car: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating car", error: error.message });
  }
};

// Delete car
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Car.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Car not found" });
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting car", error: error.message });
  }
};
