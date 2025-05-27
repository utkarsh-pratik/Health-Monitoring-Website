import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

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
    const doctors = await Doctor.find(); // You can add filters as needed
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
    await doctor.save();

    res.json({ message: "Appointment status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
