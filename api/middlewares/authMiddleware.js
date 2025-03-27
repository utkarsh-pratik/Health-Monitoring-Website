import { findById } from "../models/User";

const verifyDoctor = async (req, res, next) => {
    try {
        const doctor = await findById(req.user.id);
        if (!doctor || doctor.role !== "doctor") {
            return res.status(403).json({ message: "Access denied. Doctors only." });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

export default { verifyDoctor };
