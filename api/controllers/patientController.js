// api/controllers/patientController.js

import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const patient = await Patient.findById(req.user._id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Update text fields
    Object.assign(patient, req.body);

    // Update image if a new one is provided
    if (req.file) {
      patient.photo = req.file.path;
    }

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    console.error("Update Patient Profile Error:", error);
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
      amount: doctor.consultationFees,
    };

    doctor.appointments.push(appointmentData);
    await doctor.save();

    // Notify doctor via Socket.IO
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    // FIX: Use the doctor's main user ID (userRef) for notifications
    const doctorUserId = doctor.userRef.toString();
    const doctorSocketIds = userSockets[doctorUserId] || [];

    if (doctorSocketIds.length > 0) {
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
    console.error("Book Appointment Error:", error);
    res.status(500).json({ message: 'Server error during booking' });
  }
};

// GET my appointments (patient)
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;
    const doctors = await Doctor.find({ 'appointments.patientRef': patientId });
    const myAppointments = doctors.flatMap(doc =>
      doc.appointments
        .filter(appt => appt.patientRef && appt.patientRef.toString() === patientId.toString())
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
export const analyzeReport = async (req, res) => {
  // 1. Check if the ML service URL is configured in Render's environment variables
  if (!process.env.ML_SERVICE_URL) {
    console.error("ML_SERVICE_URL environment variable not set.");
    return res.status(503).json({ error: "Analysis feature is not configured by the server administrator." });
  }

  // 2. Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: "No report file uploaded." });
  }

  try {
    // 3. Prepare the file to be sent to the Python service
    const form = new FormData();
    // The buffer contains the raw file data from the user's upload
    form.append('report', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // 4. Make a request from your Node.js backend to your new Python backend
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze`,
      form,
      { headers: form.getHeaders() }
    );

    // 5. Send the result from the ML service back to the user's browser
    res.json(mlResponse.data);

  } catch (error) {
    // This will catch errors if the Python service is down or returns an error
    console.error("Error calling ML service:", error.response ? error.response.data : error.message);
    const statusCode = error.response ? error.response.status : 500;
    const message = error.response?.data?.error || "An error occurred during analysis.";
    res.status(statusCode).json({ error: message });
  }
};
