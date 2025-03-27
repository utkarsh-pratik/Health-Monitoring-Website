import express from "express";
import { signup, login } from "../controllers/authController.js";  // ✅ Use import

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Add the set-availability route
router.post("/doctors/set-availability", (req, res) => {
  const { doctorId, timeSlots } = req.body;
  if (!doctorId || !timeSlots) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Save time slots logic here
  res.status(200).json({ message: "Time slots saved successfully" });
});

export default router;  // ✅ Use export default
