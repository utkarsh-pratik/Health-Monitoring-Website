// api/models/Patient.js

import mongoose from 'mongoose';

// Schema for individual medical history entries
const medicalHistorySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Main Patient schema
const patientSchema = new mongoose.Schema({
  // The _id of the Patient document will be the same as the User document's _id.
  // This is the link between them.
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photo: { type: String, default: '' },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  }],
  age: { type: Number },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  contactNumber: { type: String },
  address: { type: String },
  bloodGroup: { type: String },
  emergencyContact: { type: String },
  allergies: { type: String },
  chronicIllnesses: { type: String },
  currentMedications: { type: String },
  medicalHistory: {
    type: [medicalHistorySchema],
    default: []
  },
}, {
  // Use the User's _id as the Patient's _id
  _id: false,
  timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model('Patient', patientSchema);
