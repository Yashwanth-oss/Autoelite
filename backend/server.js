const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const carRoutes = require("./routes/carRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const adminRoutes = require("./routes/adminRoutes");
const carController = require("./controllers/carController");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, "..", "frontend")));


// API Routes
app.use("/api/cars", carRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/admin", adminRoutes);

// Compatibility fallback for legacy frontend routes
app.post("/addcar", carController.addCar);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "AutoElite API",
    database: "MongoDB",
    time: new Date().toISOString(),
  });
});

// Fallback to index.html for any unhandled page request
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});


// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚗 AutoElite Server running at http://localhost:${PORT}`);
  console.log(`🌐 Frontend accessible at http://localhost:${PORT}`);
  console.log(`📦 MongoDB Database connected`);
});
