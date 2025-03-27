import express from "express";
import { setAvailability, getDoctorAvailability } from "../controllers/doctorController.js";
import { verifyDoctor, authenticate } from "../middleware/authMiddleware.js"; // Middleware to check if user is a doctor

const router = express.Router();

// Route: Set Available Time Slots
router.post("/set-availability", authenticate, verifyDoctor, setAvailability);

// Route: Get Doctor's Availability
router.get("/availability/:doctorId", getDoctorAvailability);

export default router;
