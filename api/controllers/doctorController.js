import User from "../models/User.js";

// Controller: Set Available Time Slots
export const setAvailability = async (req, res) => {
    try {
        const { doctorId, availableSlots } = req.body;

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
            return res.status(404).json({ message: "Doctor not found" });
        }

        doctor.availableSlots = availableSlots; // Update availability
        await doctor.save();

        res.status(200).json({ message: "Availability updated successfully", availableSlots });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Controller: Get Doctor's Availability
export const getDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ availableSlots: doctor.availableSlots });
    } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
