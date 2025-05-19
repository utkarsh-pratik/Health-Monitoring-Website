import Doctor from "../models/Doctor.js";
//port AppointMent from "../models/Appointment.js"; // Assuming you have an Appointment model


// controllers/appointmentController.js
// POST /api/patient/book-appointment/:doctorId


export const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientName, patientContact, appointmentTime, reason } = req.body;

    if (!patientName || !patientContact || !appointmentTime) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.appointments.push({
      patientName,
      patientContact,
      appointmentTime: new Date(appointmentTime),
      reason,
      patientRef: req.user._id,
    });

    await doctor.save();

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/appointments/upcoming
//nst Appointment = require('../models/Doctor'); // or wherever you have doctor model

// Get patient’s appointments


export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id; // user from JWT token

    // Step 1: Find all doctors where this user has appointments
    const doctors = await Doctor.find({
      'appointments.patientRef': patientId,
    }).select('name specialty appointments');

    const patientAppointments = [];

    // Step 2: Extract only this patient's appointments from each doctor
    doctors.forEach((doctor) => {
      doctor.appointments.forEach((appt) => {
        if (appt.patientRef && appt.patientRef.toString() === patientId.toString()) {
          patientAppointments.push({
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            appointmentId: appt._id,
            patientName: appt.patientName,
            contact: appt.patientContact,
            date: appt.appointmentTime,
            reason: appt.reason,
            status: appt.status,
          });
        }
      });
    });

    res.status(200).json(patientAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};
