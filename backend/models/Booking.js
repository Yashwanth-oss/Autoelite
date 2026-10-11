const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
    carName: {
      type: String,
      default: "",
    },
    carImage: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    timeSlot: {
      type: String,
      default: "10:00 AM - 11:30 AM",
    },
    locationType: {
      type: String,
      enum: ["Showroom Visit", "Doorstep VIP Delivery"],
      default: "Showroom Visit",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Confirmed",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Booking", bookingSchema);
