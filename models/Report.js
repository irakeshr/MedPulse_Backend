const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // What is being reported? (A Post, a Comment, or a User)
  targetType: { 
    type: String, 
    enum: ['Post', 'Comment', 'User'], 
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'targetType'
  },
  
  reason: { 
    type: String, 
    enum: ['Spam', 'Harassment', 'Misinformation', 'Inappropriate'],
    required: true 
  },
  description: { type: String }, // Optional details from the reporter
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed'],
    default: 'pending'
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);