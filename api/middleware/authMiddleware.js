export const verifyDoctor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  const { role } = req.user;
  if (role === "doctor") {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Only doctors can perform this action." });
};
