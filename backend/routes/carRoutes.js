const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const carController = require("../controllers/carController");

// Multer storage for uploaded vehicle photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/images"));
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    cb(null, `${safeName}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are permitted."));
    }
  },
});

// Image upload route
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided." });
  }
  res.json({
    message: "Image uploaded successfully",
    filename: req.file.filename,
    url: `images/${req.file.filename}`,
  });
});

// GET all cars
router.get("/", carController.getCars);

// GET single car by ID or name
router.get("/:id", carController.getCarById);

// ADD new car
router.post("/add", carController.addCar);
router.post("/", carController.addCar);

// UPDATE car
router.put("/:id", carController.updateCar);

// DELETE car
router.delete("/:id", carController.deleteCar);

module.exports = router;
