const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Dynamic Reference to handle Posts, Articles, or Doctors
  itemType: { 
    type: String, 
    enum: ['Post', 'Article', 'DoctorProfile'], 
    required: true 
  },
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'itemType', // Mongoose dynamic reference magic
    required: true 
  },
  
  note: { type: String } // Optional: User can add a private note to the bookmark

}, { timestamps: true });

// Ensure a user can't save the same item twice
savedItemSchema.index({ user: 1, item: 1, itemType: 1 }, { unique: true });

module.exports = mongoose.model('SavedItem', savedItemSchema);