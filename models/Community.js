const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Mental Health"
  slug: { type: String, required: true, unique: true, lowercase: true }, // e.g. "mental-health"
  description: { type: String }, //
  
  icon: { type: String }, // URL for the community icon
  bannerImage: { type: String },
  
  // Stats
  memberCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  
  // Rules (Optional but good for forums)
  rules: [{ 
    title: String, 
    description: String 
  }]

}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);