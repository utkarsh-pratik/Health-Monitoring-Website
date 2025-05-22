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

  const { name, specialty, maxFee } = req.query;

  try {
    const doctors = await Doctor.find();

    const availableDoctors = doctors.filter((doctor) => {
      // Find the doctor's availability for the current day (currentDay)
      const availabilityForDay = doctor.availability.find((d) => d.day === currentDay);
      if (!availabilityForDay) return false; // No availability for the current day

      // Check if any slot is available during the current time
      const isAvailableAtTime = availabilityForDay.slots.some((slot) => {
        const startTime = slot.start;
        const endTime = slot.end;

        // Check if the current time falls within the start and end times of the slot
        return currentTime >= startTime && currentTime <= endTime;
      });

      if (!isAvailableAtTime) return false; // Doctor not available at current time

      // Apply filters for name, specialty, and maxFee
      if (name && !doctor.name.toLowerCase().includes(name.toLowerCase())) return false;

      // Handle specialty filter with case-insensitive comparison
      if (specialty) {
        const doctorSpecialty = doctor.specialty.toLowerCase().trim();
        const userSpecialty = specialty.toLowerCase().trim();
        if (!doctorSpecialty.includes(userSpecialty)) return false;
      }

      if (maxFee && Number(doctor.consultationFees) > Number(maxFee)) return false;

      return true; // Doctor is available at the current time and meets filter criteria
    });

    res.status(200).json(availableDoctors); // Return the list of available doctors
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



// Update appointment status (Accept / Cancel)
// ✅ UPDATED: Update appointment status (Accept / Cancel)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { apptId } = req.params;
    const { reason, status } = req.body;

    // ✅ Validate status value
    if (!['Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // ✅ Find the doctor
    const doctor = await Doctor.findOne({ userRef: doctorId });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // ✅ Find the embedded appointment
    const appointment = doctor.appointments.id(apptId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // ✅ Update fields
    appointment.status = status;
    appointment.rejectionReason = reason || '';
    appointment.updatedAt = new Date();

    doctor.markModified('appointments');
    await doctor.save();

    // ✅ Re-fetch updated doctor and appointment from DB
    const updatedDoctor = await Doctor.findOne({ userRef: doctorId });
    const updatedAppointment = updatedDoctor.appointments.id(apptId);

    // ✅ Send updated appointment
    res.json({
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
