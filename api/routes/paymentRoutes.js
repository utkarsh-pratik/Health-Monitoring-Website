import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
} from '../controllers/paymentController.js';

const router = express.Router();

// Create payment order
router.post('/create-order/:appointmentId', authenticate, createPaymentOrder);

// Verify payment
router.post('/verify/:appointmentId', authenticate, verifyPayment);

// Get payment status
router.get('/status/:appointmentId', authenticate, getPaymentStatus);

export default router;
