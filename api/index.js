import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import reminderScheduler from "./reminderScheduler.js"; // Import the reminder scheduler

import jwt from "jsonwebtoken";

const app = express();

app.use(cors());
app.use(express.json());

// Middleware to authenticate and populate req.user


// Public routes (no token needed)
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointments" , patientRoutes);

// Protected routes (token required)
// Doctor routes (auth handled inside doctorRoutes.js)
app.use("/api/doctors", doctorRoutes);

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB Connected');
    reminderScheduler(); // start the cron reminders after DB is connected
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
