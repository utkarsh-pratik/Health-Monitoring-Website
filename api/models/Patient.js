import mongoose from 'mongoose';

// Define a separate schema for medical history entries
const medicalHistorySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
}, { _id: false }); // Don't generate a separate _id for each entry

// Main Patient schema
const patientSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    select: false
  },
  age: Number,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  contactNumber: String,
  address: String,

  // ✅ Corrected here
  medicalHistory: [medicalHistorySchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;



