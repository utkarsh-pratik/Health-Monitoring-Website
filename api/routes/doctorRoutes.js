import express from "express";
import {
  setAvailability,
  getAvailableDoctors,
  createDoctorListing,
  //tAvailableDoctors//nt this for /availability/:doctorId
} from "../controllers/doctorController.js";
import { verifyDoctor, authenticate } from "../middlewares/authMiddleware.js";
import parser from "../middlewares/multerCloudinary.js";

const router = express.Router();

router.post("/set-availability", authenticate, verifyDoctor, setAvailability);

// Route to get availability of a specific doctor by ID
router.get("/availability/:doctorId", getAvailableDoctors);

// Route to create a doctor listing with image upload
router.post("/create-listing", authenticate, verifyDoctor, parser.single('image'), createDoctorListing);

// Route to get all currently available doctors based on current server time
router.get("/available", getAvailableDoctors);

export default router;
