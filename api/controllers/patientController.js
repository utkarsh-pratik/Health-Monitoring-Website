import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js"; // Assuming you have a Patient model
//port AppointMent from "../models/Appointment.js"; // Assuming you have an Appointment model
import User from '../models/User.js';

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






export const postHistory = async (req, res) => {
  const { answers } = req.body;
  const patientId = req.user._id;

  console.log("Patient ID:", patientId);
  console.log("Answers:", answers);

  try {
    // Format answers into array of { question, answer }
    const formattedHistory = Object.entries(answers).map(([question, answer]) => ({
      question,
      answer,
    }));

    // Try to find existing patient
    let patient = await Patient.findById(patientId);

    if (!patient) {
      // If patient doesn't exist, fetch from User
      const user = await User.findById(patientId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Create new Patient entry
      patient = new Patient({
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        medicalHistory: formattedHistory,
      });

      console.log("🆕 Created new patient record.");
    } else {
      // If exists, update medical history
      patient.medicalHistory = formattedHistory;
      console.log("✏️ Updated existing patient record.");
    }

    await patient.save();
    res.status(200).json({ message: "Medical history saved successfully." });

  } catch (error) {
    console.error("❌ Save error:", error);
    res.status(500).json({ error: "Failed to save medical history." });
  }
};
