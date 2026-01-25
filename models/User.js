const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:{type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // This role determines which profile to load (Patient or Doctor)
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin','unassigned'], 
    default: 'patient' 
  },
  
  // Common for everyone
  stats: {
    approved: {type: String,
      enum: ["pending", "active", "suspended"],
      default: "active"},
    postCount: { type: Number, default: 0 },
    helpfulPostCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  lastLogin:{type:Date},
  lastActive:{ type:Date},
  profilePicture: { type: String }, // e.g. "avatar.jpg"
  isVerified: { type: Boolean, default: false }, // Email verification
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);