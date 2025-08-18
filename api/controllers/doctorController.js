// api/controllers/doctorController.js

import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

// CREATE doctor profile (listing)
export const createDoctorListing = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, specialty, description, consultationFees } = req.body;

    if (!name || !specialty || !description || consultationFees == null) {
      return res.status(400).json({ message: "Name, specialty, description, and consultation fees are required." });
    }

    const existingProfile = await Doctor.findOne({ userRef: userId });
    if (existingProfile) {
      return res.status(400).json({ message: "Doctor profile already exists. Please edit instead." });
    }

    const doctorData = { ...req.body, userRef: userId };
    if (req.file) {
      doctorData.imageUrl = req.file.path;
    }

    const doctor = new Doctor(doctorData);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    console.error("createDoctorListing error:", error);
    res.status(500).json({ message: "Failed to create doctor profile" });
  }
};

// GET doctor profile for logged-in doctor
export const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id }).lean();
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE doctor profile for logged-in doctor
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    // Update text fields
    Object.assign(doctor, req.body);

    // Update image if a new one is provided
    if (req.file) {
      doctor.imageUrl = req.file.path;
    }

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (e) {
    console.error("updateDoctorProfile error:", e);
    res.status(500).json({ message: "Failed to update doctor profile" });
  }
};

// GET all available doctors with filters
export const getAvailableDoctors = async (req, res) => {
  try {
    const { name, specialty, maxFee, day } = req.query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (specialty) filter.specialty = { $regex: specialty, $options: "i" };
    if (maxFee) filter.consultationFees = { $lte: Number(maxFee) };
    if (day) filter['availability.day'] = day;
    
    const doctors = await Doctor.find(filter);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get patient history for a given patientId
export const getPatientHistory = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ history: patient.medicalHistory || [] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get scheduled appointments for the logged-in doctor
export const getScheduledAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id }).populate('appointments.patientRef', 'name email');
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ appointments: doctor.appointments || [] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Set availability for the logged-in doctor
export const setAvailability = async (req, res) => {
  try {
    const newSlotsArray = req.body?.availability;
    if (!Array.isArray(newSlotsArray) || newSlotsArray.length === 0) {
      return res.status(400).json({ message: "No new availability slots provided" });
    }

    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // FIX: Correctly process the flat array of slots from the frontend
    newSlotsArray.forEach(newSlot => {
      const { day, start, end } = newSlot;
      if (!day || !start || !end) return; // Skip invalid slots
      
      const existingDay = doctor.availability.find(d => d.day === day);
      if (existingDay) {
        const slotExists = existingDay.slots.some(s => s.start === start && s.end === end);
        if (!slotExists) {
          existingDay.slots.push({ start, end });
        }
      } else {
        doctor.availability.push({ day, slots: [{ start, end }] });
      }
    });

    await doctor.save();
    res.json({ message: "Availability updated successfully", availability: doctor.availability });
  } catch (error) {
    console.error("setAvailability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { apptId } = req.params;
    const { status, reason } = req.body;

    const doctor = await Doctor.findOne({ 'appointments._id': apptId });
    if (!doctor) return res.status(404).json({ message: "Appointment not found" });

    const appointment = doctor.appointments.id(apptId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status || appointment.status;
    if (status === 'Cancelled' || status === 'Rejected') {
      appointment.rejectionReason = reason || 'Not specified';
    }
    if (status === 'Confirmed') {
      appointment.amount = doctor.consultationFees;
      appointment.paymentStatus = 'Pending';
    }

    await doctor.save();

    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    const patientId = appointment.patientRef?.toString();

    if (patientId && userSockets[patientId]) {
      userSockets[patientId].forEach(socketId => {
        io.to(socketId).emit("appointmentStatus", {
          status: appointment.status,
          reason: appointment.rejectionReason || '',
          doctorName: doctor.name,
          appointmentTime: appointment.appointmentTime,
          paymentRequired: status === 'Confirmed',
          amount: appointment.amount,
          _id: appointment._id
        });
      });
    }

    res.json({ message: "Appointment status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get doctor slots for a specific date
export const getDoctorSlotsForDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const daySlot = doctor.availability.find(d => d.day === dayName);
    const slots = daySlot ? daySlot.slots : [];

    const booked = doctor.appointments
      .filter(appt => new Date(appt.appointmentTime).toISOString().slice(0, 10) === date && appt.status !== 'Cancelled' && appt.status !== 'Rejected')
      .map(appt => new Date(appt.appointmentTime).toTimeString().slice(0, 5));

    res.json({ slots, booked });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

