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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173', //local React app
  'https://health-monitoring-website.onrender.com' // deployed frontend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions)); // Use this for Express routes

const io = new Server(httpServer, {
  cors: corsOptions // And use it for Socket.IO
});

// Store multiple socket IDs per user
const userSockets = {}; // { userId: [socketId1, socketId2, ...] }

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  const registerUser = (userId) => {
    if (!userSockets[userId]) {
      userSockets[userId] = [];
    }
    userSockets[userId].push(socket.id);
    console.log(`[SOCKET] Registered ${userId} with socket ${socket.id}`);
  };

  socket.on('registerDoctor', (doctorId) => registerUser(doctorId));
  socket.on('registerPatient', (patientId) => registerUser(patientId));

  socket.on('disconnect', () => {
    console.log(`🔥: ${socket.id} user disconnected`);
    // Remove the disconnected socket ID
    for (const userId in userSockets) {
      userSockets[userId] = userSockets[userId].filter(id => id !== socket.id);
      if (userSockets[userId].length === 0) {
        delete userSockets[userId];
      }
    }
  });
});

// Make the improved socket maps available to routes
app.set('io', io);
app.set('userSockets', userSockets); // Use a single, unified map

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Middleware to authenticate and populate req.user


// Public routes
app.use("/api/auth", authRoutes);

// Patient-specific routes
app.use("/api/patient", patientRoutes);

// Doctor-specific routes
app.use("/api/doctors", doctorRoutes);

// Payment routes
app.use("/api/payment", paymentRoutes);

// Video call routes
app.use("/api/video-call", videoCallRoutes);

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

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
