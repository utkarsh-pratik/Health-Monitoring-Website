import dotenv from "dotenv";  // ✅ Import dotenv at the top
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Contact } from "lucide-react";

dotenv.config(); // ✅ Load environment variables after importing dotenv

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ Validate input fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Ensure valid role (either "patient" or "doctor")
    if (!["patient", "doctor"].includes(role.toLowerCase())) {
      return res.status(400).json({ error: "Invalid role. Must be 'patient' or 'doctor'" });
    }

    // ✅ Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use. Please log in." });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase(),
    });

    await newUser.save();

    // ✅ Generate JWT Token — use _id (not id) for consistency
    const token = jwt.sign(
      { _id: newUser._id, role: newUser.role, contact: newUser.email, name: newUser.name }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);  // ✅ Debugging - Log error to console
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ error: "Invalid credentials" });

    // ✅ Use _id in token payload for consistency
    const token = jwt.sign(
      { _id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role.toLowerCase(), // 👈 this is critical
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
};
