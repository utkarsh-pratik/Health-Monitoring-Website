import express from "express";
import {
  setAvailability,
  getAvailableDoctors,
  createDoctorListing,
getScheduledAppointments,
  getPatientHistory,
  updateAppointmentStatus,
  rescheduleAppointment
  //tCreateDoctorListing//nt this for /create-listing
  //tGetAvailableDoctors//nt this for /available
  //tGetPatientHistory//nt this for /patient-history/:patientId


 //tScheduledAppointments//nt this for /scheduled-appointments
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
  
router.get("/scheduled-appointments",authenticate,verifyDoctor,getScheduledAppointments);
router.get('/patient-history/:patientId', authenticate, getPatientHistory);
router.patch('/appointments/:apptId/status', authenticate, updateAppointmentStatus);
router.patch('/appointments/:apptId/reschedule', authenticate, rescheduleAppointment);


export default router;
