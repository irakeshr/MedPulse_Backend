const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // 1. AUTHORSHIP
  // References 'User' so we can check if author is Patient or Doctor
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // 2. CORE CONTENT
  title: { type: String, required: true, trim: true }, // e.g., "Recurring migraines"
  content: { type: String, required: true }, 
  images: [{ type: String }], // Array of image URLs (if user uploads photos)

  // 3. CLASSIFICATION & METADATA
  community: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Community', 
    require: false
  },
  tags: [{ type: String }], // e.g. ["#Migraine", "#LightSensitivity"]
  
  // 4. MEDICAL FLAGS (Crucial for Doctor Dashboard)
  severity: { 
    type: String, 
    enum: ['Mild', 'Medium', 'High', 'Critical'], 
    default: 'Mild' 
  },
  symptomType: { type: String }, // e.g. "Neurological", "Dermatology"
  
  // 5. PRIVACY & STATUS
  isAnonymous: { type: Boolean, default: false }, // If true, hide author name in frontend
  status: {
    type: String,
    enum: ['open', 'resolved', 'closed'],
    default: 'open'
  },
  
  // 6. INTERACTION STATS
  // We cache these counters here for performance (faster feed loading)
  
  commentCount: { type: Number, default: 0 },
  doctorResponded: { type: Boolean, default: false }, // Triggers the "Doctor Responded" badge
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array of user IDs who liked

}, { timestamps: true });

// Index for search performance (Search symptoms/titles)
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);