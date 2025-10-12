const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Patient ID
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // Single time field as per requirement
  status: { 
    type: String, 
    enum: ['Booked', 'Attended', 'Missed'], 
    default: 'Booked' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for performance optimization
appointmentSchema.index({ doctorId: 1, date: 1 }); // Compound index for doctor's daily schedule
appointmentSchema.index({ userId: 1 }); // For patient's appointment history
appointmentSchema.index({ date: 1 }); // For daily reports
appointmentSchema.index({ status: 1 }); // For status-based queries
appointmentSchema.index({ departmentId: 1 }); // For department-wise reports

module.exports = mongoose.model('Appointment', appointmentSchema);
