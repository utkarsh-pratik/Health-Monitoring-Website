import express from "express";
import { bookAppointment } from "../controllers/patientController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {getMyAppointments} from "../controllers/patientController.js";
import {postHistory} from "../controllers/patientController.js";
import {addDoctorToFavorites} from "../controllers/patientController.js";
const router = express.Router();

// Patient books appointment with a doctor
router.post("/book-appointment/:doctorId",authenticate,bookAppointment);
router.get("/getmyappointments" , authenticate ,getMyAppointments);
router.post("/post-history",authenticate,postHistory);
// Add Doctor to Favorites
// router.post('/add', authenticate,addToFavorites);

// // Remove Doctor from Favorites
// router.post('/remove', authenticate,removeFromFavorites);

// // Get All Favorites



export default router;
