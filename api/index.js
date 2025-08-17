// api/index.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authMiddleware.js";
import { bookAppointment, getMyAppointments } from "./controllers/patientController.js";

// Import your routes
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import videoCallRoutes from "./routes/videoCallRoutes.js";
import reminderScheduler from "./reminderScheduler.js"; // Import the reminder scheduler

import jwt from "jsonwebtoken";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST"]
  }
});

// Store socket mappings (support multiple sockets per user)
const doctorSockets = {};
const patientSockets = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle doctor registration
  socket.on('registerDoctor', (doctorId) => {
    console.log('Doctor registered:', doctorId);
    if (!doctorSockets[doctorId]) doctorSockets[doctorId] = [];
    if (!doctorSockets[doctorId].includes(socket.id)) {
      doctorSockets[doctorId].push(socket.id);
    }
  });

  socket.on('registerPatient', (patientId) => {
    if (!patientId) return;
    patientSockets[patientId] = socket.id; // single latest socket per patient
  });

  socket.on('disconnect', () => {
    Object.keys(doctorSockets).forEach((id) => {
      doctorSockets[id] = doctorSockets[id].filter(sid => sid !== socket.id);
      if (doctorSockets[id].length === 0) delete doctorSockets[id];
    });
    Object.keys(patientSockets).forEach((id) => {
      if (patientSockets[id] === socket.id) delete patientSockets[id];
    });
  });
});

// Make socket instance available to routes
app.set('io', io);
app.set('doctorSockets', doctorSockets);
app.set('patientSockets', patientSockets);

app.use(cors());
app.use(express.json());

// Middleware to authenticate and populate req.user


// Public routes (no token needed)
app.use("/api/appointments" , patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/video-call", videoCallRoutes);


// Protected routes (token required)
// Doctor routes (auth handled inside doctorRoutes.js)
app.use("/api/doctors", doctorRoutes);

  //app.use("/api/appointments", doctorRoutes);

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB Connected');
   reminderScheduler(); // start the cron reminders after DB is connected...............................................................................
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
