const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
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
    name: {
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
    amount: {
      type: Number,
      default: 0,
    },
    payment: {
      type: String,
      enum: ["UPI", "Card", "Net Banking", "Cash", "Financing"],
      default: "UPI",
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Failed"],
      default: "Completed",
    },
    transactionId: {
      type: String,
      default: () => "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

purchaseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Purchase", purchaseSchema);
