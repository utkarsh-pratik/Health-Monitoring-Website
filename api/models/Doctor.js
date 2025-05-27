import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  patientContact: { type: String, required: true, trim: true },
  appointmentTime: { type: Date, required: true },
  reason: { type: String, trim: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending',
  },
  rejectionReason: { 
    type: String,
     trim: true, 
     default: '' }, // NEW FIELD
  patientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notifiedTwentyFourHours: { type: Boolean, default: false },
  notifiedOneHour: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});


const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String, // e.g. 'Monday', 'Tuesday'
    required: true,
    trim: true,
  },
  slots: [
    {
      start: {
        type: String, // e.g. '09:00'
        required: true,
      },
      end: {
        type: String, // e.g. '12:00'
        required: true,
      },
    },
  ],
});

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  consultationFees: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qualifications: { type: String, trim: true },
  yearsOfExperience: { type: Number, min: 0 },
  contactNumber: { type: String, trim: true },
  clinicName: { type: String, trim: true },
  clinicAddress: { type: String, trim: true },
  registrationNumber: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  languages: [{ type: String, trim: true }],
  linkedIn: { type: String, trim: true },
  awards: { type: String, trim: true },
  services: { type: String, trim: true },
  appointments: [appointmentSchema], // Appointments now include patientRef
  availability: [timeSlotSchema],    // Availability field
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Doctor', doctorSchema);
