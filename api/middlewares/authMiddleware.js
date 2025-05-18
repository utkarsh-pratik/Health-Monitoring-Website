// authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to authenticate users based on JWT
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Decoded token:", decoded);

    // Attach user info to request
    req.user = {
      _id: decoded.id || decoded._id,  // based on what you encoded
      role: decoded.role,
      name: decoded.name,
     contact: decoded.contact,


    };

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to authorize only doctors
export const verifyDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Only doctors can perform this action." });
  }
};
