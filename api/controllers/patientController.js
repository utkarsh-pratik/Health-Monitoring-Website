import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js"; // Assuming you have a Patient model
//port AppointMent from "../models/Appointment.js"; // Assuming you have an Appointment model
import User from '../models/User.js';
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
// controllers/appointmentController.js
// POST /api/patient/book-appointment/:doctorId
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientName, patientContact, appointmentTime, reason } = req.body;

    if (!patientName || !patientContact || !appointmentTime) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const apptDate = new Date(appointmentTime);
    if (Number.isNaN(apptDate.getTime()) || apptDate <= new Date()) {
      return res.status(400).json({ message: "Invalid or past appointment time." });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const dayName = apptDate.toLocaleDateString("en-US", { weekday: "long" });
    const daySlot = (doctor.availability || []).find(d => d.day === dayName);
    const timeStr = apptDate.toTimeString().slice(0, 5);
    const fits = daySlot && daySlot.slots.some(s => s.start <= timeStr && s.end > timeStr);
    if (!fits) {
      return res.status(400).json({ message: "Selected time is not within doctor's availability." });
    }

    doctor.appointments.push({ patientName, patientContact, appointmentTime: apptDate, reason, patientRef: req.user._id });
    await doctor.save();

    const io = req.app.get("io");
    const doctorSockets = req.app.get("doctorSockets");
    (doctorSockets[doctorId] || []).forEach(sid => {
      io.to(sid).emit("newAppointment", { patientName, appointmentTime: apptDate, reason });
    });

    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/appointments/upcoming
//nst Appointment = require('../models/Doctor'); // or wherever you have doctor model

// Get patient's appointments


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
            rejectionReason: appt.rejectionReason,
            createdAt: appt.createdAt,
            // Payment information
            paymentStatus: appt.paymentStatus || 'Pending',
            amount: appt.amount || doctor.consultationFees,
            paymentId: appt.paymentId || '',
            orderId: appt.orderId || '',
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
  const { answers, history } = req.body;
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
        userRef: user._id,            // ensure consistent lookups
        name: user.name,
        email: user.email,
        contact: user.contact,
        medicalHistory: [],
      });
      console.log("🆕 Created new patient record.");
    } if (answers && typeof answers === 'object') {
      const formatted = Object.entries(answers).map(([question, answer]) => ({
        question,
        answer,
        createdAt: new Date(),
      }));
      patient.medicalHistory = formatted;
    } else if (typeof history === 'string' && history.trim()) {
      patient.medicalHistory = [
        ...(patient.medicalHistory || []),
        { question: "Patient Notes", answer: history.trim(), createdAt: new Date() },
      ];
    } else {
      return res.status(400).json({ message: "Provide either answers or history text." });
    }

    await patient.save();
    return res.status(200).json({
      message: "Medical history saved successfully.",
      history: patient.medicalHistory,
    });
    
  } catch (error) {
    console.error("❌ Save error:", error);
    res.status(500).json({ error: "Failed to save medical history." });
  }
};



// Add a doctor to the patient's favorites
// export const addToFavorites = async (req, res) => {
//   try {
//     const patientId = req.user_id;
//     const { doctorId } = req.body;

//     if (!doctorId) {
//       return res.status(400).json({ message: "Doctor ID is required." });
//     }

