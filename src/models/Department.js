const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  headDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Department', departmentSchema);
