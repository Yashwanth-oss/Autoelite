const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Car name is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    image: {
      type: String,
      required: [true, "Image filename is required"],
    },
    specs: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["Sedan", "SUV", "Sports", "Electric", "Luxury"],
      default: "Luxury",
    },
    fuelType: {
      type: String,
      default: "Petrol",
    },
    power: {
      type: String,
      default: "",
    },
    acceleration: {
      type: String,
      default: "",
    },
    topSpeed: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual id property matching old SQL 'id'
carSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Car", carSchema);
