import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reminderScheduler from "./reminderScheduler.js"; // Import the reminder scheduler

import jwt from "jsonwebtoken";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, { // This is the line to add
  cors: {
    origin: [
      "http://localhost:5173",
      "https://health-monitoring-website.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://health-monitoring-website.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

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

  // Handle patient registration
  socket.on('registerPatient', (patientId) => {
    console.log('Patient registered:', patientId);
    if (!patientSockets[patientId]) patientSockets[patientId] = [];
    if (!patientSockets[patientId].includes(socket.id)) {
      patientSockets[patientId].push(socket.id);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove from mappings
    Object.keys(doctorSockets).forEach(key => {
      doctorSockets[key] = doctorSockets[key].filter(id => id !== socket.id);
      if (doctorSockets[key].length === 0) delete doctorSockets[key];
    });
    Object.keys(patientSockets).forEach(key => {
      patientSockets[key] = patientSockets[key].filter(id => id !== socket.id);
      if (patientSockets[key].length === 0) delete patientSockets[key];
    });
  });
});

// Make socket mappings available to routes
app.set('io', io);
app.set('doctorSockets', doctorSockets);
app.set('patientSockets', patientSockets);

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to authenticate and populate req.user


// Public routes (no token needed)
app.use("/api/appointments" , patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/payment", paymentRoutes);


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
