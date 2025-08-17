import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// GET patient profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.photo = req.file.path; // From Cloudinary
    }
    const patient = await Patient.findByIdAndUpdate(req.user._id, updates, { new: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// GET favorite doctors
export const getFavorites = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id).populate('favorites');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ favorites: patient.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD a doctor to favorites
export const addDoctorToFavorites = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patient = await Patient.findById(req.user._id);
    if (!patient.favorites.includes(doctorId)) {
      patient.favorites.push(doctorId);
      await patient.save();
    }
    res.status(200).json({ message: 'Doctor added to favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// REMOVE a doctor from favorites
export const removeDoctorFromFavorites = async (req, res) => {
  try {
    const { doctorId } = req.body;
    await Patient.findByIdAndUpdate(req.user._id, { $pull: { favorites: doctorId } });
    res.status(200).json({ message: 'Doctor removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST medical history
export const postHistory = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    // Assuming 'answers' is an object of {question: answer}
    const historyEntries = Object.entries(req.body.answers).map(([question, answer]) => ({ question, answer }));
    patient.medicalHistory.push(...historyEntries);
    await patient.save();
    res.status(200).json({ message: 'History saved', history: patient.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// BOOK an appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientName, patientContact, appointmentTime, reason } = req.body;
    const patientId = req.user._id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointmentData = {
      patientName,
      patientContact,
      appointmentTime,
      reason,
      patientRef: patientId,
    };

    doctor.appointments.push(appointmentData);
    await doctor.save();

    // Notify doctor via Socket.IO
    const io = req.app.get('io');
    const doctorSockets = req.app.get('doctorSockets');
    const doctorSocketIds = doctorSockets[doctor.userRef.toString()];
    if (doctorSocketIds && doctorSocketIds.length > 0) {
      doctorSocketIds.forEach(socketId => {
        io.to(socketId).emit('newAppointment', {
          patientName,
          appointmentTime,
          reason,
        });
      });
    }

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET my appointments (patient)
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    const doctors = await Doctor.find({ 'appointments.patientRef': patientId });
    const myAppointments = doctors.flatMap(doc =>
      doc.appointments
        .filter(appt => appt.patientRef.toString() === patientId.toString())
        .map(appt => ({
          ...appt.toObject(),
          doctorName: doc.name,
          doctorSpecialty: doc.specialty,
          doctorImage: doc.imageUrl,
        }))
    );
    res.json(myAppointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Analyze report (ML)
export const analyzeReport = (req, res) => {
  // FIX: Disable the ML feature temporarily to prevent server crashes.
  // The Python environment is not available in the Node.js deployment container.
  // This feature needs to be deployed as a separate Python microservice.
  console.warn("analyzeReport feature is disabled in this deployment.");
  return res.status(503).json({ 
    error: "The report analysis feature is temporarily unavailable. We are working on it!" 
  });

  /*
  // Original code that will crash in production:
  const pythonProcess = spawn('python', ['path/to/your/script.py', ...]);
  ...
  */
};
