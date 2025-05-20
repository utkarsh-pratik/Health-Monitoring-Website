import User from "../models/User.js";
import Doctor from "../models/Doctor.js"; // Adjust path as needed
import Patient from "../models/Patient.js"; // Adjust path as needed


export const setAvailability = async (req, res) => {
  try {
    const doctorUserId = req.user._id; // Extracted from auth middleware
    const { availability } = req.body; // <-- Update key name

    const doctor = await Doctor.findOne({ userRef: doctorUserId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    doctor.availability = availability;  // <-- Save to correct field
    doctor.markModified("availability"); // Optional but safe
    await doctor.save();

    res.status(200).json({ message: "Availability updated successfully" });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAvailableDoctors = async (req, res) => {
  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  try {
    const doctors = await Doctor.find();

    const availableDoctors = doctors.filter((doctor) => {
      const today = doctor.availability.find((d) => d.day === currentDay);
      if (!today) return false;

      return today.slots.some((slot) => {
        return currentTime >= slot.start && currentTime <= slot.end;
      });
    });

    res.status(200).json(availableDoctors);
  } catch (err) {
    console.error("Error fetching available doctors:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const createDoctorListing = async (req, res) => {
  try {
    const userId = req.user._id; // from authenticate middleware
    const { name, specialty, description, consultationFees } = req.body;
    const imageUrl = req.file?.path; // multer or cloudinary URL

    // Validate inputs
    if (!name || !specialty || !description || !imageUrl || !consultationFees) {
      return res.status(400).json({ message: "All fields including image are required" });
    }

    // Convert consultationFees to number and validate
    const feesNumber = Number(consultationFees);
    if (isNaN(feesNumber) || feesNumber < 0) {
      return res.status(400).json({ message: "Consultation fees must be a valid non-negative number" });
    }

    const newListing = new Doctor({
      name,
      specialty,
      description,
      consultationFees: feesNumber, // save as Number
      imageUrl,
      userRef: userId,
    });

    await newListing.save();

    res.status(201).json({
      message: "Doctor listing created successfully",
      listing: newListing,
    });
  } catch (error) {
    console.error("❌ Error creating doctor listing:", error);
    res.status(500).json({ message: "Failed to create listing", error: error.message });
  }
};

// doctorController.js



export const getScheduledAppointments = async (req, res) => {
  try {
    const userId = req.user._id; // This is the user ID from token

    // Find doctor by userRef (user ID)
    const doctor = await Doctor.findOne({ userRef: userId }).populate({
      path: 'appointments.patientRef',
      select: '-password -__v',
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ appointments: doctor.appointments });
  } catch (error) {
    console.error('Error fetching scheduled appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// GET /api/doctors/patient-history/:patientId
export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ history: patient.medicalHistory || [] });
  } catch (error) {
    console.error("Error fetching patient history:", error);
    res.status(500).json({ message: "Server error while fetching history" });
  }
};
