import express from "express";
import { signup, login, getProfile } from "../controllers/authController.js"; // Import getProfile
import { authenticate } from "../middlewares/authMiddleware.js"; // Import authenticate middleware

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authenticate, getProfile); // Use authenticate middleware

export default router;
