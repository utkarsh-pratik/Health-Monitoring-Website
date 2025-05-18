import express from "express";
import { bookAppointment } from "../controllers/patientController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {getMyAppointments} from "../controllers/patientController.js";
const router = express.Router();

// Patient books appointment with a doctor
router.post("/book-appointment/:doctorId",authenticate,bookAppointment);
router.get("/getmyappointments" , authenticate ,getMyAppointments);

export default router;
