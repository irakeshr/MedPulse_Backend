const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Parent Post
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  
  // Author
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  authorRole: { // Cached role to quickly render badges (e.g. "Physician" badge)
    type: String, 
    enum: ['patient', 'doctor', 'admin'], 
    required: true 
  },

  content: { type: String, required: true },

  // SPECIAL DOCTOR FEATURES
  // If author is a doctor, this is treated as a "Medical Review"
  isMedicalReview: { type: Boolean, default: false },
  
  // Gamification
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);