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
    const patientId = req.user.id; // from JWT middleware

    // Find all doctors where patient has an appointment
    const doctors = await AppointMent.find({
      'appointments.patientId': patientId,
    }).select('name appointments');

    // Collect patient appointments from doctors
    const patientAppointments = [];

    doctors.forEach((doctor) => {
      doctor.appointments.forEach((appt) => {
        if (appt.patientId.toString() === patientId) {
          patientAppointments.push({
            doctorName: doctor.name,
            appointmentId: appt._id,
            date: appt.date,
            reason: appt.reason,
            status: appt.status,
          });
        }
      });
    });

    res.json(patientAppointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};


