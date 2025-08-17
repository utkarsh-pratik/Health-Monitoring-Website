import mongoose from 'mongoose';

// Define a separate schema for medical history entries
const medicalHistorySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false }); // Don't generate a separate _id for each entry

// Main Patient schema
const patientSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true
  },
  photo: { type: String, default: '' },

  password: {
    type: String,
    select: false
  },
  // javascript
favorites: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: [] 
  }],
 
  age: Number,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  contactNumber: String,
  address: String,
  bloodGroup: String,
  emergencyContact: String,
  allergies: String,
  chronicIllnesses: String,
  currentMedications: String,

  medicalHistory: { type: [medicalHistorySchema], default: [] },

  createdAt: {
    type: Date,
    default: Date.now
  },
} , { _id: false }
);

// We need to explicitly tell Mongoose that the _id is not auto-generated.
patientSchema.pre('save', function(next) {
  if (this.isNew) {
    this._id = this.get('_id');
  }
  next();
});

export default mongoose.model('Patient', patientSchema);
