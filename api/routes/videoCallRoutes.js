import express from 'express';
import { getTwilioToken, getAppointmentForVideoCall } from '../controllers/videoCallController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get Twilio token for video call
router.post('/get-twilio-token', authenticate, getTwilioToken);

// Get appointment details for video call
router.get('/appointment/:appointmentId', authenticate, getAppointmentForVideoCall);

export default router;
