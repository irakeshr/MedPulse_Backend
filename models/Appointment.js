const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  
  date: { type: Date, required: true }, // The specific date of appointment
  timeSlot: { type: String, required: true }, // e.g. "10:30 AM"
  
  reason: { type: String }, // "Brief description of issue"
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  meetingLink: { type: String } // For video consultation URL
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);