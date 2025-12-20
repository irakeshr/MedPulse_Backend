const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  // 1. LINK TO AUTH
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  // 2. PROFESSIONAL IDENTITY
  fullName: { type: String, required: true }, // "Dr. A. Patel"
  specialization: { type: String, required: true }, // "Cardiologist"
  qualifications: [{ type: String }], // ["MBBS", "MD"]
  experienceYears: { type: Number, required: true },
  
  // 3. VERIFICATION
  licenseNumber: { type: String, required: true, select: false }, // Hidden from public
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },

  // 4. DASHBOARD STATS
  // Used to populate the "Welcome back" dashboard
  stats: {
    pendingReviews: { type: Number, default: 0 },
    casesSolved: { type: Number, default: 0 },
    responseTime: { type: String, default: '2h' } // Average response time
  },

  // 5. SETTINGS
  consultationFee: { type: Number, default: 0 },
  about: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);