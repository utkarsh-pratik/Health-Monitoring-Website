import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor"], required: true },
  // Removed availableSlots from here as it's now in Doctor schema
});

const User = mongoose.model("User", UserSchema);

export default User;
