// javascript
import express from "express";
import {
  setAvailability,
  getAvailableDoctors,
  createDoctorListing,
  getScheduledAppointments,
  getPatientHistory,
  updateAppointmentStatus,
  getMyProfile,
  getDoctorSlotsForDate,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import { verifyDoctor, authenticate } from "../middlewares/authMiddleware.js";
import parser from "../middlewares/multerCloudinary.js";

const router = express.Router();

// Profile
router.get("/my-profile", authenticate, getMyProfile);
router.put("/my-profile", authenticate, verifyDoctor, parser.single("image"), updateDoctorProfile);
router.post("/create-listing", authenticate, parser.single("image"), createDoctorListing);

// Availability
router.post("/set-availability", authenticate, verifyDoctor, setAvailability);
router.get("/available", getAvailableDoctors);
router.get("/:doctorId/slots", getDoctorSlotsForDate);

// Appointments (doctor)
router.get("/scheduled-appointments", authenticate, verifyDoctor, getScheduledAppointments);
router.patch("/appointments/:apptId/status", authenticate, verifyDoctor, updateAppointmentStatus);

// Patient history (doctor view)
router.get("/patient-history/:patientId", authenticate, verifyDoctor, getPatientHistory);

export default router;
