import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: String,
  patientContact: String,
  appointmentTime: Date,
  reason: String,
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rejected', 'No-show'], default: 'Pending' },
  rejectionReason: { type: String, default: '' },
  patientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  paymentId: { type: String, default: '' },
  orderId: { type: String, default: '' },
  notifiedTwentyFourHours: { type: Boolean, default: false },
  notifiedOneHour: { type: Boolean, default: false },
}, { timestamps: true });

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
  appointments: [appointmentSchema],
  availability: [timeSlotSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Doctor', doctorSchema);
