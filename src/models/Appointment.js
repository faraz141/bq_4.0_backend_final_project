const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
  },
  status: {
    type: String,
    enum: ['scheduled', 'attended', 'missed', 'cancelled'],
    default: 'scheduled',
  },
  reason: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ department: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
