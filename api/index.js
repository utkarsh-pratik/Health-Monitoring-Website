// api/index.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';

// Import your routes
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import videoCallRoutes from "./routes/videoCallRoutes.js";
import reminderScheduler from "./reminderScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://health-monitoring-website.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  },
  credentials: true,
};

// Middleware must be defined BEFORE routes
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const io = new Server(httpServer, { cors: corsOptions });
const userSockets = {};

io.on('connection', (socket) => {
  const registerUser = (userId) => {
    if (!userSockets[userId]) userSockets[userId] = [];
    userSockets[userId].push(socket.id);
  };
  socket.on('registerDoctor', (doctorId) => registerUser(doctorId));
  socket.on('registerPatient', (patientId) => registerUser(patientId));
  socket.on('disconnect', () => {
    for (const userId in userSockets) {
      userSockets[userId] = userSockets[userId].filter(id => id !== socket.id);
      if (userSockets[userId].length === 0) delete userSockets[userId];
    }
  });
});

app.set('io', io);
app.set('userSockets', userSockets);

// 1. Define API Routes FIRST
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/video-call", videoCallRoutes);

// 2. Serve static files from the React app for production
app.use(express.static(path.join(__dirname, '../client/dist')));

// 3. The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('✅ MongoDB Connected');
    reminderScheduler();
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

