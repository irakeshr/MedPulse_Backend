const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:{type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // This role determines which profile to load (Patient or Doctor)
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin'], 
    default: 'patient' 
  },
  
  // Common for everyone
  profilePicture: { type: String }, // e.g. "avatar.jpg"
  isVerified: { type: Boolean, default: false }, // Email verification
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);