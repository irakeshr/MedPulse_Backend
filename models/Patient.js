const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // 1. LINK TO AUTH
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },

  // 2. PROFILE IDENTITY
  displayName: { type: String, required: true }, // "Rakesh R."
  username: { type: String, unique: true }, // "@irakesh.r"
  location: { type: String }, // "KERALA, PKD"
  bio: { type: String }, // "Health enthusiast focused on..."
  dateOfBirth: { type: Date }, // For age calculation in medical contexts
  bloodGroup: { type: String }, // Essential for medical apps

  // 3. GAMIFICATION & STATS
  level: { type: Number, default: 1 }, // "Level 4 Member"
  helpfulVotes: { type: Number, default: 0 }, // "142 Helpful Votes"
  
  // 4. MEDICAL PREFERENCES
  // "My Health Tags" - helps filter the feed
  healthTags: [{ type: String }], // ["Migraine", "Holistic Wellness"]
  
  // 5. COMMUNITY DATA
  // Stores which communities the patient has joined
  joinedCommunities: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community' 
  }],

  // 6. PRIVATE MEDICAL DATA (Optional - only visible to authorized doctors)
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }]

}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);