//     // Find the patient
//     const patient = await Patient.findById(patientId);
//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     // Find the doctor
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     if (patient.favorites.includes(doctorId)) {
//       return res.status(400).json({ message: "Doctor is already in favorites" });
//     }

//     patient.favorites.push(doctorId);
//     await patient.save();

//     return res.status(200).json({ message: "Doctor added to favorites", favorites: patient.favorites });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "An error occurred while adding the doctor to favorites" });
//   }
// };


// Add Doctor to Favorites
// Remove a doctor from the patient's favorites
// export const removeFromFavorites = async (req, res) => {
//     try {
//         const { doctorId } = req.body;
//         const patientId = req.user._id;

//         const patient = await Patient.findById(patientId);

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         // Check if doctor is in favorites
//         if (!patient.favorites.includes(doctorId)) {
//             return res.status(400).json({ message: "Doctor is not in favorites" });
//         }

//         // Remove doctor from favorites
//         patient.favorites = patient.favorites.filter((id) => id.toString() !== doctorId);
//         await patient.save();

//         return res.status(200).json({ message: "Doctor removed from favorites" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: error.message });
//     }
// };


// Remove Doctor from Favorites


// Get All Favorite Doctors for a Patient
// export const getFavorites = async (req, res) => {
//     try {
//         const patientId = req.user._id;

//         const patient = await Patient.findById(patientId).populate("favorites", "name specialty");

//         if (!patient) {
//             return res.status(404).json({ message: "Patient not found" });
//         }

//         return res.status(200).json({ favorites: patient.favorites });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: error.message });
//     }
// };


// javascript
export const addDoctorToFavorites = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ message: "Doctor ID is required." });

    let patient = await Patient.findById(req.user._id);
    if (!patient) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });
      patient = await Patient.create({
        _id: user._id, userRef: user._id, name: user.name, email: user.email, favorites: [],
      });
    }

    const already = (patient.favorites || []).some(id => id.toString() === doctorId);
    if (already) return res.status(400).json({ message: "Doctor is already in favorites" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    patient.favorites.push(doctor._id);
    await patient.save();

    return res.json({ success: true, message: "Doctor added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id)
      .populate("favorites", "name specialty imageUrl consultationFees qualifications yearsOfExperience clinicName clinicAddress awards services");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ favorites: patient.favorites || [] });
  } catch (e) {
    console.error("Get favorites error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeDoctorFromFavorites = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patient = await Patient.findById(req.user._id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    patient.favorites = (patient.favorites || []).filter(id => id.toString() !== doctorId);
    await patient.save();
    res.json({ success: true, message: "Doctor removed from favorites" });
  } catch (e) {
    console.error("Remove favorite error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// Get patient profile
export const getPatientProfile = async (req, res) => {
  if (!req.user._id) {
    console.error("❌ req.user._id is missing in getPatientProfile");
    return res.status(400).json({ message: "Invalid user ID in token." });
  }
  let patient = await Patient.findById(req.user._id);
  if (!patient) {
    const user = await User.findById(req.user._id);
    if (!user || !user._id) {
      console.error("❌ User not found or user._id is missing in getPatientProfile");
      return res.status(404).json({ message: "User not found" });
    }
    // Defensive: never create with null/undefined _id
    if (!user._id) {
      return res.status(400).json({ message: "Cannot create patient with null _id" });
    }
    patient = await Patient.create({
      _id: user._id,
      userRef: user._id,
      name: user.name,
      email: user.email,
      // ...other default fields
    });
  }
  res.json(patient);
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  const updates = { ...req.body };
  delete updates.name;
  delete updates.email;
  delete updates.role;

  // Remove gender if empty or invalid
  const allowedGenders = ["Male", "Female", "Other"];
  if (!allowedGenders.includes(updates.gender)) {
    delete updates.gender;
  }
  
    // If photo uploaded, set photo field
    // javascript
  if (req.file) {
    const url = req.file.path || req.file.secure_url || req.file.url;
    if (url) updates.photo = url;
  }
  const patient = await Patient.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
  };

// import path from "path";
// import { exec } from "child_process";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import path from "path";
// import { exec } from "child_process";



export const analyzeReport = (req, res) => {
  console.log("📥 Analyze report triggered");
  console.log("📄 Uploaded file info:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.resolve(req.file.path);
  const scriptPath = path.resolve(__dirname, "../ml/model_predictor.py");

  console.log("📂 Resolved file path:", filePath);

  // Wrap paths in quotes to support spaces in paths
const command = `python3 "${scriptPath}" "${filePath}"`;
  
  exec(command, (err, stdout, stderr) => {
    if (stderr) {
      console.error("⚠️ Python stderr:", stderr);
    }

    console.log("🐍 Raw Python output:", stdout);

    if (err) {
      console.error("❌ Exec error:", err);
      return res.status(500).json({
        error: "Failed to analyze report",
        details: stdout || stderr || err.message,
      });
    }

    try {
      const result = JSON.parse(stdout);
      console.log("✅ Parsed result:", result);
      return res.json(result);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      return res.status(500).json({
        error: "Invalid response from Python script",
        rawOutput: stdout,
      });
    }
  });
};
