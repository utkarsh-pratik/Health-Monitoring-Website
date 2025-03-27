import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables

import express from "express";
import mongoose from "mongoose";
import cors from "cors";  // ✅ Allow frontend requests
import authRoutes from "./routes/authRoutes.js";  // ✅ Import authentication routes
import doctorRoutes from "./routes/doctorRoutes.js";  // ✅ Import doctor routes
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());  // ✅ Enable CORS for frontend requests
app.use(express.json());  // ✅ Required to parse JSON requests


// Middleware to authenticate and populate req.user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Token missing." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Populate req.user with decoded token data
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
};

// Apply authentication middleware globally or to specific routes
app.use(authenticate); // Apply globally (optional)

// ✅ Register auth routes
app.use("/api/auth", authRoutes);

// ✅ Register doctor routes
app.use("/api/doctors", doctorRoutes);


mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on http://localhost:${PORT}`));
