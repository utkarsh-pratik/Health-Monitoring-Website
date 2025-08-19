// api/routes/patientRoutes.js

import express from 'express';
import {
  getPatientProfile,
  updatePatientProfile,
  getFavorites,
  addDoctorToFavorites,
  removeDoctorFromFavorites,
  postHistory,
  bookAppointment,
  getMyAppointments,
  analyzeReport,
} from '../controllers/patientController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
// FIX: Corrected the import path to point to the multer middleware
import parser from '../middlewares/multerCloudinary.js'; 
import multer from 'multer';

const router = express.Router();

// Create a new multer instance that stores files in memory for the ML feature
const memoryStorage = multer.memoryStorage();
const uploadInMemory = multer({ storage: memoryStorage });

// Profile routes (uses Cloudinary for photos)
router.get('/profile', authenticate, getPatientProfile);
router.put('/profile', authenticate, parser.single('photo'), updatePatientProfile);

// Favorites routes
router.get('/favorites', authenticate, getFavorites);
router.post('/favorites/add', authenticate, addDoctorToFavorites);
router.post('/favorites/remove', authenticate, removeDoctorFromFavorites);

// Medical history routes
router.post('/post-history', authenticate, postHistory);

// Appointment routes
router.post('/book-appointment/:doctorId', authenticate, bookAppointment);
router.get('/getmyappointments', authenticate, getMyAppointments);

// Analyze report route (uses memory storage for analysis)
router.post('/analyze-report', authenticate, uploadInMemory.single('report'), analyzeReport);

export default router;
