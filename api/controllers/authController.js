// api/controllers/authController.js

import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// SIGNUP Controller
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["patient", "doctor"].includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role. Must be 'patient' or 'doctor'" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use. Please log in." });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new User
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase(),
    });
    await newUser.save();

    // 5. Create corresponding Patient or Doctor profile
    if (newUser.role === "patient") {
      // CORRECTED: The Patient model only requires the _id to link to the User.
      const newPatient = new Patient({ _id: newUser._id });
      await newPatient.save();
    } else if (newUser.role === "doctor") {
      const newDoctor = new Doctor({
        userRef: newUser._id,
        name: newUser.name,
        email: newUser.email,
        specialty: "Not specified",
        description: "No description provided.",
        consultationFees: 0,
      });
      await newDoctor.save();
    }

    res.status(201).json({ message: "User registered successfully. Please log in." });

  } catch (error) {
    // Log the specific validation error for debugging
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// LOGIN Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Find the corresponding Doctor or Patient ID
    let doctorId = null;
    let patientId = null;

    if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userRef: user._id });
      if (doctorProfile) doctorId = doctorProfile._id;
    } else if (user.role === "patient") {
      const patientProfile = await Patient.findById(user._id);
      if (patientProfile) patientId = patientProfile._id;
    }

    // 4. Generate JWT Token
    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Send response with all required data
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId,   // Included for the frontend
        patientId,  // Included for the frontend
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};


// GET PROFILE Controller
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
