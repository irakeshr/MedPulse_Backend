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

  // For nested comments (replies)
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // Null for top-level comments
  },

  // SPECIAL DOCTOR FEATURES
  // If author is a doctor, this is treated as a "Medical Review"
  isMedicalReview: { type: Boolean, default: false },
  
  // Interaction stats
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who liked this comment
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }], // Reports on this comment

  // Gamification
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);