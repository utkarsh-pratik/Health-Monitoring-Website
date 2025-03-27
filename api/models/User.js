import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor"], required: true },

    // Only for doctors
    specialization: { type: String },  
    availableSlots: [
        {
            day: { type: String, required: true }, // e.g., "Monday"
            slots: [{ type: String }] // e.g., ["09:00-11:00", "14:00-16:00"]
        }
    ]
});

const User = mongoose.model("User", UserSchema);

export default User;
