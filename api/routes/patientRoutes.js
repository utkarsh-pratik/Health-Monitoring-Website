// javascript
import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import parser from "../middlewares/multerCloudinary.js";
import {
  getPatientProfile,
  updatePatientProfile,
  addDoctorToFavorites,
  getFavorites,
  removeDoctorFromFavorites,
  postHistory,
  bookAppointment,
  getMyAppointments,
  analyzeReport,
} from "../controllers/patientController.js";

const router = Router();

// Profile
router.get("/profile", authenticate, getPatientProfile);
router.put("/profile", authenticate, parser.single("photo"), updatePatientProfile);

// Favorites
router.get("/favorites", authenticate, getFavorites);
router.post("/favorites/add", authenticate, addDoctorToFavorites);
router.post("/favorites/remove", authenticate, removeDoctorFromFavorites);

// Medical history
router.post("/post-history", authenticate, postHistory);

// Appointments (patient)
router.get("/getmyappointments", authenticate, getMyAppointments);
router.post("/book-appointment/:doctorId", authenticate, bookAppointment);

// ML analyze
router.post("/analyze-report", authenticate, analyzeReport);

export default router;
