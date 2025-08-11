// api/index.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

// Import your routes
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// --- Primary Setup ---
const app = express();
const httpServer = createServer(app);

// --- Health Check Route ---
// IMPORTANT: This MUST be defined before any CORS middleware.
// This route will be used by Render for health checks.
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// --- CORS Configuration ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://health-monitoring-website.vercel.app",
];

const corsOptions = {
  origin: allowedOrigins, // Directly pass the array
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
};

// --- Middleware ---
// IMPORTANT: This section MUST come before the routes.
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// --- Socket.IO Server ---
const io = new Server(httpServer, {
  cors: corsOptions, // Use the same CORS options
});

// Your socket connection logic...
const doctorSockets = {};
const patientSockets = {};
io.on('connection', (socket) => {
  // ... (your existing socket registration and disconnect logic)
});

// Make socket instance available to routes
app.set('io', io);
app.set('doctorSockets', doctorSockets);
app.set('patientSockets', patientSockets);

// --- API Routes ---
// This section MUST come AFTER the middleware.
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/appointments", patientRoutes);

// --- Database Connection & Server Start ---
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('✅ MongoDB Connected');
    httpServer.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
