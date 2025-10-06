const mongoose = require('mongoose');

const hospitalStatisticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  totalAppointments: {
    type: Number,
    default: 0,
  },
  attendedAppointments: {
    type: Number,
    default: 0,
  },
  missedAppointments: {
    type: Number,
    default: 0,
  },
  cancelledAppointments: {
    type: Number,
    default: 0,
  },
  newPatients: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
hospitalStatisticsSchema.index({ date: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('HospitalStatistics', hospitalStatisticsSchema);
