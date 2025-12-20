const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  // Array of time slots, e.g., ["09:00", "09:30", "14:00"]
  slots: [{ 
    startTime: String, 
    endTime: String,
    isBooked: { type: Boolean, default: false }
  }]
});

module.exports = mongoose.model('Availability', availabilitySchema);