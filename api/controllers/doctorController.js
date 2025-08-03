import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";

// CREATE doctor profile (listing)
export const createDoctorListing = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name, specialty, description, consultationFees,
      qualifications, yearsOfExperience, contactNumber,
      clinicName, clinicAddress, registrationNumber,
      gender, languages, linkedIn, awards, services
    } = req.body;

    // Handle languages as array
    const languagesArray = Array.isArray(languages)
      ? languages
      : (typeof languages === "string"
          ? languages.split(",").map(l => l.trim()).filter(Boolean)
          : []);

    const doctorData = {
      name,
      specialty,
      description,
      consultationFees,
      qualifications,
      yearsOfExperience,
      contactNumber,
      clinicName,
      clinicAddress,
      registrationNumber,
      gender,
      languages: languagesArray,
      linkedIn,
      awards,
      services,
      imageUrl: req.file?.path,
      userRef: userId,
    };

    // Prevent duplicate listing for same user
    const existing = await Doctor.findOne({ userRef: userId });
    if (existing) {
      return res.status(400).json({ message: "Doctor profile already exists. Please edit your profile instead." });
    }

    const doctor = new Doctor(doctorData);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create doctor profile" });
  }
};

// GET doctor profile for logged-in doctor
export const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE doctor profile for logged-in doctor
export const updateDoctorProfile = async (req, res) => {
  try {
    console.log("Updating doctor profile for user:", req.user._id);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const {
      name, 
      specialty, description, consultationFees,
      qualifications, yearsOfExperience, contactNumber,
      clinicName, clinicAddress, registrationNumber,
      gender, languages, linkedIn, awards, services
    } = req.body;

    const updates = {
      specialty,
      description,
      consultationFees,
      qualifications,
      yearsOfExperience,
      contactNumber,
      clinicName,
      clinicAddress,
      registrationNumber,
      gender,
      linkedIn,
      awards,
      services,
    };

    const allowedGenders = ["Male", "Female", "Other"];
if (!allowedGenders.includes(updates.gender)) {
  delete updates.gender;
}

    // Handle languages as array
    updates.languages = Array.isArray(languages)
      ? languages
      : (typeof languages === "string"
          ? languages.split(",").map(l => l.trim()).filter(Boolean)
          : []);

    // If image uploaded
    if (req.file && req.file.path) {
      updates.imageUrl = req.file.path;
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userRef: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      console.log("No doctor found for userRef:", req.user._id);
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json(doctor);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create doctor profile" });
  }
};

// (Optional) GET all doctors (for listing/search)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvailableDoctors = async (req, res) => {
  try {
    const { name, specialty, maxFee, day, slotTime } = req.query;
    const filter = {
      availability: { $exists: true, $ne: [] } // Only doctors with at least one slot
    };

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }
    if (specialty) {
      filter.specialty = { $regex: specialty, $options: "i" };
    }
    if (maxFee) {
      filter.consultationFees = { $lte: Number(maxFee) };
    }
    if (day) {
      filter['availability.day'] = day;
    }

    let doctors = await Doctor.find(filter);

    // Further filter by slotTime if provided
    if (slotTime && day) {
      doctors = doctors.filter(doc => {
        const daySlot = doc.availability.find(d => d.day === day);
        if (!daySlot) return false;
        return daySlot.slots.some(slot =>
          slot.start <= slotTime && slot.end > slotTime
        );
      });
    }

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
    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ appointments: doctor.appointments || [] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Set availability for the logged-in doctor
export const setAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userRef: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Expecting availability in req.body.availability (array of slots)
    doctor.availability = req.body.availability;
    await doctor.save();

    res.json({ message: "Availability updated successfully", availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { apptId } = req.params;
    const { status, reason } = req.body;

    const doctor = await Doctor.findOne({ 'appointments._id': apptId });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = doctor.appointments.id(apptId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status || appointment.status;
    if (reason) appointment.reason = reason;
    
    // If appointment is confirmed, set the amount and payment status
    if (status === 'Confirmed') {
      appointment.amount = doctor.consultationFees;
      appointment.paymentStatus = 'Pending';
    }
    
    await doctor.save();

    // --- Socket.IO Notification to Patient ---
    const io = req.app.get("io");
    const patientSockets = req.app.get("patientSockets");
    const patientId = appointment.patientRef?.toString();
    const patientSocketId = patientSockets[patientId];
    if (patientSocketId) {
      io.to(patientSocketId).emit("appointmentStatus", {
        status: appointment.status,
        reason: appointment.reason,
        doctorName: doctor.name,
        appointmentTime: appointment.appointmentTime,
        paymentRequired: status === 'Confirmed',
        amount: appointment.amount,
      });
    }
    // --- End Notification ---

    res.json({ message: "Appointment status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/doctors/:doctorId/slots?date=YYYY-MM-DD
export const getDoctorSlotsForDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // e.g., "2024-06-10"
    if (!date) return res.status(400).json({ message: "Date is required" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Get weekday name from date
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    // Find slots for that day
    const daySlot = doctor.availability.find(d => d.day === dayName);
    const slots = daySlot ? daySlot.slots : [];

    // Find booked slots for that date
    const booked = doctor.appointments
      .filter(appt => {
        const apptDate = new Date(appt.appointmentTime);
        return (
          apptDate.toISOString().slice(0, 10) === date &&
          appt.status !== 'Cancelled' && appt.status !== 'Rejected'
        );
      })
      .map(appt => {
        // Extract start time in "HH:MM" (24h) format
        const apptTime = new Date(appt.appointmentTime);
        return apptTime.toTimeString().slice(0, 5);
      });

    res.json({ slots, booked });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
