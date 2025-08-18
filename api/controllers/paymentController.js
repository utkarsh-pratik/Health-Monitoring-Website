// api/controllers/paymentController.js

import razorpay from '../config/razorpay.js';
import Doctor from '../models/Doctor.js';
import crypto from 'crypto';

// Create Razorpay order
export const createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user._id;

    const doctor = await Doctor.findOne({ 'appointments._id': appointmentId });
    if (!doctor) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = doctor.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientRef.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (appointment.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Appointment must be confirmed before payment' });
    }

    if (appointment.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'This appointment has already been paid for' });
    }

    const options = {
      amount: appointment.amount * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: `receipt_appt_${appointmentId}`,
    };

    const order = await razorpay.orders.create(options);
    appointment.orderId = order.id;
    await doctor.save();

    res.json({
      order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const patientId = req.user._id;

    const doctor = await Doctor.findOne({ 'appointments._id': appointmentId });
    if (!doctor) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = doctor.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientRef.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      appointment.paymentStatus = 'Failed';
      await doctor.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Payment successful
    appointment.paymentStatus = 'Paid';
    appointment.paymentId = razorpay_payment_id;
    await doctor.save();

    // Notify doctor in real-time
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const doctorId = doctor._id.toString(); // Use the Doctor document's ID
    const sockets = userSockets[doctorId] || [];
    
    sockets.forEach((sid) => {
      io.to(sid).emit('paymentReceived', {
        patientName: appointment.patientName,
        amount: appointment.amount,
        paymentId: razorpay_payment_id,
        appointmentId: appointment._id,
      });
    });

    res.json({
      success: true,
      message: 'Payment successful',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user._id;

    const doctor = await Doctor.findOne({ 'appointments._id': appointmentId });
    if (!doctor) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = doctor.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientRef.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json({
      paymentStatus: appointment.paymentStatus,
      paymentId: appointment.paymentId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get payment status' });
  }
};

